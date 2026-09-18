---
name: expocut-color-grading
description: "Grade footage in ExpoCut through its MCP server with the levers that exist - hue/saturation/brightness (set_layer_color_adjust), ASC CDL slope/offset/power (set_layer_cdl, the real contrast, lift and gamma control), 3D LUTs (set_layer_lut with the six built-ins or any custom .cube), 134 preset filters (set_layer_filter), one-call look passes over a time range (apply_global_color_grade), local Light/LUT zones (add_light_region), the CDL to .cube to lut_register_custom round trip, chroma-key basics and export quality. Use for \"colour grade\", \"color correct\", \"make it cinematic\", \"teal and orange\", \"warm it up\", \"cool it down\", \"more contrast\", \"lift the shadows\", \"black and white\", \"match these clips\", \"apply my LUT / .cube\", \"fix this dark clip\", \"green screen\". Do not use for halation, grain, CRT, cartoon or glow (expocut-fx-looks), colour keyframes (expocut-motion-graphics), blend modes and mattes (expocut-compositing), or custom-asset quotas and ids (expocut-asset-authoring)."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# Colour grading with ExpoCut

You are the colorist. Every tool below writes a field on a layer (`colorAdjust`, `ascCdl`, `lut`, `filterId`, `lutRegions`, `chromaKey`); nothing re-encodes the source and everything is undoable in the app. Grade with the levers the encoder really reads, and verify with a capture rather than assuming.

## When to use / hand off

- Colour correction, looks, LUTs, CDL, local light zones, a reel-wide grade pass, chroma-key setup, export quality for colour: this skill.
- Film grain, halation, vignette, CRT, cartoon, glow, light leaks: `expocut-fx-looks` (they are shader filters, a different pipeline).
- Colour that changes over time (`color.saturation`, `color.brightness`, `lut.id` keyframes): `expocut-motion-graphics`.
- Blend modes, adjustment layers, track mattes, masks after the key: `expocut-compositing`.
- Registering many custom LUTs, the authoring tier, quotas: `expocut-asset-authoring`.

## Before you start

1. `get_active_project {}` then `list_layers {}` to get the real layer ids (`video0`, `image1`, ...) and their timing. Only image and video layers take a grade; shapes accept `set_layer_color_adjust` only.
2. Ask one question if you cannot see the answer: is there a reference look, and is the footage skin-heavy? Skin breaks first under saturation and strong LUTs.
3. `save_history_checkpoint { label: "before grade" }` so one `undo {}` reverts the whole pass.
4. `capture_canvas { timeSec: 2 }` for a baseline. `describe_canvas` is cheaper but reports geometry only, never colour.
5. Find LUT ids before you use one: built-ins are `warm`, `cool`, `cinematic`, `vintage`, `bw`, `noir`; everything else comes from `lut_list_custom { author: "any" }` (user-imported `.cube` files, CDN downloads with `cdn-` ids, agent-registered `ai.` ids). There is no bundled LUT list tool.

## The levers (what each tool really changes)

| Tool | Writes | Parameters and units |
| --- | --- | --- |
| `set_layer_color_adjust` | `colorAdjust` | `hue` 0..360 degrees of rotation; `saturation` -1 (grey) .. +1 (double); `brightness` -1..+1; `intensity` 0..1 blend. All are offsets where 0 is neutral. Unspecified fields keep their previous value. |
| `set_layer_cdl` | `ascCdl` | `slope` [r,g,b] multiplier (contrast and highlight tint), `offset` [r,g,b] additive (shadow lift and shadow tint), `power` [r,g,b] gamma (midtones), `saturation` 1 = neutral. Partial calls merge; identity is [1,1,1] / [0,0,0] / [1,1,1] / 1. This is the only contrast, lift and gamma control on a layer. |
| `set_layer_lut` | `lut` | `id` LUT id, `intensity` 0..1. `id: null` clears. Unknown ids are accepted and render nothing. |
| `set_layer_filter` | `filterId` | One preset filter from the 134 in `references/filters-and-luts.md` (`cin-teal-orange`, `port-soft-skin`, `bw-classic` ...), `intensity` 0..1. Not validated; a typo is a silent no-op. `filterId: null` clears. |
| `apply_global_color_grade` | `lut` + `colorAdjust` on every video/image layer overlapping [`startSec`, `endSec`] | `lutId`, `lutIntensity` 0..1, `hue`, `saturation`, `brightness`, `intensity` (same offset scale as `set_layer_color_adjust`), `includeImages`, `includeVideos`. Returns `patchedIds`. It does not carry CDL, contrast or temperature, and there is no `scope` or `params` object. |
| `add_light_region` | appends to `lutRegions` | `shape` area/gradient/radial/object/trident, `rect` {x,y,width,height} in 0..1 layer space, `feather` px at 1080p, `invert`, `rotation` degrees, `expansion` px, `intensity` 0..1, `label`, `tone` {exposure, contrast, brightness, highlights, shadows, whites, blacks, vibrance, saturation}, `filterId` + `filterIntensity` 0..1. Ranges in the reference file. |
| `list_light_regions` / `clear_light_regions` | reads / removes `lutRegions` | `clear_light_regions { layerId }` wipes the stack; pass `regionId` (from the list) to remove one. |
| `set_layer_chroma_key` | `chromaKey` | `keyColor` hex (default `#00FF00`), `similarity` 0..1 (default 0.4), `smoothness` 0..1 (default 0.1), `spill` 0..1 (default 0.5), `enabled`. Video layers. |
| `bake_cdl_to_cube` | nothing (returns text) | `cdl` {slope, offset, power, saturation}, `size` 17/33/65 (default 33), `title`, `clipOutput`, `allowNegative`. Returns `{ cube, size }`. |
| `write_cdl` | nothing (returns XML) | `entries: [{ cdl, id? }]`, `kind` cdl/ccc/cdl-list. For the user's Resolve/Premiere hand-off. |
| `parse_cube_lut` | nothing | `text` of a `.cube`; returns size, domain, title, dataLength. Validate a user file before registering it. |
| `lut_register_custom` | custom LUT store | `id` must match `ai.<slug>` (lowercase, digits, hyphens, max 48), `name`, `cubeText` (max 1 MB, grid size 33 or smaller), `persist`. Needs the Settings tier Standard or Full for `cubeText`. |
| `set_working_color_space` | `exportSettings.workingColorSpace` | `space` sRGB/Rec.709/Rec.2020/linear. Accepted by the data model but non-sRGB values downgrade at encode time, so it changes nothing you can see today. |
| `set_export_settings` | `exportSettings` | `resolution` 480p/720p/1080p/2K/4K or "1920x1080", `quality` low/medium/high/ultra, `format` mp4/mov, `fps`. There is no bitrate or codec parameter. |

