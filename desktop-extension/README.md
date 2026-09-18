# ExpoCut extension for the Claude Desktop app

Runs the same ExpoCut bridge as the Claude Code plugin, packaged as a Claude
Desktop extension. Once installed, Claude on your computer can drive the
[ExpoCut](https://expocut.com) editor on your phone over local Wi-Fi.

## Install

**From a bundle**

1. Download `expocut-<version>.mcpb` from the
   [releases page](https://github.com/expocut/claude-plugin/releases).
2. Double-click it, or in Claude Desktop open Settings → Extensions →
   **Install extension** and choose the file.

**From source** (needs Node.js 18+)

```bash
git clone https://github.com/expocut/claude-plugin
cd claude-plugin
npm run build:desktop
```

Then Settings → Extensions → **Install unpacked extension** and choose
`desktop-extension/dist/expocut/`, or **Install extension** and choose
`desktop-extension/dist/expocut-<version>.mcpb`.

## Pair with your phone

1. In ExpoCut open **Settings → AI Agent (MCP Server)** and turn it on. On
   iPhone/iPad allow **Local Network** access when iOS asks.
2. Copy the **Server URL** and **Bearer Token** it shows.
3. In Claude Desktop open Settings → Extensions → ExpoCut → **Configure**,
   paste both values and save. The token is stored in your system keychain.

Start a new chat and try "list my ExpoCut projects".

## How it works

The extension launches `bridge/expocut-mcp-bridge.mjs`, a zero-dependency Node
script that speaks MCP over stdio to Claude and forwards each call as
Streamable HTTP to the phone with the bearer token. When the saved address
stops answering it looks for ExpoCut on the same /24 subnet (port 7333 by
default), fingerprinting hosts before sending the token. While the phone is
asleep the last known tool list stays available and calls return a clear
checklist instead of a protocol error.

Turn off **Find the phone automatically** in the extension settings if you do
not want the bridge to scan your local network.

## Troubleshooting

- **"ExpoCut is not answering"**: the phone is asleep, ExpoCut is in the
  background, or the two devices are on different networks. Guest Wi-Fi and
  "AP isolation" block phone-to-computer traffic.
- **"rejected the token"**: the token was rotated in ExpoCut. Copy the new
  one into the extension settings.
- **iPhone shows the server running but nothing connects**: enable ExpoCut
  under iOS Settings → Privacy & Security → Local Network.
- **Address changed and the bridge cannot find the phone**: update the Server
  URL in the extension settings.

## License

Copyright (c) 2026 ExpoCut. Released under the MIT License; see
[LICENSE](../LICENSE) at the repository root.
