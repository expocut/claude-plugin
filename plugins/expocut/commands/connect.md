---
description: Pair Claude Code with ExpoCut on your phone (Server URL and Bearer Token go in the plugin's settings)
---
# Connect to ExpoCut

Walk the user through pairing. Keep it short and in this order:

1. On the phone, open **ExpoCut → Settings → AI Agent (MCP Server)** and turn it on. On iPhone or iPad, allow **Local Network** access when iOS asks. Keep ExpoCut open and the phone on the same Wi-Fi as this computer.
2. In Claude Code, run `/plugin`, open the **Installed** tab, select **expocut**, and choose **Configure options**.
3. Paste the **Server URL** and **Bearer Token** that ExpoCut shows. The token is kept in the system credential store, not in a file.
4. Run `/reload-plugins`, then `/expocut:status` to check the connection.

Do not ask the user to paste the token into this chat, and do not write it to any file. If they already pasted it here, tell them to put it in **Configure options** instead and to tap **Rotate** in ExpoCut afterwards if the chat is shared.
