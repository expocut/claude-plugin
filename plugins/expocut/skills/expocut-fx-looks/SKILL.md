---
name: expocut-fx-looks
description: "Apply ExpoCut's stylised looks through its MCP server - 65 image and video shader filters including the seven parametric engines and their named presets via set_layer_shader_filter, the map-driven pair compoundblur and displacementmap plus the assisted tools (apply_subject_blur, apply_liquify, apply_face_blur, set_layer_shutter_angle), the 77 per-layer video effects, animated shaders (add_generative_bg_layer), layer animations (set_layer_effect), CDN light-leak overlays, borders and neon glow. Use for \"film look\", \"film grain\", \"halation\", \"VHS\", \"glitch\", \"cartoon\", \"lens flare\", \"light leak\", \"neon glow\", \"vignette\", \"animated background\", \"blur the background\", \"bokeh\", \"liquify\", \"blur faces\", \"motion blur\", \"stack effects on this clip\". Do not use for colour correction and LUTs (expocut-color-grading), clip transitions (expocut-social-speed-edit), keyframed motion (expocut-motion-graphics), Portrait Blur and background removal (expocut-compositing), or new effect specs (expocut-asset-authoring)."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# FX and looks with ExpoCut

You are the finishing artist. Every look below is stored as fields on a layer (`shaderFilters`, `videoEffects`, `effectId` + `fxParams`, `border`, an overlay layer); nothing is baked into the media and everything is undoable. Prefer a named preset, tune one or two parameters, and look at the frame before adding more.

## When to use / hand off

- Filters, engines, video effects, animated shader backgrounds, light leaks, borders and glow: this skill.
- Subject Blur, Liquify and Face Blur: this skill too - they drive the same shader-filter chain. So does shutter-angle motion blur, which sets a field on the base clip.
- Portrait Blur (`apply_portrait_blur`), which splits a layer into a sharp cutout in front of a blurred copy, and background removal: `expocut-compositing`.
- Hue, saturation, brightness, CDL, LUTs, one-tap photo filters like `cin-teal-orange`: `expocut-color-grading`.
- Cuts and the transition on a cut (`set_junction_transition`), or a layer's own in/out transition: `expocut-social-speed-edit`.
- Position, scale, opacity, mask keyframes, motion paths: `expocut-motion-graphics`.
- Text glow and text effects (`set_text_effect`): `expocut-kinetic-captions`. Shape fills, textures, mesh gradients: `expocut-shapes-layouts`.
- A look that does not exist yet (an FxSpec, a custom border preset): `expocut-asset-authoring`.

## Before you start

1. `list_layers {}` for real ids. Shader filters and video effects need an image or video layer; `set_layer_effect` also accepts text and shapes; `set_shape_glow` needs a shape.
2. `get_effect_schema { id: "cinematicgrade" }` before writing `fxParams`: it returns every param's min/max/default, the advanced params, and the preset names with their values. Integer `mode` params (warp, retrodisplay, edgesketch, lightfx, cartoon, lightflicker) are only documented through those preset values, so start from a preset name rather than guessing a mode number.
3. `save_history_checkpoint { label: "before fx" }` and `capture_canvas { timeSec: 2 }` as the baseline.
4. Light leaks come from the CDN (`list_light_leaks`); the first use of a preset needs the phone online.
5. The assisted tools are gated: `subject_blur_status` before `apply_subject_blur` (a segmentation model has to be on the device), `face_blur_status` before `apply_face_blur` (detection is iOS only). Both apply calls are long-running.

## The five surfaces

