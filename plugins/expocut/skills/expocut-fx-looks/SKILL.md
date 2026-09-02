---
name: expocut-fx-looks
description: "Apply ExpoCut's stylised looks through its MCP server - the 30 shader filters including the seven parametric engines (cinematicgrade, warp, retrodisplay, edgesketch, lightfx, cartoon, lightflicker) and their named presets via set_layer_shader_filter, the 77 per-layer video effects (set_layer_video_effects), 110 animated shaders with presets (add_generative_bg_layer), layer animations from the effects catalog (set_layer_effect), CDN light-leak overlays, border presets and neon glow. Use for \"film look\", \"film grain\", \"halation\", \"VHS\", \"CRT\", \"retro\", \"glitch\", \"cartoon\", \"sketch\", \"lens flare\", \"light leak\", \"neon glow\", \"border\", \"vignette\", \"animated background\", \"aurora / plasma / galaxy\", \"kaleidoscope\", \"fisheye\", \"stack effects on this clip\". Do not use for colour correction, LUTs and CDL (expocut-color-grading), transitions between clips (expocut-social-speed-edit), keyframed motion (expocut-motion-graphics), or registering new effects (expocut-asset-authoring)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# FX and looks with ExpoCut

You are the finishing artist. Every look below is stored as fields on a layer (`shaderFilters`, `videoEffects`, `effectId` + `fxParams`, `border`, an overlay layer); nothing is baked into the media and everything is undoable. Prefer a named preset, tune one or two parameters, and look at the frame before adding more.

## When to use / hand off

- Filters, engines, video effects, animated shader backgrounds, light leaks, borders and glow: this skill.
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

## The five surfaces

| Surface | Tools | Notes |
| --- | --- | --- |
| Shader filter chain on a layer | `set_layer_shader_filter { layerId, effectId, preset, fxParams, append }`, `remove_layer_shader_filter { layerId, effectId }` or `{ layerId, index }`, `clear_layer_shader_filters { layerId }` | `effectId` must have scope `filter` (`list_effects { scope: "filter" }`, 30 ids). Rendered on canvas and by both export encoders. Default call replaces the chain; `append: true` stacks up to 4 stages. |
| Video effect chain | `set_layer_video_effects { layerId, effects: [{ effectId, intensity }] }`, `list_video_effects {}` | 77 ids in Film / Color / Mood / Stylize / Light / Blur & Focus / Distort. `intensity` is 0..100. The array replaces the chain; `[]` clears. Unknown ids throw. |
| Layer animation effect | `set_layer_effect { layerId, effectId, params }`, `list_effects { category }` | Scope `layer` ids: entrance (`fadeIn`, `popIn`, `bounceIn`), exit (`fadeOut`, `zoomOut`), motion (`pulse`, `breathe`, `slowZoom`, `orbit`), glitch (`glitch`, `rgbSplit`, `flicker`), style (`neonGlow`, `twinkle`), text and sticker. `params` are usually `speed` and `intensity` (0..100). One effect per layer; `effectId: null` removes it. |
| Shader layers | `add_generative_bg_layer { effectId, preset, fxParams, sourceMediaUri, sourceMediaKind, startTime, duration, opacity }`, `list_shaders { category }`, `set_shader_source { layerId, uri, kind }`, `clear_shader_source { layerId }`, `add_procedural_filter_layer { effectId, preset, fxParams }` | Scope `background` ids (51 generative + 58 shader transitions + `lightleak`). A new shader layer stretches to the canvas and lands at trackIndex 0 (front); send it back with `reorder_layer { layerId, position: "back" }`. Every background shader has a `transparentBg` param for overlaying footage. |
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

Other scope-filter ids worth knowing: `colorgrade` (24 presets: Warm Pop, Cool Cinematic, Bleach Bypass, Day for Night, Golden Hour, Blue Hour ...), `halation` (Classic Halation, Dreamy Red ...), `vignette` (Classic, Heavy, Subtle, Cool Edge, Warm Glow), `oldfilm`, `gateweave`, `noir`, `duotone`, `bloomglow`, `glitchrgb`, `vcrdistortion`, `halftone`, `pixelate`, `chromaticaberration`, `noisefilter` (Film Grain, Vintage VHS, 8mm ...), `phonemockup`. The full list with param keys is in `references/effects-catalog.md`.

## Stacking rules

1. A plain `set_layer_shader_filter` call replaces the whole chain on that layer.
2. `append: true` stacks a different engine. The canvas and both encoders compose at most 4 stages; a fifth throws and tells you to remove one.
3. Appending an engine already in the chain swaps that instance in place, so switching "Teal & Orange" to "Film Print" is just another call.
4. Order is render order: grade first (`cinematicgrade` or `colorgrade`), distortion or display next, light and flicker last.
5. `fxParams` override the preset's values key by key; keys not in `get_effect_schema` are ignored.

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

## Pitfalls

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

- `references/effects-catalog.md` - all 224 effect ids grouped by category with param keys, plus the 77 video effects, the 18 popular light leaks and the 12 border presets.
- `references/shaders.md` - the 110 shaders split into generative backgrounds and shader transitions, with bucket, preset count and acceptsSource.
- https://expocut.com/mcp.html - the full tool list.
- Siblings: `expocut-color-grading`, `expocut-motion-graphics`, `expocut-social-speed-edit`, `expocut-kinetic-captions`, `expocut-shapes-layouts`, `expocut-asset-authoring`.
