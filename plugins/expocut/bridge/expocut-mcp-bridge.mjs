#!/usr/bin/env node
/**
 * ExpoCut MCP bridge for Claude Code.
 * Copyright (c) 2026 ExpoCut. Released under the MIT License (see LICENSE).
 *
 * ExpoCut (the mobile video editor) runs an MCP server inside the app on the
 * phone, reachable only over the local network:
 *
 *     POST http://<phone-ip>:7333/mcp   Authorization: Bearer <token>
 *
 * The address changes whenever the phone gets a new DHCP lease and the server
 * is only up while the app is open, so a static `claude mcp add` entry rots
 * quickly. This bridge sits between Claude Code (stdio) and the phone (HTTP):
 *
 *   - it always starts, so Claude Code never shows a failed server;
 *   - it reads the address + token from ~/.expocut/claude-mcp.json (written by
 *     `/expocut:connect`) or from EXPOCUT_MCP_URL / EXPOCUT_MCP_TOKEN;
 *   - when the saved address stops answering it looks for the phone on the
 *     same /24 subnet (fingerprint first, token only to hosts that answer with
 *     ExpoCut's 401 realm) and updates the saved address;
 *   - when the phone is off it serves the last known tool list and returns a
 *     clear "unreachable" tool error instead of a protocol failure;
 *   - it watches the config file and emits `notifications/tools/list_changed`
 *     so a fresh connection shows up without restarting Claude Code.
 *
 * Zero dependencies. Node 18+ (built-in fetch). stdout is reserved for MCP
 * framing; every log line goes to stderr.
 *
 * CLI:
 *   expocut-mcp-bridge.mjs                       serve (stdio MCP, used by .mcp.json)
 *   expocut-mcp-bridge.mjs connect <url> <token> save + verify a connection
 *   expocut-mcp-bridge.mjs status                 show the current connection
 *   expocut-mcp-bridge.mjs discover [--save]      scan the local subnet for ExpoCut
 *   expocut-mcp-bridge.mjs disconnect             forget the saved connection
 */

import { createInterface } from 'node:readline';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { homedir, networkInterfaces } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const VERSION = '0.1.0';
export const DEFAULT_PORT = 7333;
export const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const CONFIG_FILE = 'claude-mcp.json';
export const TOOLS_CACHE_FILE = 'claude-mcp-tools.json';
export const SETTINGS_PATH = 'ExpoCut → Settings → AI Agent (MCP Server)';
// EXPOCUT_HOST=desktop is set by the Claude Desktop extension bundle; pairing
// then happens in the extension's settings instead of a slash command.
export const HOST = process.env.EXPOCUT_HOST === 'desktop' ? 'desktop' : 'claude-code';
export const PAIR_HINT = HOST === 'desktop'
  ? 'enter the Server URL and Bearer Token in Claude Desktop → Settings → Extensions → ExpoCut → Configure'
  : 'run /expocut:connect <url> <token>';

const PROBE_TIMEOUT_MS = 3000;
const LIST_TIMEOUT_MS = 15000;
const CALL_TIMEOUT_MS = 10 * 60 * 1000; // exports can take minutes
const DISCOVERY_TIMEOUT_MS = 1500;
const DISCOVERY_CONCURRENCY = 64;
const EXPOCUT_REALM = 'ExpoCut';

