# ExpoCut for Claude Code

**Edit videos on your phone from your terminal.** This plugin connects Claude
Code to [ExpoCut](https://expocut.com), the mobile video editor with an MCP
server built in, over your local Wi-Fi. No cloud, no upload: Claude talks to the
app on your phone, and every edit lands live on the timeline where you can undo
it.

```
> make a 15-second 9:16 reel from my last three clips, punchy captions, teal-orange grade
```

What you get:

- **260+ MCP tools** covering the whole editor: projects, clips, keyframes,
  masks, text animations, 224 effects, 110 shaders, LUTs and CDL grading, stems
  and ducking, on-device voiceover and captions, Lottie / FCPXML / .mogrt import,
  and export to MP4.
- **17 editing skills** that teach Claude how a good editor works: reels and
  hooks, motion graphics, compositing, colour, FX looks, audio post, kinetic
  captions, data widgets, templates and brand kits. Each ships the exact tool
  signatures, generated from the app's code.
- **A pairing that survives real life.** Phones change IP addresses and fall
  asleep. The bridge re-finds the phone on your subnet, keeps the tool list while
  it is off, and explains what to do instead of showing a failed server.

## Install

```bash
claude plugin marketplace add expocut/claude-plugin
claude plugin install expocut
```

(If you have several marketplaces with a plugin called `expocut`, use
`claude plugin install expocut@expocut-plugins`.)

Then in ExpoCut open **Settings → AI Agent (MCP Server)**, switch it on, tap the
**Claude Code plugin** tab and copy the line it shows. Paste it into Claude Code:

```
/expocut:connect http://192.168.1.20:7333/mcp <token>
```

Needs Node.js 18+ on the computer, and the phone on the same Wi-Fi. Full guide,
how the bridge works and troubleshooting: [plugins/expocut/README.md](plugins/expocut/README.md).

## Try these

- "List my ExpoCut projects and open the newest one."
- "Add captions from the voiceover and make them pop word by word."
- "Give this a cinematic teal-orange look, but keep skin tones natural."
- "Cut this 4-minute talk down to a 45-second short with a hook in the first 2 seconds."
- "Duck the music under the voice and normalise for TikTok."

Layout:

```
.claude-plugin/marketplace.json   the marketplace (lists ./plugins/expocut)
plugins/expocut/                  the plugin: .mcp.json, bridge/, commands/, skills/
```

Develop and test:

```bash
npm test                                  # bridge tests against a fake phone
claude --plugin-dir ./plugins/expocut     # load the plugin from disk
claude plugin validate .                  # validate marketplace + plugin manifests
```

## License

Copyright (c) 2026 ExpoCut. Released under the MIT License; see [LICENSE](LICENSE).
