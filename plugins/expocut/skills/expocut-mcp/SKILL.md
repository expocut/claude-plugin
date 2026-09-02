---
name: expocut-mcp
description: "How to drive the ExpoCut mobile video editor through its MCP tools from Claude Code — the connection model (the app on the user's phone over local Wi-Fi, reached through the ExpoCut plugin bridge), what to do when a tool says ExpoCut is unreachable or not connected, and the conventions every tool follows (seconds, percent positions, open_project first, catalogs before setters, undoable edits). Use whenever the expocut MCP tools are involved, when a tool result mentions ExpoCut being unreachable or not connected, or when the user mentions ExpoCut, /expocut:connect, or editing a video on their phone from Claude Code."
license: MIT
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/mcp.html
---
# Driving ExpoCut over MCP

ExpoCut is a multi-track video editor for iOS and Android. It embeds an MCP
server that only listens on the phone's private network address. The
`expocut` MCP server in Claude Code is a small bridge on this computer that
forwards every tool call to the app; nothing goes through the internet.

## Connection model

- The phone must be **awake with ExpoCut in the foreground** and on the
  **same Wi-Fi** as this computer. The server stops when the app is suspended.
- The user pairs once with `/expocut:connect <Server URL> <Bearer Token>`
  (values from **ExpoCut → Settings → AI Agent (MCP Server)**). The bridge
  keeps the pairing in `~/.expocut/claude-mcp.json` and re-finds the phone on
  the subnet when its address changes.
- `expocut_connection` is always available. Call it when any other ExpoCut
  tool returns an error mentioning "unreachable" or "not connected", then
  relay its checklist to the user instead of retrying blindly.
- Never ask the user for the token in chat when it is already paired; never
  paste tokens into project files.

## When ExpoCut is not connected

Tell the user, in order:

1. Open ExpoCut → Settings → AI Agent (MCP Server) and turn it on.
2. On iPhone/iPad, allow **Local Network** access when prompted (or in
   Settings → Privacy & Security → Local Network → ExpoCut).
3. Keep the phone on the same Wi-Fi and unlocked with ExpoCut open.
4. Run `/expocut:connect <url> <token>` with the values shown in the app, or
   `/expocut:status` to re-check.

## Conventions every tool follows

- **Time is seconds.** `startTime`, `duration`, `timeSec`, `*Sec`,
  `*Duration` arguments are decimal seconds (`0.5`, not `500`). Readouts such
  as `get_layer` and `get_project` report milliseconds.
- **Position is top-left percent.** `x` / `y` are 0–100 % of the canvas.
  Full-canvas layers pass `stretchToCanvas: true`.
- **Open a project first.** Layer and setter tools need an open project:
  `create_project` (or `list_projects`) then `open_project`, which also
  navigates the app to the editor.
- **Catalog before setter.** Tools that take an id (`effectId`, `fontId`,
  `transitionId`, `shaderId`, `shapeId`…) reject unknown ids with a hint to the
  matching `list_*` tool or `get_effect_schema`. Discover at runtime; catalogs
  evolve between app versions.
- **Z-order: 0 is front.** New layers land at `trackIndex 0`; use
  `reorder_layer` to restack.
- **Every call is undoable** in the app's edit history, but the edit is live
  on the user's device the moment it returns. Confirm before deleting projects
  or media, and never loop a failing call.

## Typical loop

```text
list_projects / create_project → open_project
add_video_layer / add_image_layer / add_text_layer …   (time in seconds)
set_* / update_layer / keyframe_add                     (ids from list_*)
describe_canvas { timeSec }   cheap, image-free layout readout
capture_canvas  { timeSec }   a real frame you can look at
export_project  {}            → get_render_status until the file path appears
```

Prefer `describe_canvas` for checking geometry and reserve `capture_canvas`
for judging the look; both drive the live editor, so keep the phone awake.

## Where to look things up

- Full tool reference with schemas: https://expocut.com/mcp.html
- The companion skills bundled with this plugin (each ships `references/tools.md`
  with exact signatures). Open the one that matches the request:

| ask | skill |
| --- | --- |
| make a reel / edit these clips / everyday flow | expocut-video-creating |
| projects, tracks, playback, undo, checkpoints, inspection, export settings | expocut-editor-ops |
| keyframes, motion paths, camera moves, mask animation | expocut-motion-graphics |
| blend modes, mattes, parenting, time remap, chroma key, layer fit | expocut-compositing |
| fast cuts, speed ramps, junction transitions, zoom punches | expocut-social-speed-edit |
| LUTs, CDL, colour adjust, light regions | expocut-color-grading |
| effects, shaders, video effects, light leaks, borders | expocut-fx-looks |
| stems, ducking, beat cuts, cleanup, loudness, audio effects | expocut-audio-post |
| voiceover, transcription, captions from narration | expocut-voice-narration |
| text animations, styles, fonts, lower thirds, captions | expocut-kinetic-captions |
| chart race, widgets, device mockups | expocut-data-widgets |
| shapes, brushes, mesh gradients, layouts, SVG | expocut-shapes-layouts |
| Lottie / .mogrt / FCPXML import and export | expocut-template-import |
| bundled templates, reel themes, brand kits | expocut-templates-brand |
| authoring an .ectpl reel template | expocut-reel-templates |
| registering custom FX, LUTs, borders, masks, light leaks | expocut-asset-authoring |
| hooks, pacing, safe zones, retention | expocut-retention-playbook |
