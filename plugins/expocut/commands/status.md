---
description: Show whether Claude Code can reach ExpoCut on your phone right now
---
# ExpoCut connection status

Call the `expocut_connection` tool from the expocut MCP server and summarise its result for the user in one or two sentences.

- **Connected**: say how many tools are available and that they are ready to use. If the result says the phone moved to a new address, pass that on.
- **Not connected or not answering**: relay the steps or checklist the tool returned, and offer `/expocut:connect` for the pairing walkthrough.
- **The tool is missing**: the expocut MCP server is not running. Ask the user to run `/mcp`, reconnect "expocut", and check that Node.js 18 or newer is installed (`node --version`).