| Surface | Tools | Notes |
| --- | --- | --- |
| Shader filter chain on a layer | `set_layer_shader_filter { layerId, effectId, preset, fxParams, append, mapUri }`, `remove_layer_shader_filter { layerId, effectId }` or `{ layerId, index }`, `clear_layer_shader_filters { layerId }` | `effectId` must have scope `filter`: `list_effects { scope: "filter" }` returns 68 ids, 65 of them optical filters for image and video (the other three - `shinyText`, `glitchText`, `gradientText` - are text-only and belong to `expocut-kinetic-captions`). Rendered on canvas and by both export encoders. Default call replaces the chain; `append: true` stacks up to 4 stages. `mapUri` binds a control image to `compoundblur` or `displacementmap`. |
| Video effect chain | `set_layer_video_effects { layerId, effects: [{ effectId, intensity }] }`, `list_video_effects {}` | 77 ids in Film / Color / Mood / Stylize / Light / Blur & Focus / Distort. `intensity` is 0..100. The array replaces the chain; `[]` clears. Unknown ids throw. |
| Layer animation effect | `set_layer_effect { layerId, effectId, params }`, `list_effects { category }` | Scope `layer` ids: entrance (`fadeIn`, `popIn`, `bounceIn`), exit (`fadeOut`, `zoomOut`), motion (`pulse`, `breathe`, `slowZoom`, `orbit`), glitch (`glitch`, `rgbSplit`, `flicker`), style (`neonGlow`, `twinkle`), text and sticker. `params` are usually `speed` and `intensity` (0..100). One effect per layer; `effectId: null` removes it. |
| Shader layers | `add_generative_bg_layer { effectId, preset, fxParams, sourceMediaUri, sourceMediaKind, startTime, duration, opacity }`, `list_shaders { category }`, `set_shader_source { layerId, uri, kind }`, `clear_shader_source { layerId }`, `add_procedural_filter_layer { effectId, preset, fxParams }` | Scope `background` ids - the generative backgrounds plus the shader transitions and `lightleak`; `list_shaders {}` returns the current set with its thematic buckets. A new shader layer stretches to the canvas and lands at trackIndex 0 (front); send it back with `reorder_layer { layerId, position: "back" }`. Every background shader has a `transparentBg` param for overlaying footage. |
| Overlays, borders, glow, tint | `add_light_leak_overlay { presetId, startTime, duration, intensity }`, `set_layer_border { layerId, presetId, width, color, pattern, cornerRadius, position, sides }`, `list_border_presets {}`, `set_layer_border_glow { layerId, mode, color, radius, intensity, speed, layers, colorStops }`, `set_shape_glow { layerId, mode, color, radius, intensity, placement }`, `set_layer_overlay_color { layerId, color }` | Border `width` and glow `radius` are px at 1080p (radius 0..40); glow `intensity` is 0..100; `layers` 1..3 stacks halos; glow `mode` static/pulse/rainbow/chase/breathe/gradient. |

## The seven engines (scope filter, one Look per engine)

| effectId | Params | Preset names (exact spelling, case-insensitive) |
| --- | --- | --- |
| `cinematicgrade` | temperature, exposure, contrast, saturation, vibrance, shadowColor, highlightColor, splitStrength, skinProtect, halation, grain, intensity | Teal & Orange, Muted Orange-Teal, Cyberpunk Neon, Cross-Process, Retro Miami, Technicolor Classic, Film Print, Dream Halation, Golden Skin, Emerald Noir, Infrared Bloom, Night Neon Rain |
| `warp` | mode 0..10, amount -1..1, speed 0..4, intensity; advanced freq, segments, center | Swirl, Vortex Spin, Bulge, Pinch, Fisheye, Ripple Rings, Heat Wave, Kaleido Six, Kaleido Twelve, Mirror Split, Tiny Planet, Slant Shear, Shockwave, Frosted Glass |
| `retrodisplay` | mode 0..6, amount, speed, intensity | CRT Monitor, Deep CRT, Scanline TV, Interlace Cam, LED Billboard, Dot Matrix, Handheld Mono, Amber Terminal, Datamosh Blocks, Signal Loss, Ghost Broadcast |
| `edgesketch` | mode 0..6, amount, intensity | Pencil Sketch, Fine Liner, Neon Edge, Neon Magenta, Toon Shade, Comic Ink, Emboss Relief, Crisp Sharpen, Charcoal, Ink Outline |
| `lightfx` | mode 0..6, amount, speed, intensity | Lens Flare, Golden Flare, Star Cross, Star Six, Warm Leak, Rose Leak, Sparkle Dust, Stage Spotlight, Sun Rays, Anamorphic Blue, Anamorphic Gold |
| `cartoon` | mode 0..5, amount, intensity | Cartoon Classic, Bold Cartoon, Comic Pop, Anime Cel, Watercolor, Wet Watercolor, Oil Paint, Thick Oil, Pop Art Pink, Pop Art Blue |
| `lightflicker` | mode 0..6, amount, speed, intensity | Film Projector, Silent Film, Club Strobe, Soft Pulse, Neon Sign, Broken Neon, Candlelight, Fireside, Lightning Storm, Party Hue, Disco Wash |

