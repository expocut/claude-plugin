import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

import { normalizeUrl, parseConnectInput, CONNECTION_TOOL } from '../expocut-mcp-bridge.mjs';

const BRIDGE = join(dirname(fileURLToPath(import.meta.url)), '..', 'expocut-mcp-bridge.mjs');
const TOKEN = 'fd971edc9f4dd9a8fefed9b9';
const DEAD_URL = 'http://127.0.0.1:1/mcp';

// ─── fake phone: mirrors the in-app MCP server's behaviour ────────────

function fakePhone({ token = TOKEN } = {}) {
  const calls = [];
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const json = (status, payload, headers = {}) => {
        res.writeHead(status, { 'content-type': 'application/json', ...headers });
        res.end(payload === undefined ? '' : JSON.stringify(payload));
      };
      if (req.method !== 'POST' || req.url !== '/mcp') return json(404, { error: 'not_found' });
      if (req.headers.authorization !== `Bearer ${token}`) {
        return json(401, { error: 'unauthorized' }, { 'WWW-Authenticate': 'Bearer realm="ExpoCut MCP"' });
      }
      const accept = req.headers.accept ?? '';
      if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
        return json(406, { error: 'not_acceptable' });
      }
      const msg = JSON.parse(body);
      calls.push(msg);
      if (msg.id === undefined) return json(202, undefined);
      const reply = (result) => json(200, { jsonrpc: '2.0', id: msg.id, result });
      const fail = (code, message) => json(200, { jsonrpc: '2.0', id: msg.id, error: { code, message } });
      switch (msg.method) {
        case 'initialize':
          return reply({
            protocolVersion: '2025-06-18',
            capabilities: { tools: {} },
            serverInfo: { name: 'ExpoCut', version: '9.9.9' },
          });
        case 'tools/list':
          return reply({
            tools: [
              {
                name: 'fake_echo',
                description: 'Echo text back',
                inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
              },
            ],
          });
        case 'tools/call':
          if (msg.params?.name === 'fake_echo') {
            return reply({ content: [{ type: 'text', text: `echo:${msg.params.arguments?.text ?? ''}` }] });
          }
          return fail(-32602, `unknown tool ${msg.params?.name}`);
        default:
          return fail(-32601, 'method not found');
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        server,
        port,
        url: `http://127.0.0.1:${port}/mcp`,
        calls,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

// ─── stdio JSON-RPC client around a spawned bridge ───────────────────

class StdioClient {
  constructor(env = {}) {
    this.child = spawn(process.execPath, [BRIDGE], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.pending = new Map();
    this.notifications = [];
    this.waiters = [];
    this.stderr = '';
    this.nextId = 1;
    this.child.stderr.on('data', (c) => (this.stderr += c));
    createInterface({ input: this.child.stdout }).on('line', (line) => {
      if (!line.trim()) return;
      const msg = JSON.parse(line);
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        this.pending.get(msg.id)(msg);
        this.pending.delete(msg.id);
      } else if (msg.method) {
        this.notifications.push(msg);
        this.waiters = this.waiters.filter((w) => !w(msg));
      }
    });
  }

  request(method, params, timeoutMs = 10000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`timeout waiting for ${method}\nstderr: ${this.stderr}`));
      }, timeoutMs);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
      this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  notify(method, params) {
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  waitForNotification(method, timeoutMs = 5000) {
    const existing = this.notifications.find((n) => n.method === method);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`no ${method} within ${timeoutMs} ms\nstderr: ${this.stderr}`)), timeoutMs);
      this.waiters.push((msg) => {
        if (msg.method !== method) return false;
        clearTimeout(timer);
        resolve(msg);
        return true;
      });
    });
  }

  async initialize() {
    const res = await this.request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test', version: '0' },
    });
    this.notify('notifications/initialized');
    return res;
  }

  close() {
    this.child.stdin.end();
    return new Promise((r) => this.child.once('exit', r));
  }
}

async function tempConfigDir(config) {
  const dir = await mkdtemp(join(tmpdir(), 'expocut-bridge-'));
  if (config) await writeFile(join(dir, 'claude-mcp.json'), JSON.stringify(config));
  return dir;
}

function runCli(args, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [BRIDGE, ...args], { env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => (stdout += c));
    child.stderr.on('data', (c) => (stderr += c));
    child.on('exit', (code) => resolve({ code, stdout, stderr }));
  });
}

const toolNames = (res) => res.result.tools.map((t) => t.name);

// ─── unit: input parsing ─────────────────────────────────────────────

