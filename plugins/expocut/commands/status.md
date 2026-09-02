---
description: Show whether Claude Code can reach ExpoCut on your phone right now
allowed-tools: Bash(node:*)
---
# ExpoCut connection status

!`node "${CLAUDE_PLUGIN_ROOT}/bridge/expocut-mcp-bridge.mjs" status`

Summarise the output above for the user in one or two sentences. If ExpoCut is not connected or not answering, relay the checklist the bridge printed and offer `/expocut:connect <url> <token>`. If it is connected, say how many tools are available and that they are ready to use.
