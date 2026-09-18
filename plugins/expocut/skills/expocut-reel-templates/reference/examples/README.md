# Worked example — "Pastel Photo Dump" (from a CapCut template)

These two reel templates were reverse-engineered from a CapCut multi-photo
template (CapCut ID `9543296910`) and rebuilt **native to ExpoCut** using the
rules in `../../SKILL.md`. They're here as a full, real-world example of the
JSON — copy and adapt.

## What the source does (analysis)

- **Format:** 9:16 vertical, ~9.5 s, pastel placeholder cards labelled `PHOTO 1…8`.
- **Phase A — build-up mosaic (~0–4 s):** photo cards **pop in one at a time**
  with a fast zoom-blur "shake" and tile into a growing grid.
- **Phase B — full-screen dump (~4–9.5 s):** each photo fills the screen in
  quick hard cuts with a slight punch-in.
- **Design language:** pink · hot-pink · peach · yellow · green · mint ·
  periwinkle · lavender.

`example.mp4` in `pastel-photo-dump/` is a faithful render of that effect
(built frame-by-frame) so you can see the target motion the JSON encodes.

## The two templates

| File | Aspect | Slots | Duration | Use |
|---|---|---|---|---|
| `pastel-photo-dump-v1.json` | 9:16 | 8 photo + 1 music | 8.78 s | The full build → grid → full-screen dump. |
| `pastel-grid-4x5-v1.json` | 4:5 | 4 photo + 1 music | 5.0 s | Compact 2×2 grid pop for the feed. |

Both are `mode: "template"` — the pastel cards are just placeholders; users drop
their own photos/clips into the slots.

## How the effect maps onto the schema

- **Each photo owns two layers that share one slot** (`slotRef`): a **grid tile**
  (Phase A) and a **full-bleed dump** layer (Phase B). Reusing the slot across
  both means one dropped photo drives both appearances.
- **Pop-in** = a `transform.scale` track (`0.5·s → 1.06·s overshoot → s`) plus an
  `opacity` `0→1` and an `fx.blur` `9→0` track. Keyframe `t` is in **microseconds,
  absolute on the timeline**.
- **Grid placement is computed, not eyeballed.** Positions come straight from the
  renderer math (design canvas `360×640`, image base box `150 pt`, center-anchored
  scaling, `position` = top-left of the unscaled base box). See `_generator.build_grid_4x5` /
  `_generator.build_dump_9x16` in the generator for the exact formula.
- **One layer = one trackIndex** (validator rule). Background sits at the highest
  index (back); grid tiles and dump layers each get their own index (lower = front).
- **Background** is an inline SVG gradient with a **globally-unique gradient id**
  per file (`bgDumpG`, `bgGridG`).
- **Rounded photo corners** via each tile's `border.cornerRadius`.

## Before you publish (the hosting step)

The slot defaults and layer `content`/`remoteSource.url` point at:

```
https://expocut.b-cdn.net/reels/assets/<template-id>/photoN.jpg
https://expocut.b-cdn.net/reels/assets/<template-id>/{preview.mp4,thumbnail.jpg}
```

Upload the sample images in `pastel-photo-dump/assets/` (and a rendered
`preview.mp4` + `thumbnail.jpg`) to those CDN paths — **or** repoint the URLs at
your own assets. Never ship `file://` paths (empty-slot trap, SKILL.md §9).

## Final alignment

Positions/scales are analytically correct for the editor's coordinate system, but
per SKILL.md §3 do one **capture → measure → correct** pass on-device (needs the
in-app MCP server) to nudge the grid to taste before publishing.