Other scope-filter ids worth knowing: `colorgrade` (24 presets: Warm Pop, Cool Cinematic, Bleach Bypass, Day for Night, Golden Hour, Blue Hour ...), `halation` (Classic Halation, Dreamy Red ...), `vignette` (Classic, Heavy, Subtle, Cool Edge, Warm Glow), `oldfilm`, `gateweave`, `noir`, `duotone`, `bloomglow`, `glitchrgb`, `vcrdistortion`, `halftone`, `pixelate`, `chromaticaberration`, `noisefilter` (Film Grain, Vintage VHS, 8mm ...), `phonemockup`. Three more are the raw material the assisted tools below drive: `compoundblur` (per-pixel blur from a control image), `displacementmap` (2D warp from a control image) and `censorblur` (one pixelated or blurred box, uv-placed). The full list with param keys is in `references/effects-catalog.md`.

## Stacking rules

1. A plain `set_layer_shader_filter` call replaces the whole chain on that layer.
2. `append: true` stacks a different engine. The canvas and both encoders compose at most 4 stages; a fifth throws and tells you to remove one.
3. Appending an engine already in the chain swaps that instance in place, so switching "Teal & Orange" to "Film Print" is just another call.
4. Order is render order: grade first (`cinematicgrade` or `colorgrade`), distortion or display next, light and flicker last.
5. `fxParams` override the preset's values key by key; keys not in `get_effect_schema` are ignored.

## Assisted blur and warp

Subject Blur, Liquify and Face Blur are not a sixth surface. Each bakes an asset once - a subject matte, a displacement field, a tracking keyframe track - and leaves an ordinary entry behind in the same `shaderFilters` chain as the engines above, so playback and both export encoders need nothing extra afterwards. That means the stacking rules apply to them too: each holds one of the four stages, and a plain `set_layer_shader_filter` without `append: true` wipes it along with the rest of the chain. They do not all compose the same way, though: Subject Blur APPENDS its `compoundblur`, Liquify swaps its own `displacementmap` entry in place, but Face Blur REPLACES the whole chain with its single `censorblur` - so grade first and censor second, and the grade is gone with no error. Censor first, then grade. Shutter-angle motion blur is the odd one out - it sets a field on the base clip, writes no shader filter at all, and only the export renders it.

### Subject blur - background out of focus, still one layer

`apply_subject_blur { layerId, radius, gamma, threshold }` cuts the subject out with an on-device segmentation model, then drives `compoundblur` from the cutout's alpha: subject sharp, surround softly out of focus. The layer count never changes and the subject's own pixels are never replaced, so a soft or imperfect matte degrades into a slightly soft edge rather than a visibly damaged subject.

The model is never fetched silently. It is a three-step handshake:

```
subject_blur_status { layerId: "video0" }           // { applied, modelId, modelDownloaded, sourceKind }
subject_blur_download_model { layerId: "video0" }   // only when modelDownloaded is false
apply_subject_blur { layerId: "video0", radius: 34, gamma: 1.6 }
```

Skipping the check throws `subjectBlur.MODEL_NOT_DOWNLOADED`. Which model a layer needs depends on its `sourceKind` (a still and a video want different ones), so read `subject_blur_status` per layer instead of assuming one download covers the project, and tell the user a download is pending rather than starting it behind their back.

| Param | Range | Default | What it does |
| --- | --- | --- | --- |
| `radius` | 0..64 | 30 | maximum background blur |
| `gamma` | 0.25..3 | 1.4 | falloff tightness; higher keeps more of the near-subject sharp |
| `threshold` | 0..0.9 | 0 | lifts the floor so near-subject pixels stay fully sharp |

Out-of-range values are clamped, not rejected. `apply_subject_blur` is long-running (seconds for a still, longer for video) and refuses a second application with `subjectBlur.ALREADY_APPLIED`; `remove_subject_blur { layerId }` takes it off and leaves the rest of the chain alone. The baked matte file stays on disk, but nothing reads it back: `apply_subject_blur` writes a fresh timestamped matte and re-runs the model every time, so re-applying costs the same as the first bake.

Reach for `apply_portrait_blur` (in `expocut-compositing`) instead when the user wants the background as its OWN editable layer - it splits the layer into a sharp cutout in front of a blurred copy and exposes bokeh controls (`blurRadius`, `blades`, `highlightBoost`). The two do not mix: Subject Blur refuses a layer that already has Portrait Blur with `subjectBlur.PORTRAIT_BLUR_ACTIVE`.

