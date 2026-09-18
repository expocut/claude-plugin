#!/usr/bin/env node
/**
 * Build the ExpoCut extension bundle for the Claude Desktop app.
 * Copyright (c) 2026 ExpoCut. Released under the MIT License (see LICENSE).
 *
 * Assembles desktop-extension/dist/expocut/ from the manifest here plus the
 * shared bridge script, validates the manifest, and packs it into
 * desktop-extension/dist/expocut-<version>.mcpb with @anthropic-ai/mcpb.
 *
 *   npm run build:desktop
 *
 * "Install unpacked extension" in Claude Desktop → pick dist/expocut/.
 * "Install extension"                         → pick dist/expocut-<version>.mcpb.
 */

import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const stage = join(here, 'dist', 'expocut');

const manifest = JSON.parse(readFileSync(join(here, 'manifest.json'), 'utf8'));
const plugin = JSON.parse(readFileSync(join(root, 'plugins/expocut/.claude-plugin/plugin.json'), 'utf8'));
if (manifest.version !== plugin.version) {
  console.error(`version mismatch: desktop-extension/manifest.json is ${manifest.version}, plugin.json is ${plugin.version}`);
  process.exit(1);
}

rmSync(stage, { recursive: true, force: true });
mkdirSync(join(stage, 'bridge'), { recursive: true });
cpSync(join(here, 'manifest.json'), join(stage, 'manifest.json'));
cpSync(join(root, 'plugins/expocut/bridge/expocut-mcp-bridge.mjs'), join(stage, 'bridge/expocut-mcp-bridge.mjs'));
cpSync(join(root, 'LICENSE'), join(stage, 'LICENSE'));
cpSync(join(here, 'README.md'), join(stage, 'README.md'));
cpSync(join(here, 'icon.png'), join(stage, 'icon.png'));

const out = join(here, 'dist', `expocut-${manifest.version}.mcpb`);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['-y', '@anthropic-ai/mcpb', 'validate', join(stage, 'manifest.json')], { stdio: 'inherit' });
execFileSync(npx, ['-y', '@anthropic-ai/mcpb', 'pack', stage, out], { stdio: 'inherit' });
console.log(`\nunpacked: ${stage}\nbundle:   ${out}`);