export const CONNECTION_TOOL = {
  name: 'expocut_connection',
  description:
    'Check the connection between Claude Code and the ExpoCut app on the user\'s phone. ' +
    'Returns the saved address, whether ExpoCut is reachable right now, and the setup steps ' +
    'to relay to the user when it is not (open ' + SETTINGS_PATH + ', same Wi-Fi, then ' +
    PAIR_HINT + '). Call this when another ExpoCut tool reports that ' +
    'ExpoCut is unreachable or not connected.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};

const INSTRUCTIONS =
  'These tools run inside the ExpoCut video editor on the user\'s phone or tablet, over the ' +
  'local Wi-Fi network, through a bridge on this computer. Edits apply immediately to the ' +
  'user\'s project and are undoable in the app. If a tool result says ExpoCut is unreachable ' +
  'or not connected, call expocut_connection and relay its steps: open ' + SETTINGS_PATH +
  ', keep the phone awake on the same Wi-Fi, then ' + PAIR_HINT + '. ' +
  'Conventions: time arguments are seconds, positions are 0-100 % of the canvas, call ' +
  'open_project before adding layers, and look up ids with the list_* tools before setters.';

// ─── logging (stderr only) ───────────────────────────────────────────

const DEBUG = process.env.EXPOCUT_BRIDGE_DEBUG === '1';
export const log = {
  debug: (...a) => { if (DEBUG) process.stderr.write(`[expocut-bridge] ${a.join(' ')}\n`); },
  info: (...a) => process.stderr.write(`[expocut-bridge] ${a.join(' ')}\n`),
  warn: (...a) => process.stderr.write(`[expocut-bridge] warning: ${a.join(' ')}\n`),
};

// ─── config ──────────────────────────────────────────────────────────

export function configDir() {
  return process.env.EXPOCUT_CONFIG_DIR || join(homedir(), '.expocut');
}
export function configPath() {
  return join(configDir(), CONFIG_FILE);
}
export function toolsCachePath() {
  return join(configDir(), TOOLS_CACHE_FILE);
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
}

/**
 * Turn whatever the user pasted into the canonical `http://host:port/mcp`.
 * Accepts a bare origin, the console link, or a URL with a trailing slash.
 */
export function normalizeUrl(raw) {
  let url;
  try {
    url = new URL(String(raw).trim());
  } catch {
    throw new Error(`"${raw}" is not a valid URL (expected http://<phone-ip>:${DEFAULT_PORT}/mcp)`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`"${raw}" must start with http:// or https://`);
  }
  url.hash = '';
  url.search = '';
  const path = url.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/') url.pathname = '/mcp';
  else if (path.endsWith('/mcp/console.html')) url.pathname = path.slice(0, -'/console.html'.length);
  else url.pathname = path;
  return url.toString();
}

/**
 * Find a URL and a token in free-form text: `<url> <token>`, the
 * `claude mcp add … --header "Authorization: Bearer …"` line the app shows,
 * the Cursor/VS Code JSON snippet, or the console link (`…#tok=…`).
 */
export function parseConnectInput(text) {
  const src = String(text ?? '').trim();
  let url = null;
  let token = null;

  const urlMatch = src.match(/https?:\/\/[^\s"'<>`]+/i);
  if (urlMatch) {
    let candidate = urlMatch[0].replace(/[),.;\\]+$/, '');
    const tok = candidate.match(/[#?&]tok=([^&\s"']+)/);
    if (tok) token = safeDecode(tok[1]);
    url = normalizeUrl(candidate);
  }

  if (!token) {
    const bearer = src.match(/Bearer\s+([A-Za-z0-9._~+/=-]+)/i);
    if (bearer) token = bearer[1];
  }
  if (!token) {
    const words = src.split(/\s+/).filter(Boolean);
    const loose = words.find(
      (w) => !/^https?:\/\//i.test(w) && /^[A-Za-z0-9._~+/=-]{16,}$/.test(w) && !w.includes('.'),
    );
    if (loose) token = loose;
  }
  return { url, token };
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export async function loadConfig() {
  const envUrl = process.env.EXPOCUT_MCP_URL;
  const envToken = process.env.EXPOCUT_MCP_TOKEN;
  if (envUrl && envToken) {
    return {
      url: normalizeUrl(envUrl),
      token: envToken,
      source: 'env',
      autoDiscover: !['0', 'false'].includes(String(process.env.EXPOCUT_AUTO_DISCOVER ?? '').toLowerCase()),
    };
  }
  const file = await readJson(configPath());
  if (file && typeof file.url === 'string' && typeof file.token === 'string') {
    try {
      return {
        url: normalizeUrl(file.url),
        token: file.token,
        source: 'file',
        autoDiscover: file.autoDiscover !== false,
      };
    } catch (e) {
      log.warn(`ignoring ${configPath()}: ${e.message}`);
    }
  }
  return null;
}

export async function saveConfig({ url, token, autoDiscover }) {
  const existing = (await readJson(configPath())) ?? {};
  const next = {
    url: normalizeUrl(url),
    token,
    autoDiscover: autoDiscover ?? existing.autoDiscover ?? true,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(configPath(), next);
  return next;
}

export async function clearConfig() {
  await rm(configPath(), { force: true });
  await rm(toolsCachePath(), { force: true });
}

// ─── upstream HTTP JSON-RPC ──────────────────────────────────────────

export class UpstreamError extends Error {
  constructor(kind, message, extra = {}) {
    super(message);
    this.kind = kind; // not_configured | unreachable | unauthorized | http | protocol | rpc
    Object.assign(this, extra);
  }
}

function timeoutSignal(timeoutMs, parent) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(new Error(`timed out after ${timeoutMs} ms`)), timeoutMs);
  if (parent) {
    if (parent.aborted) ac.abort(parent.reason);
    else parent.addEventListener('abort', () => ac.abort(parent.reason), { once: true });
  }
  return { signal: ac.signal, done: () => clearTimeout(timer) };
}

function describeFetchError(e, url) {
  const cause = e?.cause ?? e;
  const code = cause?.code || cause?.errno;
  if (e?.name === 'AbortError' || e?.name === 'TimeoutError' || /timed out/i.test(String(e?.message))) {
    return `no answer from ${url} (timed out)`;
  }
  if (code) return `cannot reach ${url} (${code})`;
  return `cannot reach ${url} (${cause?.message || e?.message || 'network error'})`;
}

/** Parse a Streamable-HTTP SSE body and return the JSON-RPC message for `id`. */
function parseSse(text, id) {
  const messages = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block
      .split(/\r?\n/)
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('\n');
    if (!data) continue;
    try {
      messages.push(JSON.parse(data));
    } catch {
      /* ignore non-JSON events */
    }
  }
  return messages.find((m) => m && m.id === id) ?? messages[messages.length - 1] ?? null;
}

/**
 * POST one JSON-RPC message to the phone. Resolves with the parsed response
 * (null for notifications). Throws UpstreamError on transport/auth failure.
 */
export async function postJsonRpc(url, token, message, { timeoutMs = PROBE_TIMEOUT_MS, protocolVersion, signal } = {}) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  if (protocolVersion) headers['mcp-protocol-version'] = protocolVersion;

  const t = timeoutSignal(timeoutMs, signal);
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(message), signal: t.signal });
  } catch (e) {
    throw new UpstreamError('unreachable', describeFetchError(e, url), { cause: e });
  } finally {
    t.done();
  }

  if (res.status === 401 || res.status === 403) {
    throw new UpstreamError('unauthorized', `ExpoCut at ${url} rejected the token (HTTP ${res.status})`, {
      realm: res.headers.get('www-authenticate') || '',
    });
  }
  const text = await res.text();
  if (res.status === 202 || res.status === 204) return null;
  if (!res.ok) {
    throw new UpstreamError('http', `HTTP ${res.status} from ${url}: ${text.slice(0, 200)}`, { status: res.status });
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/event-stream')) return parseSse(text, message.id);
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new UpstreamError('protocol', `non-JSON response from ${url}: ${text.slice(0, 120)}`);
  }
}