test('parseConnectInput understands every snippet ExpoCut shows', () => {
  const url = 'http://192.168.1.65:7333/mcp';
  const cases = [
    `${url} ${TOKEN}`,
    `${TOKEN} ${url}`,
    `claude mcp add --transport http expocut ${url} --header "Authorization: Bearer ${TOKEN}"`,
    `{"mcpServers":{"expocut":{"url":"${url}","headers":{"Authorization":"Bearer ${TOKEN}"}}}}`,
    `${url}/console.html#tok=${TOKEN}`,
    `http://192.168.1.65:7333 ${TOKEN}`,
    `http://192.168.1.65:7333/mcp/ ${TOKEN}`,
  ];
  for (const input of cases) {
    assert.deepEqual(parseConnectInput(input), { url, token: TOKEN }, input);
  }
  assert.deepEqual(parseConnectInput(''), { url: null, token: null });
  assert.equal(parseConnectInput(url).token, null);
});

test('normalizeUrl canonicalises to /mcp and rejects junk', () => {
  assert.equal(normalizeUrl('http://10.0.0.5:7333'), 'http://10.0.0.5:7333/mcp');
  assert.equal(normalizeUrl('http://10.0.0.5:7333/mcp/'), 'http://10.0.0.5:7333/mcp');
  assert.equal(normalizeUrl('http://10.0.0.5:7333/mcp/console.html#tok=x'), 'http://10.0.0.5:7333/mcp');
  assert.throws(() => normalizeUrl('10.0.0.5:7333'));
  assert.throws(() => normalizeUrl('ftp://10.0.0.5/mcp'));
});

// ─── stdio bridge, connected ─────────────────────────────────────────

