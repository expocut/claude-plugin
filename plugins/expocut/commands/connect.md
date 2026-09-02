---
description: Connect Claude Code to ExpoCut on your phone (paste the Server URL and Bearer Token from ExpoCut → Settings → AI Agent)
argument-hint: <server-url> <token>
allowed-tools: Bash(node:*)
---
# Connect to ExpoCut

Bridge output:

!`node "${CLAUDE_PLUGIN_ROOT}/bridge/expocut-mcp-bridge.mjs" connect '$ARGUMENTS'`

Relay the bridge output above to the user in plain words:

- **Connected**: confirm the address and tool count and say the ExpoCut tools are ready in this session. Claude Code refreshes the tool list on its own; if the tools do not show up within a few seconds, ask the user to run `/mcp` and reconnect "expocut".
- **Token rejected**: ask the user to copy the current Bearer Token from ExpoCut → Settings → AI Agent (MCP Server) and run `/expocut:connect <url> <token>` again. Tokens change when they tap Rotate.
- **Not answering**: walk through the checklist the bridge printed (phone awake with ExpoCut open, same Wi-Fi, Local Network permission on iPhone/iPad), then suggest `/expocut:status` once fixed. The saved address is kept and retried automatically.
- **No arguments**: show the user where to find the values (ExpoCut → Settings → AI Agent (MCP Server) → Enable, then copy the Server URL and Bearer Token) and ask them to run `/expocut:connect <url> <token>`. They can also paste the whole "claude mcp add …" line or the console link ExpoCut shows.

If the bridge output above is missing or shows a shell error (for example because the pasted text contained quotes), run the same command yourself with the Bash tool, passing the URL and token as two separate quoted arguments.