### Liquify - push, bloat and pucker as data

`apply_liquify { layerId, strokes }` bakes brush strokes into a displacement field and binds it to `displacementmap`, so the warp needs no new shader and renders identically on canvas and in export on both platforms.

| Stroke field | Meaning |
| --- | --- |
| `tool` | `push`, `bloat` or `pucker` |
| `x`, `y` | brush centre in normalized layer uv, 0..1 |
| `dx`, `dy` | drag vector for `push`, also in uv (0.05 moves content 5% of the frame); ignored by bloat and pucker, and optional (0) |
| `radius` | brush radius as a fraction of the layer's SHORTER axis — a circle on screen, and the same proportion of the frame on any aspect |
| `strength` | 0..1; for bloat and pucker it is the push distance, scaled by `radius` |

`apply_liquify` REPLACES the whole stroke list on every call - it never appends. To add a stroke, read the existing ones back and resend them with the new one:

```
liquify_status { layerId: "image0" }                 // { applied, strokes, maxShift }
apply_liquify { layerId: "image0", strokes: [ /* the strokes it returned */, { tool: "bloat", x: 0.5, y: 0.38, radius: 0.18, strength: 0.5 } ] }
```

An EMPTY `strokes` array removes the warp, same as `remove_liquify { layerId }`. Accumulated displacement is clamped to +/-0.125 uv (`maxShift` in the status payload) rather than wrapped, so very long drags stop moving instead of tearing.

### Face blur - privacy, with an iOS-only detector

`apply_face_blur { layerId, mode, padding, cellSize, blurRadius, minScore, samplePeriodMs }` detects faces across the clip and writes keyframed `censorblur` boxes that FOLLOW the faces, so moving subjects stay covered. Up to **four** faces are covered at once — `censorblur` carries four independent regions, and each person keeps the same region from keyframe to keyframe so the boxes do not swap places mid-shot. Beyond four the reply carries `uncoveredKeyframes` and a `warning`, and `maxSimultaneousFaces` tells you how many were there; add manual regions with `set_layer_shader_filter { effectId: "censorblur" }` for the rest, and tell the user rather than reporting a clean success. `mode` is `pixelate` (default) or `blur`; `padding` 0.35 grows the box over hair and chin; `cellSize` 26 is the mosaic cell, `blurRadius` 26 the softening when `mode: "blur"`; `minScore` 0.3 is the confidence floor and `samplePeriodMs` 250 the detection interval (lower tracks faster motion at more cost). It is long-running.

Detection is iOS only. `face_blur_status { layerId }` reports `detectionSupported`; on Android `apply_face_blur` throws `faceBlur.UNSUPPORTED_PLATFORM` rather than silently doing nothing. The Android fallback is the same filter placed by hand - a manual censor region, keyframed yourself if the subject moves:

```
face_blur_status { layerId: "video0" }               // detectionSupported: false on Android
set_layer_shader_filter { layerId: "video0", effectId: "censorblur", preset: "Face Pixels", fxParams: { centerX: 0.5, centerY: 0.34, width: 0.26, height: 0.3 } }
```

`censorblur` is placed in normalized layer uv: `centerX` / `centerY` 0..1, `width` / `height` 0.02..1, `feather` 0..0.3, `cellSize` 2..80, `blurRadius` 0..60, `pixelate` 0 or 1.

Two more failures are deliberately distinct, because for a privacy tool "no faces present" and "detection never ran" must not look the same: `faceBlur.NO_FACE_FOUND` (nothing scored above `minScore` - lower it, or censor manually) and `faceBlur.DETECTION_UNAVAILABLE` (the detector produced nothing at all; the iOS Simulator cancels face requests, so this one needs real hardware). It never censors a guessed region.

There is no remove tool. Undo is the clean route; otherwise clear BOTH halves, because the tracking lives in a discrete keyframe track and the static chain is only its first frame:

```
remove_layer_shader_filter { layerId: "video0", effectId: "censorblur" }
keyframe_clear { layerId: "video0", property: "shader.filters" }
```

### Shutter-angle motion blur

