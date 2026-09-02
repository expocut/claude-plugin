# ExpoCut plugin for Claude Code

Connects Claude Code to the MCP server built into the [ExpoCut](https://expocut.com)
video editor on your phone or tablet, over your local Wi-Fi. Once paired, Claude
Code can build, review and export videos with ExpoCut's 260+ MCP tools, and the
17 bundled `expocut-*` skills teach it the editing workflows, each with a
`references/tools.md` of exact tool signatures generated from the app.

## Install

```bash
claude plugin marketplace add expocut/claude-plugin
claude plugin install expocut
```

Requirements: Claude Code 2.x and Node.js 18 or newer on this computer
(`node --version`). ExpoCut and this computer must be on the same Wi-Fi.

## Pair with your phone

1. In ExpoCut open **Settings → AI Agent (MCP Server)** and turn it on.
   On iPhone/iPad, allow **Local Network** access when iOS asks.
2. Copy the **Server URL** and **Bearer Token** it shows.
3. In Claude Code run:

   ```
   /expocut:connect http://192.168.1.20:7333/mcp <token>
   ```

   You can also paste the whole `claude mcp add …` line or the console link
   ExpoCut shows for Claude Code; the command extracts the address and token.

The ExpoCut tools appear in the current session without a restart. Try
"list my ExpoCut projects" or "make a 15-second 9:16 reel from my last project".

## Commands

| Command | What it does |
| --- | --- |
| `/expocut:connect <url> <token>` | Verify and save the pairing |
| `/expocut:status` | Show the saved address and whether ExpoCut answers |
| `/expocut:disconnect` | Forget the pairing on this computer |

## How it works

`.mcp.json` launches `bridge/expocut-mcp-bridge.mjs`, a zero-dependency Node
script that speaks MCP over stdio to Claude Code and forwards each call as
Streamable HTTP to the phone with the bearer token. Compared with a plain
`claude mcp add --transport http …` entry it adds:

- **No failed server at startup.** The bridge always starts. Before pairing it
  exposes one tool, `expocut_connection`, which explains the setup steps.
- **Survives address changes.** Phones get new DHCP leases. When the saved
  address stops answering, the bridge looks for ExpoCut on the same /24
  subnet (port 7333 by default) and updates the saved address. It fingerprints
  hosts with an unauthenticated request first and only sends the token to a
  host that answers with ExpoCut's own `401` realm.
- **Graceful when the phone is asleep.** The last known tool list stays
  available and calls return a clear "ExpoCut is not answering" message with a
  checklist, instead of a protocol error.
- **Live re-pairing.** The bridge watches the config file and sends
  `notifications/tools/list_changed`, so `/expocut:connect` takes effect in the
  running session.

### Configuration

| Where | Meaning |
| --- | --- |
| `~/.expocut/claude-mcp.json` | `{ "url", "token", "autoDiscover": true }`, written by `/expocut:connect` (mode 0600) |
| `~/.expocut/claude-mcp-tools.json` | cache of the last tool list, used while the phone is unreachable |
| `EXPOCUT_MCP_URL` + `EXPOCUT_MCP_TOKEN` | override the file (handy for CI or several phones) |
| `EXPOCUT_AUTO_DISCOVER=0` or `"autoDiscover": false` | never scan the subnet |
| `EXPOCUT_CONFIG_DIR` | store the files somewhere else |
| `EXPOCUT_BRIDGE_DEBUG=1` | verbose logging on stderr |

### Without Node.js

If you cannot install Node, register the phone directly and skip the bridge
(no auto-rediscovery; re-run when the address changes):

```bash
claude mcp add --transport http expocut http://<phone-ip>:7333/mcp \
  --header "Authorization: Bearer <token>"
```

## Troubleshooting

- **"ExpoCut is not answering"**: the phone is asleep, ExpoCut is in the
  background, or you are on different networks. Guest Wi-Fi and "AP isolation"
  block phone-to-computer traffic. Run `/expocut:status` after fixing.
- **"rejected the token"**: the token was rotated in ExpoCut. Copy the new one
  and run `/expocut:connect` again.
- **iPhone shows the server as running but nothing connects**: Local Network
  permission was denied. Enable ExpoCut under Settings → Privacy & Security →
  Local Network.
- **Tools do not appear after pairing**: run `/mcp` and reconnect `expocut`, or
  restart Claude Code.

## Development

```bash
node --test bridge/test/*.test.mjs  # unit + end-to-end tests against a fake phone
claude --plugin-dir .              # try the plugin from this folder
claude plugin validate .           # manifest check
node bridge/expocut-mcp-bridge.mjs status
```

The `expocut-*` skills are copies of https://expocut.com/skills/, refreshed
from the ExpoCut source before each release. Their tool snippets are validated against the app's MCP registry by a parity test
there, so a renamed tool or parameter fails CI before it can reach a skill.

## License

Copyright (c) 2026 ExpoCut. Released under the MIT License; see [LICENSE](../../LICENSE) at the repository root.