function initializeMessage(id = 'bridge-init') {
  return {
    jsonrpc: '2.0',
    id,
    method: 'initialize',
    params: {
      protocolVersion: PROTOCOL_VERSIONS[0],
      capabilities: {},
      clientInfo: { name: 'expocut-claude-bridge', version: VERSION },
    },
  };
}

/** initialize + notifications/initialized against one address. */
export async function handshake(url, token, { timeoutMs = PROBE_TIMEOUT_MS, signal } = {}) {
  const init = await postJsonRpc(url, token, initializeMessage(), { timeoutMs, signal });
  if (!init || init.error || !init.result) {
    const detail = init?.error?.message ? `: ${init.error.message}` : '';
    throw new UpstreamError('protocol', `${url} did not complete the MCP handshake${detail}`);
  }
  const protocolVersion = init.result.protocolVersion || PROTOCOL_VERSIONS[0];
  await postJsonRpc(url, token, { jsonrpc: '2.0', method: 'notifications/initialized' }, { timeoutMs, protocolVersion, signal }).catch(() => {});
  return {
    url,
    token,
    protocolVersion,
    serverInfo: init.result.serverInfo ?? {},
    capabilities: init.result.capabilities ?? {},
  };
}

// ─── discovery ───────────────────────────────────────────────────────