## Core workflow

1. Checkpoint and baseline (above).
2. Normalise each clip with `set_layer_cdl` so all clips meet at the same exposure and contrast before any look. Skip clips that already match.
3. Put the look on. Per layer: `set_layer_color_adjust` and/or `set_layer_lut`. Across a reel: one `apply_global_color_grade` call. Save the returned `patchedIds` - they tell you which layers now carry the LUT.
4. Shape locally with `add_light_region` (a face lift, a sky grad, a darkened edge).
5. Verify: `capture_canvas { timeSec }` at two or three moments; for the encoder's exact result use `capture_export_frame { timeSec: 3 }` (needs the editor mounted, slower) or `verify_export_parity { timesSec: [1, 5] }`, which renders the whole project.
6. `save_project {}`. For export, set quality then hand the render to `expocut-editor-ops`: `set_export_settings { resolution: "1080p", quality: "high" }`.

Describe the grade to the user in words ("cool shadows, warm highlights, LUT at 50%"), not as slider numbers.

## Looks as recipes (built only from the real levers)

Start from these, then tune by eye. All CDL triplets are [r, g, b].

- Teal and orange: `set_layer_cdl { layerId: "video0", slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 }` then optionally `set_layer_lut { layerId: "video0", id: "cinematic", intensity: 0.5 }`. Red slope above 1 warms highlights; blue offset above 0 cools shadows.
- Warm golden hour: `set_layer_cdl { layerId: "video0", slope: [1.06, 1.0, 0.92], offset: [0.01, 0, -0.01], power: [0.97, 0.98, 1.0], saturation: 1.05 }`.
- Cool moody night: `set_layer_cdl { layerId: "video0", slope: [0.92, 0.98, 1.08], offset: [-0.02, -0.01, 0.02], power: [1.08, 1.08, 1.05], saturation: 0.8 }` plus `set_layer_color_adjust { layerId: "video0", brightness: -0.05 }`.
- Faded matte / lifted blacks: `set_layer_cdl { layerId: "video0", slope: [0.94, 0.94, 0.94], offset: [0.06, 0.06, 0.06], power: [0.95, 0.95, 0.95], saturation: 0.75 }`.
- Punchy contrast: `set_layer_cdl { layerId: "video0", slope: [1.15, 1.15, 1.15], offset: [-0.06, -0.06, -0.06], power: [1.05, 1.05, 1.05] }`.
- Black and white: `set_layer_lut { layerId: "video0", id: "bw", intensity: 1 }`, or `set_layer_cdl { layerId: "video0", saturation: 0 }` when you also want the CDL contrast.
- One-tap preset instead of hand-rolling: `set_layer_filter { layerId: "video0", filterId: "cin-teal-orange", intensity: 0.6 }`; skin-safe portrait: `filterId: "port-soft-skin"`.
- Skin-heavy footage: keep CDL `saturation` at or below 1.15 and LUT `intensity` at or below 0.6; wide landscapes tolerate 0.7 to 0.85.

## Recipes

Recipe A - reel-wide cinematic pass (three clips, 0 to 24 s).

```
save_history_checkpoint { label: "pre-grade" }
list_layers {}                                   // video0, video1, video2
set_layer_cdl { layerId: "video0", slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 }
set_layer_cdl { layerId: "video1", slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 }
set_layer_cdl { layerId: "video2", slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 }
apply_global_color_grade { startSec: 0, endSec: 24, lutId: "cinematic", lutIntensity: 0.5, saturation: 0.05, includeImages: false }
capture_canvas { timeSec: 3 }
capture_canvas { timeSec: 15 }
```

