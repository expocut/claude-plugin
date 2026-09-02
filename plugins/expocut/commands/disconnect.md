---
description: Forget the saved ExpoCut address and token on this computer
allowed-tools: Bash(node:*)
---
# Disconnect from ExpoCut

!`node "${CLAUDE_PLUGIN_ROOT}/bridge/expocut-mcp-bridge.mjs" disconnect`

Tell the user the saved connection was removed and that `/expocut:connect <url> <token>` pairs it again. Remind them that the token itself still works on the phone; to revoke it they should tap Rotate in ExpoCut → Settings → AI Agent (MCP Server).