`set_layer_shutter_angle { layerId, angleDeg }` is an export-time temporal blend of each frame with the previous few, which smooths the strobing that speed ramps and stepped slow-mo produce. `angleDeg` 0 = off, 180 = the film convention, up to 720 for long trails; anything outside 0..720 is clamped. Two caveats to pass on to the user: it affects the BASE video clip only, not overlay layers, and the canvas preview does NOT simulate it - the editor shows a sharp frame, so judge it from `export_project`, never from `capture_canvas`.

### Map-driven filters (`compoundblur`, `displacementmap`)

`set_layer_shader_filter` takes a top-level `mapUri`: a local `file://` control image bound alongside the frame at texture slot 1. Only `compoundblur` and `displacementmap` accept one - any other `effectId` with a `mapUri` throws - and `mapUri: null` clears it. Canvas and both encoders read it.

- `compoundblur` reads the map as a per-pixel blur radius. That is exactly what Subject Blur binds a cutout to.
- `displacementmap` reads it as a 2D warp field. That is what Liquify binds its baked field to.
- `fxParams.mapChannel` picks what is read: `0` = luminance (default), `1` = alpha, `2` = red. A cutout PNG carries its matte in alpha, so a cutout wants `mapChannel: 1`.
- `fxParams.mapZoom` (0.25..4) scales the map. The map is STRETCHED onto the layer, never cover-cropped, so a control image with a different aspect will not line up on its own.
- Direction, measured byte-identical on iOS and Android: `off = (map/255 - 0.5) * amount`, and the map says where to sample FROM. So red above 0.5 moves content LEFT and green above 0.5 moves it UP. To push the other way, set `displacementmap`'s `scaleX` / `scaleY` (-2..2) negative, or `compoundblur`'s `invert` to 1.
- With NO map bound both still do something sensible rather than nothing: `compoundblur` blurs evenly at full radius, and `displacementmap` displaces the layer by its own pixels (its red and green, or its luminance with `lumaMode: 1`).

Never write `fxParams.hasMap` yourself. It and `mapUri` are two halves of one fact and the tool keeps them in step; setting either alone leaves the shader reading the wrong branch.

## Core workflow

1. Baseline capture and checkpoint.
2. Pick the surface: a look on one clip is a shader filter; a subtle photo-style treatment is a video effect; motion on a title or sticker is `set_layer_effect`; a backdrop is a generative shader layer.
3. Apply the preset by name. Read `get_effect_schema` first when you plan to pass `fxParams`.
4. `get_layer { layerId }` and check `shaderFilters` (or `videoEffects`, `effectId`) lists what you expect, in order.
5. `capture_canvas { timeSec }` and compare with the baseline. Time-driven engines (`lightflicker`, `warp` with speed, `glitchrgb`) look static on a still; judge them with `preview_filmstrip { fromSec: 0, toSec: 4, frames: 6 }`.
6. `save_project {}`. Before a final export of a heavily filtered project, `verify_export_parity { timesSec: [1, 4] }` shows canvas-versus-encoder pairs.

## Recipes

Film print finish on a clip.

```
set_layer_shader_filter { layerId: "video0", effectId: "cinematicgrade", preset: "Film Print", fxParams: { skinProtect: 0.8, grain: 0.25 } }
set_layer_shader_filter { layerId: "video0", effectId: "lightfx", preset: "Anamorphic Gold", append: true }
set_layer_shader_filter { layerId: "video0", effectId: "lightflicker", preset: "Film Projector", fxParams: { amount: 0.3 }, append: true }
get_layer { layerId: "video0" }                                   // shaderFilters: [cinematicgrade, lightfx, lightflicker]
preview_filmstrip { fromSec: 0, toSec: 3, frames: 6 }
```

Retro broadcast with a video-effect base.

```
set_layer_video_effects { layerId: "video0", effects: [{ effectId: "super8", intensity: 55 }, { effectId: "vignette", intensity: 40 }] }
set_layer_shader_filter { layerId: "video0", effectId: "retrodisplay", preset: "CRT Monitor", fxParams: { amount: 0.45 } }
capture_canvas { timeSec: 2 }
```

Aurora backdrop behind a title, then a glow on the title.

```
add_generative_bg_layer { effectId: "aurora", preset: "Northern Lights", startTime: 0, duration: 8 }
reorder_layer { layerId: "generativeBg0", position: "back" }      // example id; use the id the add call returned
set_layer_border_glow { layerId: "text0", mode: "breathe", color: "#7DF9FF", radius: 24, intensity: 85, layers: 2 }
capture_canvas { timeSec: 1 }
```