function isPrivateIPv4(o) {
  return o[0] === 10 || (o[0] === 172 && o[1] >= 16 && o[1] <= 31) || (o[0] === 192 && o[1] === 168);
}

/** This machine's private IPv4 addresses (for hints and for scanning). */
export function localIPv4Addresses() {
  const out = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const i of list ?? []) {
      if (i.internal) continue;
      if (i.family !== 'IPv4' && i.family !== 4) continue;
      const o = i.address.split('.').map(Number);
      if (o.length === 4 && isPrivateIPv4(o)) out.push(i.address);
    }
  }
  return [...new Set(out)];
}

/** Every other host in the /24 around each private IPv4 interface. */
export function candidateHosts() {
  const env = process.env.EXPOCUT_DISCOVERY_HOSTS;
  if (env) return env.split(',').map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const addr of localIPv4Addresses()) {
    const o = addr.split('.').map(Number);
    for (let h = 1; h <= 254; h++) {
      if (h === o[3]) continue;
      out.push(`${o[0]}.${o[1]}.${o[2]}.${h}`);
    }
  }
  return [...new Set(out)];
}

/**
 * Look for an ExpoCut server on the local subnet.
 *
 * Two phases so the token is never sprayed across the network: first an
 * unauthenticated probe — only ExpoCut answers 401 with its own realm —
 * then a real handshake against the hosts that matched.
 */
