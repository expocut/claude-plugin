# ExpoCut plugin for Claude Code

Connects Claude Code to the MCP server built into the [ExpoCut](https://expocut.com)
video editor on your phone or tablet, over your local Wi-Fi. Once paired, Claude
Code can build, review and export videos with ExpoCut's 260+ MCP tools, and the
18 bundled `expocut-*` skills teach it the editing workflows, each with a
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
3. In Claude Code run `/plugin`, open the **Installed** tab, select
   **expocut**, and choose **Configure options**. Paste the Server URL and
   Bearer Token. The token is stored in your system credential store, not in
   a file.
4. Run `/reload-plugins`, then `/expocut:status` to check.

`/expocut:connect` walks you through the same steps. Then try "list my ExpoCut
projects" or "make a 15-second 9:16 reel from my last project".

**Upgrading from 0.1.x:** pairing moved from `/expocut:connect <url> <token>`
into the plugin's settings, so enter the values once more as above. The old
`~/.expocut/claude-mcp.json` is no longer read; you can delete it.

## Commands

| Command | What it does |
| --- | --- |
| `/expocut:connect` | Walk through pairing in the plugin's settings |
| `/expocut:status` | Show the configured address and whether ExpoCut answers |
| `/expocut:disconnect` | Explain how to unpair and revoke the token |

## How it works

`.mcp.json` launches `bridge/expocut-mcp-bridge.mjs`, a zero-dependency Node
script that speaks MCP over stdio to Claude Code and forwards each call as
Streamable HTTP to the phone with the bearer token. Claude Code hands the
bridge the Server URL and token from the plugin's settings as environment
variables; the bridge never reads or writes a credential file. Compared with a plain
`claude mcp add --transport http …` entry it adds:

- **No failed server at startup.** The bridge always starts. Before pairing it
  exposes one tool, `expocut_connection`, which explains the setup steps.
- **Survives address changes.** Phones get new DHCP leases. When the
  configured address stops answering, the bridge looks for ExpoCut on the same
  /24 subnet (port 7333 by default) and uses the new address for the rest of
  the session; `/expocut:status` tells you to update the Server URL. It fingerprints
  hosts with an unauthenticated request first and only sends the token to a
  host that answers with ExpoCut's own `401` realm.
- **Graceful when the phone is asleep.** The last known tool list stays
  available and calls return a clear "ExpoCut is not answering" message with a
  checklist, instead of a protocol error.
### Configuration

| Where | Meaning |
| --- | --- |
| **Server URL** (plugin option) | the address ExpoCut shows; passed as `EXPOCUT_MCP_URL` |
| **Bearer Token** (plugin option, sensitive) | kept in the system credential store; passed as `EXPOCUT_MCP_TOKEN` |
| **Find the phone automatically** (plugin option) | off = never scan the subnet; passed as `EXPOCUT_AUTO_DISCOVER` |
| `claude-mcp-tools.json` in the plugin's data folder | cache of the last tool list (schemas only), used while the phone is unreachable |
| `EXPOCUT_CONFIG_DIR` | keep that cache somewhere else |
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
  into **Configure options** and run `/reload-plugins`.
- **iPhone shows the server as running but nothing connects**: Local Network
  permission was denied. Enable ExpoCut under Settings → Privacy & Security →
  Local Network.
- **Tools do not appear after pairing**: run `/reload-plugins`, or `/mcp` and
  reconnect `expocut`, or restart Claude Code.

## Development

```bash
npm test --prefix ../..            # unit + end-to-end tests against a fake phone (tests/ at the repo root)
claude --plugin-dir .              # try the plugin from this folder
claude plugin validate .           # manifest check
EXPOCUT_MCP_URL=<url> EXPOCUT_MCP_TOKEN=<token> node bridge/expocut-mcp-bridge.mjs status
```

The `expocut-*` skills are copies of https://expocut.com/skills/, refreshed
from the ExpoCut source before each release. Their tool snippets are validated against the app's MCP registry by a parity test
there, so a renamed tool or parameter fails CI before it can reach a skill.

## License

Copyright (c) 2026 ExpoCut. Released under the MIT License; see [LICENSE](../../LICENSE) at the repository root.