Light leak overlay and a Polaroid frame on a photo.

```
list_light_leaks { category: "warm-sunset" }
add_light_leak_overlay { presetId: "warm-sunset-01", startTime: 0, duration: 5, intensity: 0.7 }
set_layer_border { layerId: "image0", presetId: "polaroid", cornerRadius: 6 }
describe_canvas { timeSec: 1 }                                    // the leak adds a new "light" track on top
```

Pulse a sticker or logo without keyframes.

```
set_layer_effect { layerId: "image1", effectId: "pulse", params: { speed: 1.2, intensity: 40 } }
```

Drop the background out of focus behind a talking head, then grade the shot.

```
subject_blur_status { layerId: "video0" }                         // modelDownloaded: false
subject_blur_download_model { layerId: "video0" }
apply_subject_blur { layerId: "video0", radius: 34, gamma: 1.6, threshold: 0.1 }
set_layer_shader_filter { layerId: "video0", effectId: "cinematicgrade", preset: "Golden Skin", append: true }   // append, or the grade replaces the blur
capture_canvas { timeSec: 2 }
```

Censor a face before a repost.

```
face_blur_status { layerId: "video0" }                            // detectionSupported: true only on iOS
apply_face_blur { layerId: "video0", mode: "pixelate", padding: 0.45, samplePeriodMs: 150 }
preview_filmstrip { fromSec: 0, toSec: 4, frames: 6 }             // confirm the box FOLLOWS, not just frame 0
```

## Pitfalls

- A plain `set_layer_shader_filter` replaces the chain, and that deletes a Subject Blur, Liquify or Face Blur entry along with everything else. On a layer that already carries one of them, pass `append: true` - and count them against the 4-stage cap.
- `apply_subject_blur` and `apply_face_blur` bake before they return: seconds for a still, much longer for video. Do not fire a second call because the first looks slow.
- `mapUri` takes a local `file://` control image and only `compoundblur` and `displacementmap` accept one; the map is stretched onto the layer, so a different aspect needs `mapZoom` or a re-cropped map rather than luck.
- `set_layer_shutter_angle` is invisible on canvas by design - check `get_layer { layerId }` for `shutterAngle` and judge the look from an export, not from a capture.
- Intensity scales differ by surface: `set_layer_video_effects` uses 0..100; shader `fxParams.intensity` and `set_layer_filter` use 0..1; glow `intensity` is 0..100. Read the schema, do not guess.
- `preset` names must exist on that engine; the error lists the valid names. `fxParams` keys must come from `get_effect_schema`.
- `add_procedural_filter_layer` creates a standalone `proceduralFilter` layer that does not composite the layers beneath it and currently renders nothing on canvas or export. Put filters on the media layer with `set_layer_shader_filter` instead.
- `set_layer_effect` takes one effect per layer and replaces the previous one; it is not a chain. It validates ids against the effects registry, so custom `ai.` FxSpec ids are rejected.
- Shader filters need a real image or video layer. A shape or text layer accepts the call but the filter has nothing to shade.
- Generative backgrounds land in front. Reorder them to the back before adding text, or the title disappears behind the shader.
- `add_light_leak_overlay` inserts a new track at the front and shifts every other track index by one; re-read `list_layers` before further z-order work. Duration defaults to the loop length (3 s or more) and tiles the clip to fill `duration`.
- `set_shape_glow` throws on non-shape layers; use `set_layer_border_glow` for images, video and text.
- Light leaks, CDN thumbnails and first-time shader compiles need time; a capture straight after the call can still show the previous frame. Capture again if the result looks unchanged.
- Combining a layer mask with shader filters on Android has produced exports without the filters; run `verify_export_parity` on that platform before delivering.

## Reference

- `references/effects-catalog.md` - effect ids grouped by category with param keys, plus the 77 video effects, the popular light leaks and the border presets. It is a snapshot: `list_effects {}` is the live answer.
- `references/shaders.md` - the shaders split into generative backgrounds and shader transitions, with bucket, preset count and acceptsSource. Also a snapshot; `list_shaders {}` is live.
- https://expocut.com/mcp.html - the full tool list.
- Siblings: `expocut-color-grading`, `expocut-motion-graphics`, `expocut-social-speed-edit`, `expocut-kinetic-captions`, `expocut-shapes-layouts`, `expocut-asset-authoring`.