export async function discover({ token, port = DEFAULT_PORT, hosts = candidateHosts(), concurrency = DISCOVERY_CONCURRENCY, timeoutMs = DISCOVERY_TIMEOUT_MS, onMatch } = {}) {
  const targets = hosts.map((h) => (h.includes(':') ? h : `${h}:${port}`));
  const ac = new AbortController();
  let cursor = 0;
  let found = null;

  async function probe(target) {
    const url = `http://${target}/mcp`;
    try {
      await postJsonRpc(url, null, initializeMessage('bridge-probe'), { timeoutMs, signal: ac.signal });
    } catch (e) {
      if (e.kind !== 'unauthorized' || !String(e.realm).includes(EXPOCUT_REALM)) return;
      if (found) return;
      onMatch?.(url);
      if (!token) {
        found = { url, serverInfo: null };
        ac.abort();
        return;
      }
      try {
        const session = await handshake(url, token, { timeoutMs: PROBE_TIMEOUT_MS, signal: ac.signal });
        if (!found) {
          found = { url, serverInfo: session.serverInfo, session };
          ac.abort();
        }
      } catch {
        /* wrong device or token; keep looking */
      }
    }
  }

  async function worker() {
    while (!found && cursor < targets.length) {
      await probe(targets[cursor++]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
  return found;
}

// ─── upstream session management ─────────────────────────────────────

let rpcCounter = 0;

export class Upstream {
  constructor() {
    this.session = null;
    this.pending = null;
    this.lastError = null;
  }

  reset() {
    this.session = null;
  }

  ensure() {
    if (this.session) return Promise.resolve(this.session);
    if (!this.pending) {
      this.pending = this.connect().finally(() => {
        this.pending = null;
      });
    }
    return this.pending;
  }

  async connect() {
    const cfg = await loadConfig();
    if (!cfg) {
      throw (this.lastError = new UpstreamError('not_configured', 'ExpoCut is not connected yet'));
    }
    try {
      this.session = await handshake(cfg.url, cfg.token);
      this.lastError = null;
      return this.session;
    } catch (e) {
      if (e.kind !== 'unreachable' || !cfg.autoDiscover) throw (this.lastError = e);
      log.info(`${e.message}; looking for ExpoCut on the local network…`);
      const port = Number(new URL(cfg.url).port) || DEFAULT_PORT;
      const found = await discover({ token: cfg.token, port });
      if (!found?.session) throw (this.lastError = e);
      log.info(`found ExpoCut at ${found.url}`);
      if (cfg.source === 'file') {
        await saveConfig({ url: found.url, token: cfg.token }).catch((err) => log.warn(`could not save new address: ${err.message}`));
      }
      this.session = found.session;
      this.lastError = null;
      return this.session;
    }
  }

  async request(method, params, { timeoutMs = CALL_TIMEOUT_MS } = {}) {
    const s = await this.ensure();
    const id = `b${++rpcCounter}`;
    let res;
    try {
      res = await postJsonRpc(s.url, s.token, { jsonrpc: '2.0', id, method, params: params ?? {} }, { timeoutMs, protocolVersion: s.protocolVersion });
    } catch (e) {
      if (e.kind === 'unreachable' || e.kind === 'unauthorized') this.reset();
      throw e;
    }
    if (!res) throw new UpstreamError('protocol', `empty response to ${method}`);
    if (res.error) throw new UpstreamError('rpc', res.error.message || 'upstream error', { rpc: res.error });
    return res.result;
  }
}

// ─── human-readable status ───────────────────────────────────────────

function unreachableHelp(url) {
  const mine = localIPv4Addresses();
  const here = mine.length ? ` This computer is on ${mine.join(', ')}.` : '';
  return [
    `ExpoCut is not answering at ${url}.`,
    'Checklist for the user:',
    `  1. Open ExpoCut on the phone and go to ${SETTINGS_PATH}; make sure it is enabled and shows a Server URL.`,
    `  2. Keep the phone awake with ExpoCut in the foreground (the server stops when the app is suspended).`,
    `  3. Phone and computer must be on the same Wi-Fi.${here} Guest networks and "AP isolation" block this.`,
    '  4. On iPhone/iPad, allow Local Network access (Settings → Privacy & Security → Local Network → ExpoCut).',
    `  5. If the address in ExpoCut differs from the one above, ${PAIR_HINT} with the new values.`,
  ].join('\n');
}

export function explainError(e) {
  switch (e?.kind) {
    case 'not_configured':
      if (HOST === 'desktop') {
        return [
          'ExpoCut is not connected to Claude yet.',
          `Ask the user to open ${SETTINGS_PATH}, turn it on, then ${PAIR_HINT}.`,
        ].join('\n');
      }
      return [
        'ExpoCut is not connected to Claude Code yet.',
        `Ask the user to open ${SETTINGS_PATH}, turn it on, and run:`,
        '  /expocut:connect <Server URL> <Bearer Token>',
        '(they can also paste the whole "claude mcp add …" line ExpoCut shows).',
      ].join('\n');
    case 'unauthorized':
      return `${e.message}. The token may have been rotated: copy the current one from ${SETTINGS_PATH} and ${PAIR_HINT} again.`;
    case 'unreachable':
      return unreachableHelp(e.message.match(/https?:\/\/\S+/)?.[0] ?? 'the saved address');
    default:
      return e?.message || String(e);
  }
}

export async function connectionStatus(upstream = new Upstream()) {
  const cfg = await loadConfig();
  const lines = [];
  if (!cfg) {
    lines.push(explainError(new UpstreamError('not_configured', '')));
    return { ok: false, configured: false, text: lines.join('\n') };
  }
  lines.push(`Saved address: ${cfg.url} (${cfg.source === 'env' ? 'from EXPOCUT_MCP_URL' : `from ${configPath()}`})`);
  try {
    const s = await upstream.ensure();
    let toolCount = null;
    try {
      const list = await upstream.request('tools/list', {}, { timeoutMs: LIST_TIMEOUT_MS });
      toolCount = Array.isArray(list?.tools) ? list.tools.length : null;
    } catch {
      /* status still useful without the count */
    }
    const name = [s.serverInfo?.name, s.serverInfo?.version].filter(Boolean).join(' ') || 'ExpoCut';
    lines.push(`Connected: ${name} at ${s.url} (MCP ${s.protocolVersion})${toolCount != null ? `, ${toolCount} tools` : ''}.`);
    return { ok: true, configured: true, url: s.url, serverInfo: s.serverInfo, toolCount, text: lines.join('\n') };
  } catch (e) {
    lines.push(explainError(e));
    return { ok: false, configured: true, url: cfg.url, error: e, text: lines.join('\n') };
  }
}

// ─── stdio MCP server (what .mcp.json launches) ──────────────────────

function textResult(text, isError = false) {
  return { content: [{ type: 'text', text }], isError };
}

function rpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: '2.0', id: id ?? null, error };
}

export function startConfigWatcher(onChange) {
  const dir = configDir();
  let timer = null;
  const fire = () => {
    clearTimeout(timer);
    timer = setTimeout(onChange, 250);
  };
  try {
    const w = watch(dir, { persistent: false }, (_event, filename) => {
      if (!filename || String(filename) === CONFIG_FILE) fire();
    });
    w.on('error', (e) => log.warn(`config watcher: ${e.message}`));
    return w;
  } catch (e) {
    log.warn(`config watcher unavailable: ${e.message}`);
    return null;
  }
}

export async function serve({ input = process.stdin, output = process.stdout } = {}) {
  const upstream = new Upstream();
  const write = (msg) => output.write(JSON.stringify(msg) + '\n');

  await mkdir(configDir(), { recursive: true }).catch(() => {});
  const watcher = startConfigWatcher(() => {
    log.info('connection settings changed; refreshing tools');
    upstream.reset();
    write({ jsonrpc: '2.0', method: 'notifications/tools/list_changed' });
  });

  async function listTools(params) {
    try {
      const s = await upstream.ensure();
      const result = await upstream.request('tools/list', params ?? {}, { timeoutMs: LIST_TIMEOUT_MS });
      const tools = Array.isArray(result?.tools) ? result.tools : [];
      if (!params?.cursor) {
        writeJson(toolsCachePath(), { url: s.url, tools, cachedAt: new Date().toISOString() }).catch(() => {});
        return { ...result, tools: [CONNECTION_TOOL, ...tools.filter((t) => t.name !== CONNECTION_TOOL.name)] };
      }
      return result;
    } catch (e) {
      log.warn(`tools/list: ${e.message}`);
      if (e.kind === 'not_configured') return { tools: [CONNECTION_TOOL] };
      const cache = await readJson(toolsCachePath());
      const cached = Array.isArray(cache?.tools) ? cache.tools : [];
      return { tools: [CONNECTION_TOOL, ...cached.filter((t) => t.name !== CONNECTION_TOOL.name)] };
    }
  }

  async function callTool(id, params) {
    const name = params?.name;
    if (name === CONNECTION_TOOL.name) {
      const status = await connectionStatus(upstream);
      return { jsonrpc: '2.0', id, result: textResult(status.text, !status.ok) };
    }
    try {
      const result = await upstream.request('tools/call', params, { timeoutMs: CALL_TIMEOUT_MS });
      return { jsonrpc: '2.0', id, result };
    } catch (e) {
      if (e.kind === 'rpc') return rpcError(id, e.rpc.code ?? -32000, e.rpc.message, e.rpc.data);
      log.warn(`tools/call ${name}: ${e.message}`);
      return { jsonrpc: '2.0', id, result: textResult(explainError(e), true) };
    }
  }

  async function handle(msg) {
    if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0') {
      return rpcError(msg?.id, -32600, 'invalid request');
    }
    const { id, method, params } = msg;
    if (id === undefined) {
      // notification
      if (method === 'notifications/initialized') upstream.ensure().catch(() => {});
      return null;
    }
    try {
      switch (method) {
        case 'initialize': {
          const asked = params?.protocolVersion;
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
              capabilities: { tools: { listChanged: true } },
              serverInfo: { name: 'expocut', version: VERSION },
              instructions: INSTRUCTIONS,
            },
          };
        }
        case 'ping':
          return { jsonrpc: '2.0', id, result: {} };
        case 'tools/list':
          return { jsonrpc: '2.0', id, result: await listTools(params) };
        case 'tools/call':
          return await callTool(id, params);
        case 'prompts/list':
          return { jsonrpc: '2.0', id, result: { prompts: [] } };
        case 'resources/list':
          return { jsonrpc: '2.0', id, result: { resources: [] } };
        case 'resources/templates/list':
          return { jsonrpc: '2.0', id, result: { resourceTemplates: [] } };
        default: {
          try {
            return { jsonrpc: '2.0', id, result: await upstream.request(method, params, { timeoutMs: LIST_TIMEOUT_MS }) };
          } catch (e) {
            if (e.kind === 'rpc') return rpcError(id, e.rpc.code ?? -32000, e.rpc.message, e.rpc.data);
            return rpcError(id, -32601, `method not available: ${method} (${e.message})`);
          }
        }
      }
    } catch (e) {
      return rpcError(id, -32603, e?.message || String(e));
    }
  }

  const rl = createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      write(rpcError(null, -32700, 'parse error'));
      continue;
    }
    const batch = Array.isArray(parsed) ? parsed : [parsed];
    for (const msg of batch) {
      handle(msg)
        .then((res) => res && write(res))
        .catch((e) => write(rpcError(msg?.id, -32603, e?.message || String(e))));
    }
  }
  watcher?.close();
}