test('proxies tools/list and tools/call to the phone when configured', async () => {
  const phone = await fakePhone();
  const dir = await tempConfigDir({ url: phone.url, token: TOKEN });
  const client = new StdioClient({ EXPOCUT_CONFIG_DIR: dir });
  try {
    const init = await client.initialize();
    assert.equal(init.result.protocolVersion, '2025-06-18');
    assert.deepEqual(init.result.capabilities, { tools: { listChanged: true } });
    assert.match(init.result.instructions, /expocut:connect/);

    const list = await client.request('tools/list', {});
    assert.deepEqual(toolNames(list), [CONNECTION_TOOL.name, 'fake_echo']);

    const call = await client.request('tools/call', { name: 'fake_echo', arguments: { text: 'hi' } });
    assert.equal(call.result.content[0].text, 'echo:hi');
    assert.ok(!call.result.isError);

    const status = await client.request('tools/call', { name: CONNECTION_TOOL.name, arguments: {} });
    assert.match(status.result.content[0].text, /Connected: ExpoCut 9\.9\.9/);
    assert.match(status.result.content[0].text, /1 tools/);

    const unknown = await client.request('tools/call', { name: 'nope', arguments: {} });
    assert.equal(unknown.error.code, -32602);

    const ping = await client.request('ping', {});
    assert.deepEqual(ping.result, {});

    // The phone saw exactly one handshake despite several calls.
    assert.equal(phone.calls.filter((c) => c.method === 'initialize').length, 1);
    assert.ok(phone.calls.some((c) => c.method === 'notifications/initialized'));

    const cache = JSON.parse(await readFile(join(dir, 'claude-mcp-tools.json'), 'utf8'));
    assert.equal(cache.tools[0].name, 'fake_echo');
  } finally {
    await client.close();
    await phone.close();
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── stdio bridge, not configured → connect without restart ─────────

test('starts unconfigured and picks up /expocut:connect via tools/list_changed', async () => {
  const phone = await fakePhone();
  const dir = await tempConfigDir(null);
  const client = new StdioClient({ EXPOCUT_CONFIG_DIR: dir });
  try {
    await client.initialize();
    const before = await client.request('tools/list', {});
    assert.deepEqual(toolNames(before), [CONNECTION_TOOL.name]);

    const blocked = await client.request('tools/call', { name: 'fake_echo', arguments: {} });
    assert.equal(blocked.result.isError, true);
    assert.match(blocked.result.content[0].text, /not connected/);

    const cli = await runCli(['connect', `claude mcp add --transport http expocut ${phone.url} --header "Authorization: Bearer ${TOKEN}"`], { EXPOCUT_CONFIG_DIR: dir });
    assert.equal(cli.code, 0, cli.stdout + cli.stderr);
    assert.match(cli.stdout, /Connected to ExpoCut 9\.9\.9/);

    await client.waitForNotification('notifications/tools/list_changed');
    const after = await client.request('tools/list', {});
    assert.deepEqual(toolNames(after), [CONNECTION_TOOL.name, 'fake_echo']);
  } finally {
    await client.close();
    await phone.close();
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── phone off: cached tools + clear error ───────────────────────────

test('serves the cached tool list and a clear error while the phone is unreachable', async () => {
  const dir = await tempConfigDir({ url: DEAD_URL, token: TOKEN, autoDiscover: false });
  await writeFile(
    join(dir, 'claude-mcp-tools.json'),
    JSON.stringify({ url: DEAD_URL, tools: [{ name: 'fake_echo', description: 'cached', inputSchema: { type: 'object' } }] }),
  );
  const client = new StdioClient({ EXPOCUT_CONFIG_DIR: dir });
  try {
    await client.initialize();
    const list = await client.request('tools/list', {});
    assert.deepEqual(toolNames(list), [CONNECTION_TOOL.name, 'fake_echo']);

    const call = await client.request('tools/call', { name: 'fake_echo', arguments: { text: 'x' } });
    assert.equal(call.result.isError, true);
    assert.match(call.result.content[0].text, /not answering at http:\/\/127\.0\.0\.1:1\/mcp/);
    assert.match(call.result.content[0].text, /same Wi-Fi/);
  } finally {
    await client.close();
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── phone moved: rediscovery on the subnet ─────────────────────────

test('rediscovers the phone on the subnet when the saved address dies, and saves it', async () => {
  const phone = await fakePhone();
  const dir = await tempConfigDir({ url: DEAD_URL, token: TOKEN });
  const client = new StdioClient({
    EXPOCUT_CONFIG_DIR: dir,
    EXPOCUT_DISCOVERY_HOSTS: `127.0.0.1:1,127.0.0.1:${phone.port}`,
  });
  try {
    await client.initialize();
    const list = await client.request('tools/list', {});
    assert.deepEqual(toolNames(list), [CONNECTION_TOOL.name, 'fake_echo']);

    const saved = JSON.parse(await readFile(join(dir, 'claude-mcp.json'), 'utf8'));
    assert.equal(saved.url, phone.url);
    assert.equal(saved.token, TOKEN);

    // Discovery fingerprinted first (no token), then handshook with the token.
    const unauth = phone.calls.length; // 401s never reach the JSON handler
    assert.ok(unauth >= 1);
    assert.equal(phone.calls[0].method, 'initialize');
  } finally {
    await client.close();
    await phone.close();
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── wrong token ─────────────────────────────────────────────────────

test('reports a rotated token instead of failing silently', async () => {
  const phone = await fakePhone({ token: 'something-else-entirely' });
  const dir = await tempConfigDir({ url: phone.url, token: TOKEN, autoDiscover: false });
  const client = new StdioClient({ EXPOCUT_CONFIG_DIR: dir });
  try {
    await client.initialize();
    const list = await client.request('tools/list', {});
    assert.deepEqual(toolNames(list), [CONNECTION_TOOL.name]);
    const call = await client.request('tools/call', { name: 'fake_echo', arguments: {} });
    assert.equal(call.result.isError, true);
    assert.match(call.result.content[0].text, /rejected the token/);

    const cli = await runCli(['connect', phone.url, TOKEN], { EXPOCUT_CONFIG_DIR: dir });
    assert.equal(cli.code, 1);
    assert.match(cli.stdout, /rejected the token/);
    assert.match(cli.stdout, /Nothing was saved/);
  } finally {
    await client.close();
    await phone.close();
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── CLI: status / discover / disconnect ─────────────────────────────

test('status, discover and disconnect CLI round-trip', async () => {
  const phone = await fakePhone();
  const dir = await tempConfigDir(null);
  const env = { EXPOCUT_CONFIG_DIR: dir, EXPOCUT_DISCOVERY_HOSTS: `127.0.0.1:${phone.port}` };
  try {
    let r = await runCli(['status'], env);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /not connected to Claude Code yet/);

    r = await runCli(['discover', '--token', TOKEN, '--save'], env);
    assert.equal(r.code, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /token accepted/);

    r = await runCli(['status'], env);
    assert.equal(r.code, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /Connected: ExpoCut 9\.9\.9 at http:\/\/127\.0\.0\.1:\d+\/mcp \(MCP 2025-06-18\), 1 tools/);

    r = await runCli(['disconnect'], env);
    assert.equal(r.code, 0);
    r = await runCli(['status'], env);
    assert.equal(r.code, 1);

    r = await runCli(['connect'], env);
    assert.equal(r.code, 2);
    assert.match(r.stdout, /Nothing to connect to/);

    r = await runCli(['connect', 'http://127.0.0.1:1/mcp', TOKEN], { EXPOCUT_CONFIG_DIR: dir });
    assert.equal(r.code, 1);
    assert.match(r.stdout, /Saved .* but it is not answering right now/);
  } finally {
    await phone.close();
    await rm(dir, { recursive: true, force: true });
  }
});