`set_layer_cdl` is per layer because the global tool does not carry a CDL; loop over the ids from `list_layers`.

Recipe B - black-and-white flashback from 8 s to 12 s inside a longer clip.

```
split_layer { layerId: "video0", atSec: 8 }       // second half gets a new id, e.g. video3
split_layer { layerId: "video3", atSec: 4 }       // atSec is relative to the layer start
apply_global_color_grade { startSec: 8, endSec: 12, lutId: "bw", lutIntensity: 1 }
```

The global tool patches every layer that overlaps the range as a whole, so cut the clip first; otherwise the entire clip turns monochrome.

Recipe C - a custom LUT from a CDL (brand look) and the file for the user's desktop tools.

```
bake_cdl_to_cube { cdl: { slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 }, size: 33, title: "Brand Teal" }
lut_register_custom { id: "ai.brand-teal", name: "Brand Teal", cubeText: "<the cube text returned above>", persist: true }
set_layer_lut { layerId: "video0", id: "ai.brand-teal", intensity: 0.7 }
write_cdl { entries: [{ id: "brand-teal", cdl: { slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 } }], kind: "cdl" }
```

To use a `.cube` the user already has: `parse_cube_lut { text }` to confirm it parses (3D, size 33 or smaller), then `lut_register_custom` with the same text. Ask before `persist: true`; it writes to the phone's Documents folder.

Recipe D - rescue an underexposed clip and lift a face.

```
set_layer_cdl { layerId: "video1", slope: [1.12, 1.12, 1.12], offset: [0.03, 0.03, 0.03], power: [0.9, 0.9, 0.9] }
add_light_region { layerId: "video1", shape: "radial", label: "Face", rect: { x: 0.3, y: 0.15, width: 0.4, height: 0.5 }, invert: false, feather: 60, tone: { exposure: 0.25, shadows: 0.2 }, intensity: 0.8 }
list_light_regions { layerId: "video1" }
capture_canvas { timeSec: 2 }
```

`radial` is seeded with `invert: true` (the surroundings are graded, which makes a subject pop); pass `invert: false` when the region itself should brighten.

Recipe E - green screen, then hand off.

```
set_layer_chroma_key { layerId: "video2", keyColor: "#00FF00", similarity: 0.35, smoothness: 0.15, spill: 0.6 }
capture_canvas { timeSec: 1 }
```

Raise `similarity` in steps of 0.05 until the backdrop disappears, then `smoothness` for the edge, then `spill` for green fringes. Placement, masks and blend modes continue in `expocut-compositing`.

## Pitfalls

- Offsets, not multipliers. `saturation: 1.06` on `set_layer_color_adjust` or `apply_global_color_grade` is +106%, and `brightness: 1` clips the layer to white because the encoder adds brightness. Neutral is 0.
- There is no `exposure`, `temperature`, `tint`, `contrast`, `shadows` or `highlights` parameter on the colour-adjust tools. Contrast and lift live in `set_layer_cdl`; a warm/cool shift is a red-versus-blue slope; local exposure and shadows live in `add_light_region { tone }`.
- `layerId: "all"` does not exist. Use `apply_global_color_grade` for a range or loop over `list_layers`.
- `apply_global_color_grade` replaces the LUT on every overlapping layer when `lutId` is given, keeps existing LUTs when it is omitted, and merges colour fields one by one. It never touches `ascCdl`, `filterId` or light regions.
- `set_layer_lut` and `set_layer_filter` accept unknown ids silently. Read ids back from the built-in list, `lut_list_custom`, or the reference file.
- A static `set_layer_lut` call deletes any `lut.id` keyframe track on that layer (by design, to keep canvas and export identical). Re-add keyframes afterwards if you need them.
- `lut_register_custom { grade }` (white balance + tone curve) is accepted at the Safe tier but no render path reads `grade` records; only `cubeText` LUTs draw. Bake a CDL to a cube instead.
- Authoring tools answer `ok: false` with `PermissionDenied` when the phone's Settings tier ("AI may author assets") is Off; they never throw. Check `ok` before using the id.
- Light-region `filterIntensity` is 0..1 on input and stored as 0..100; `list_light_regions` reports the stored form.
- `set_working_color_space` changes metadata only; do not promise Rec.2020 output.
- Quality for gradients (sunsets, smoke): `set_export_settings { quality: "ultra" }` and a 1080p or higher resolution; there is no bitrate field.
- Confirm before `clear_light_regions` without `regionId` or before resetting a grade the user built by hand; both are undoable but only through the app's history.

## Reference

- `references/filters-and-luts.md` - the 134 filter ids by category, where LUT ids come from, light-zone tone ranges and seed geometry.
- https://expocut.com/mcp.html - the full tool list.
- Siblings: `expocut-fx-looks` (shader filters, grain, glow), `expocut-motion-graphics` (colour keyframes), `expocut-compositing` (mattes, blend, masks), `expocut-asset-authoring` (custom LUT quotas and ids), `expocut-editor-ops` (export and render status).