// ─── CLI ─────────────────────────────────────────────────────────────

const USAGE = `ExpoCut MCP bridge ${VERSION}

  connect <url> <token>   save a connection (or paste the whole "claude mcp add …" line
                          / the console link ExpoCut shows) and verify it
  status                  show the saved address and whether ExpoCut answers
  discover [--save]       scan this computer's local subnet for ExpoCut on port ${DEFAULT_PORT}
  disconnect              forget the saved connection
  serve                   run as a stdio MCP server (what Claude Code launches)

Find the Server URL and Bearer Token in ${SETTINGS_PATH}.
Environment: EXPOCUT_MCP_URL + EXPOCUT_MCP_TOKEN override the saved file;
EXPOCUT_CONFIG_DIR changes where it is stored (default ~/.expocut).`;

function out(s) {
  process.stdout.write(s + '\n');
}

async function cliConnect(args) {
  const text = args.join(' ').trim();
  if (!text) {
    out(`Nothing to connect to.\n\nIn ${SETTINGS_PATH}, turn the server on, then run:\n  /expocut:connect <Server URL> <Bearer Token>\nor paste the "claude mcp add …" line ExpoCut shows for Claude Code.`);
    process.exitCode = 2;
    return;
  }
  let parsed;
  try {
    parsed = parseConnectInput(text);
  } catch (e) {
    out(`Could not read that: ${e.message}`);
    process.exitCode = 2;
    return;
  }
  if (!parsed.url) {
    out(`Could not find a server URL in the input. Expected something like http://192.168.1.20:${DEFAULT_PORT}/mcp (shown in ${SETTINGS_PATH}).`);
    process.exitCode = 2;
    return;
  }
  if (!parsed.token) {
    out(`Could not find a bearer token in the input. Copy it from ${SETTINGS_PATH} and run:\n  /expocut:connect ${parsed.url} <Bearer Token>`);
    process.exitCode = 2;
    return;
  }
  if (process.env.EXPOCUT_MCP_URL && process.env.EXPOCUT_MCP_TOKEN) {
    out('Note: EXPOCUT_MCP_URL / EXPOCUT_MCP_TOKEN are set in the environment and take precedence over the saved file.');
  }

  try {
    const s = await handshake(parsed.url, parsed.token);
    await saveConfig({ url: s.url, token: parsed.token });
    const name = [s.serverInfo?.name, s.serverInfo?.version].filter(Boolean).join(' ') || 'ExpoCut';
    let count = '';
    try {
      const up = new Upstream();
      up.session = s;
      const list = await up.request('tools/list', {}, { timeoutMs: LIST_TIMEOUT_MS });
      if (Array.isArray(list?.tools)) count = `, ${list.tools.length} tools available`;
    } catch {
      /* optional */
    }
    out(`Connected to ${name} at ${s.url}${count}.\nSaved to ${configPath()}.\nClaude Code refreshes the ExpoCut tools automatically; if they do not appear within a few seconds, run /mcp and reconnect "expocut", or restart Claude Code.`);
  } catch (e) {
    if (e.kind === 'unauthorized') {
      out(`${explainError(e)}\nNothing was saved.`);
      process.exitCode = 1;
      return;
    }
    if (e.kind === 'unreachable') {
      await saveConfig({ url: parsed.url, token: parsed.token });
      out(`Saved ${parsed.url} to ${configPath()}, but it is not answering right now.\n${unreachableHelp(parsed.url)}\nThe bridge retries on every tool call and will also look for the phone on the local subnet if its address changed.`);
      process.exitCode = 1;
      return;
    }
    out(`Could not connect: ${e.message}\nNothing was saved.`);
    process.exitCode = 1;
  }
}

async function cliStatus() {
  const status = await connectionStatus();
  out(status.text);
  process.exitCode = status.ok ? 0 : 1;
}

async function cliDiscover(args) {
  const save = args.includes('--save');
  const portArg = args[args.indexOf('--port') + 1];
  const tokenArg = args[args.indexOf('--token') + 1];
  const cfg = await loadConfig();
  const token = (args.includes('--token') && tokenArg) || cfg?.token || null;
  const port = (args.includes('--port') && Number(portArg)) || (cfg ? Number(new URL(cfg.url).port) : 0) || DEFAULT_PORT;
  const hosts = candidateHosts();
  if (!hosts.length) {
    out('No private IPv4 network found on this computer; connect to Wi-Fi first.');
    process.exitCode = 1;
    return;
  }
  const subnets = [...new Set(hosts.map((h) => h.split(':')[0].split('.').slice(0, 3).join('.') + '.0/24'))];
  out(`Scanning ${subnets.join(', ')} on port ${port} for ExpoCut${token ? '' : ' (no token saved: will only fingerprint)'}…`);
  const found = await discover({ token, port, onMatch: (url) => out(`  ExpoCut-like server at ${url}`) });
  if (!found) {
    out(`No ExpoCut server found. Make sure ${SETTINGS_PATH} is enabled and the phone is on the same Wi-Fi.`);
    process.exitCode = 1;
    return;
  }
  if (found.session) {
    out(`Found ${[found.serverInfo?.name, found.serverInfo?.version].filter(Boolean).join(' ') || 'ExpoCut'} at ${found.url} (token accepted).`);
    if (save && token) {
      await saveConfig({ url: found.url, token });
      out(`Saved to ${configPath()}.`);
    }
  } else {
    out(`Found an ExpoCut server at ${found.url}. Run /expocut:connect ${found.url} <Bearer Token> to pair it.`);
  }
}

async function cliDisconnect() {
  await clearConfig();
  out(`Removed ${configPath()} and the cached tool list. Claude Code will show only expocut_connection until you run /expocut:connect again.`);
}

async function main(argv) {
  const [cmd = 'serve', ...rest] = argv;
  switch (cmd) {
    case 'serve':
      return serve();
    case 'connect':
      return cliConnect(rest);
    case 'status':
      return cliStatus();
    case 'discover':
      return cliDiscover(rest);
    case 'disconnect':
      return cliDisconnect();
    case 'help':
    case '--help':
    case '-h':
      out(USAGE);
      return;
    default:
      out(`Unknown command "${cmd}".\n\n${USAGE}`);
      process.exitCode = 2;
  }
}

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isEntryPoint) {
  main(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`[expocut-bridge] fatal: ${e?.stack || e}\n`);
    process.exit(1);
  });
}
