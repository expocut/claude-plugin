# Tool signatures used by expocut-fx-looks

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_generative_bg_layer

Add an animated shader background layer (aurora, plasma, galaxy, lightning, threads, silk, waves, etc.). Use list_shaders (or list_effects category="generative") for ids, and get_effect_schema({id}) for the params + preset names. `preset` applies a built-in look by name (e.g. "Mercury"); `fxParams` overrides individual values. `sourceMediaUri` + `sourceMediaKind` give the shader an image/video to sample (only shaders with acceptsSource:true use it). Stretches to canvas; lands at trackIndex 0 (front) — add first to keep it behind everything.

| param | type | notes |
| --- | --- | --- |
| effectId\* | string |  |
| preset | string | Built-in preset name (see get_effect_schema). |
| fxParams | object |  |
| sourceMediaUri | string | Local file:// image/video for the shader to sample. |
| sourceMediaKind | string | one of: `image`, `video` |
| startTime | number |  |
| duration | number |  |
| opacity | number |  |

## add_light_leak_overlay

Add a CDN Light Leak as a real-footage overlay on a new "light" track above the current content. Looks the preset up by id (use list_light_leaks to discover ids). The clip is cached locally, then tiled back-to-back to fill `duration`. intensity (0..1) overrides the preset's default opacity. Distinct from apply_fx_template's leak transition.

| param | type | notes |
| --- | --- | --- |
| presetId\* | string |  |
| category | string | one of: `warm-sunset`, `cool-window`, `cool-bokeh`, `prism-rainbow`, `prism-edge`, `vintage-filmburn`, `neon`, `soft-anamorphic`, `sun-flare` |
| startTime | number | seconds |
| duration | number | seconds |
| intensity | number |  |

## add_procedural_filter_layer

Add a whole-canvas procedural filter layer (grain, dither, noise treatments, scanlines, etc.). Distinct from set_layer_filter — that's a preset per-layer; this is a separate layer that affects everything beneath it on the timeline. `preset` applies a built-in look by name; `fxParams` overrides individual values.

| param | type | notes |
| --- | --- | --- |
| effectId\* | string |  |
| preset | string | Built-in preset name (see get_effect_schema). |
| fxParams | object |  |
| startTime | number |  |
| duration | number |  |
| opacity | number |  |

## apply_face_blur

Detects every face in a video/image layer and censors it with a box that TRACKS the face over time (keyframed, so a moving subject stays covered). mode "pixelate" (default) mosaics; "blur" softens. padding grows the box so hair and chin are covered. samplePeriodMs controls how often detection runs — lower tracks faster motion at more cost. LONG-RUNNING. Detection is iOS-only today: on Android it fails with faceBlur.UNSUPPORTED_PLATFORM rather than silently doing nothing, so use the censorblur filter with a manual region there. Fails with faceBlur.NO_FACE_FOUND when a detection is too weak, and faceBlur.DETECTION_UNAVAILABLE when Vision produced nothing at all (the iOS Simulator cancels face requests — real hardware is needed). Those two are deliberately distinct: for a privacy tool, "no faces present" and "detection never ran" must never look the same. It will never censor mid-frame as a guess.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mode | string | one of: `pixelate`, `blur` |
| padding | number | box growth, default 0.35 |
| cellSize | number | mosaic cell px @1080p, default 26 |
| blurRadius | number | blur radius when mode=blur, default 26 |
| minScore | number | detection confidence floor, default 0.3 |
| samplePeriodMs | number | detection interval, default 250 |

## apply_liquify

Warps a layer with push / bloat / pucker brush strokes — the Liquify tool, expressed as data. Strokes are baked into a displacement field and rendered by the shipped displacementmap filter, so the result is identical on the canvas and in export on both platforms. Coordinates are normalized layer uv: x/y are the brush centre (0..1), dx/dy the drag for `push` (also uv, so 0.05 moves content 5% of the frame), radius a fraction of the layer's SHORTER axis, so the brush is a circle on screen and covers the same proportion of the frame whether the layer is portrait, square or landscape — strength 0..1. bloat pushes outward from the centre and pucker pulls inward. Displacement is clamped to ±0.125 uv. REPLACES any previous Liquify warp on the layer (pass the previous strokes from liquify_status plus your new ones to build up). An EMPTY strokes array removes the warp.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| strokes\* | array |  |

## apply_portrait_blur

Applies Portrait Blur to an image or video layer: cuts the subject out with the on-device model, then splits the layer into a sharp subject in front of a blurred copy of the original. blurRadius/blades/highlightBoost tune the background bokeh (blades 0 = round, 5-9 = polygonal iris). LONG-RUNNING — the bake takes seconds for a still and longer for video. Fails with portraitBlur.MODEL_NOT_DOWNLOADED if the model is missing; call portrait_blur_download_model first. Reverse with remove_portrait_blur.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| blurRadius | number | default 34 |
| blades | number | 0 = round; default 6 |
| highlightBoost | number | bokeh highlight bloom; default 4 |

## apply_subject_blur

Blurs everything EXCEPT the subject, with a soft per-pixel falloff. Bakes a cutout with the on-device model once, then drives compoundblur from its alpha — one layer, no composition change, and the subject’s own pixels are never replaced. Long-running: the bake takes seconds for a still and longer for video. The model must already be on the device (subject_blur_status / subject_blur_download_model). radius = maximum background blur (0-64, default 30); gamma = falloff tightness, higher keeps more of the near-subject sharp (0.25-3, default 1.4); threshold lifts the floor so near-subject pixels stay fully sharp (0-0.9). Use apply_portrait_blur instead when you want the background as its own editable layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| radius | number |  |
| gamma | number |  |
| threshold | number |  |

## capture_canvas

Capture the editor canvas to a PNG (or JPG) at a given frame and return it as an MCP image block, so you can SEE the project state — layer placement, colors, overlap, final composition. The leading text block is SELF-DESCRIBING for debugging: it reports the captured time, project canvas size (aspectRatio + resolution), total length, layer/track counts, and — most useful — the list of layers actually VISIBLE at that frame (sorted top-most first, each with its computed bounding box in canvas %), so an empty/wrong frame is immediately explainable. DEBUG VIEWS: xray=true dims the composition and draws labeled layer bounding boxes on top; outlinesOnly=true hides content entirely (borders only); grid=true overlays a 10%-step coordinate grid with % labels to pin-point positions — all composable with timeSec. Requires the editor mounted on the active project (Library → tap the project). timeSec scrubs the playhead first; maxWidth defaults to 512 (cap 1024). ANDROID CAVEAT: this capture is a software view-snapshot, which does NOT include camera-based 3D — a layer with rotationX/rotationY renders FLAT here even though the real screen and the export both show the tilt. When that applies to the frame you asked for, the result carries a `warnings` entry naming the affected layers; use capture_export_frame to see the tilt. Do not read a flat capture as a tilt bug on Android.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |
| xray | boolean |  |
| outlinesOnly | boolean |  |
| grid | boolean |  |

## clear_layer_shader_filters

Remove all shader filters from a layer (added via set_layer_shader_filter).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## clear_shader_source

Remove the source image/video from a shader layer so it falls back to its procedural fill.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden, scheduled outside this frame, or non-visual (audio never paints and is never listed). This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## export_project

Render and encode the active project to a video file. Reuses the in-editor export pipeline via a module-scope bridge — the editor must be mounted on this project (open_project auto-navigates so this normally just works). Encoder settings come from set_export_settings + the editor's defaults. Returns the local file:// path of the rendered video on success. Long timelines can take minutes; client should be patient (10-minute internal timeout).

No parameters.

## face_blur_status

Reports whether face detection is available on this device and whether the layer already has a face-blur track. Call before apply_face_blur so an unsupported platform is not a surprise.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## get_effect_schema

Get the full schema for ONE effect — every param's kind, default, range, and unit, plus advanced params and preset values. Use this before calling set_layer_effect / add_generative_bg_layer / add_procedural_filter_layer so fxParams stays in the effect's accepted ranges. Pair with list_effects for discovery first.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## get_layer

Return the full Layer object (every field) for a given id. Use this to diff state, then `update_layer` to patch.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## keyframe_clear

Clear all keyframes on a layer. Pass a property to clear only that track. This is the "remove animation" path — equivalent to the editor's Reset button.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property | string |  |

## liquify_status

Reports whether a Liquify warp is on a layer and returns its strokes, so they can be extended and re-applied rather than redrawn. Returns { applied, strokes, maxShift }.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## list_border_presets

List the built-in border presets (the Border panel preset row: Polaroid, Film Strip, Neon Pink, Rainbow, Cyan Breathe, …): id + name. Apply with set_layer_border({presetId}). (Distinct from border_list_presets, which lists your own custom-registered presets.)

No parameters.

## list_effects

List all visual effects available for layers (aurora, plasma, glitch, springEntrance, etc). Filter by category (entrance|exit|motion|style|glitch|generative|filter|transition|text|sticker) or scope (layer|background|filter|transition). Use the returned id with set_layer_effect.

| param | type | notes |
| --- | --- | --- |
| category | string |  |
| scope | string |  |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_light_leaks

List Light Leak overlay presets from the CDN catalog. Without `category`, returns the curated "popular" set; pass a category to list that group. Categories: warm-sunset, cool-window, cool-bokeh, prism-rainbow, prism-edge, vintage-filmburn, neon, soft-anamorphic, sun-flare. Returns id, name, category, posterUrl, loopDurationMs, defaultBlend, defaultIntensity. Pass an id to add_light_leak_overlay. (For a leak *transition* between clips use apply_fx_template instead.)

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `warm-sunset`, `cool-window`, `cool-bokeh`, `prism-rainbow`, `prism-edge`, `vintage-filmburn`, `neon`, `soft-anamorphic`, `sun-flare` |

## list_shaders

List the animated generative-background shaders (the "Shader Effects" gallery) grouped by thematic category — fluid, fire, light, cosmic, geometric, retro, nature, abstract. Returns the category chips plus each shader: id, name, category, presetCount, and acceptsSource (whether it can sample a picked image/video). Pass category to filter (omit or "all" for everything). Then call get_effect_schema({id}) for the full params + preset values, and add_generative_bg_layer({effectId}) to place it. (This is the scope="background" subset of list_effects, with the gallery's thematic buckets.)

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `all`, `fluid`, `fire`, `light`, `cosmic`, `geometric`, `retro`, `nature`, `abstract` |

## list_transitions

List all entrance/exit transitions (fadeIn, slideUp, lightCinematic, …). Use the returned id at creation time with add_text_layer / add_shape_layer transitionIn or transitionOut, or on an existing layer with set_layer_transition. Shader-category ids are cover-and-reveal GPU transitions. Durations are in seconds.

No parameters.

## list_video_effects

List all per-layer video effects (Film, Color, Mood, Stylize, Light, Blur & Focus, Distort). Use the returned ids with set_layer_video_effects.

No parameters.

## preview_filmstrip

Capture a STRIP of evenly-spaced frames across a time range and return them as labeled MCP image blocks — so you can SEE motion, a transition or pacing instead of one still. Args: fromSec (default 0), toSec (default project end), frames (1..12, default 6), maxWidth (64..512, default 320), format ("jpg" default / "png"), quality. The leading text block lists each frame index and time. Requires the editor mounted on the active project (same as capture_canvas). For a single high-detail frame use capture_canvas instead.

| param | type | notes |
| --- | --- | --- |
| fromSec | number |  |
| toSec | number |  |
| frames | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |

## remove_layer_shader_filter

Remove ONE shader filter from a layer’s chain — by effectId (first matching instance) or by zero-based index. Use clear_layer_shader_filters to remove all. Returns the remaining chain ids.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId | string |  |
| index | number |  |

## remove_liquify

Removes the Liquify warp from a layer, leaving any other filters in its chain alone.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## remove_subject_blur

Removes Subject Blur from a layer, leaving any other filters in its chain alone. The baked matte file is left on disk but is never read back — apply_subject_blur always writes a fresh timestamped matte, so re-applying re-runs the model.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## reorder_layer

Change a layer's z-order. "front" pulls it to trackIndex 0 (top); "back" pushes it past every other layer (bottom). Pass an explicit number for fine control. Other layers are shifted to keep the trackIndex sequence dense.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| position\* | any |  |

## save_history_checkpoint

Push a session-scoped checkpoint of the editor state onto the undo stack. Returns the checkpoint id. Use undo() to revert to the previous checkpoint or undo_to_checkpoint({id}) for direct jump.

| param | type | notes |
| --- | --- | --- |
| label | string |  |

## save_project

Persist the active editor session to projects.json. Call after any sequence of layer mutations to make them durable across app restarts.

No parameters.

## set_junction_transition

Put a transition on the CUT between two adjacent clips (the joiner), or change the one already there. Address the cut by the pair of layers that meet at it — call list_junctions first to find them. effectId comes from list_transitions (e.g. wipe.iris, slide.push-left, distort.warp, dissolve.cross). durationSec is clamped to what the cut can actually hold at the chosen alignment. params carries the family options, and is the ONLY route to several of them: wipe.iris takes originX / originY (0..1, where the circle grows from; 0.5/0.5 = centre) and bulge (0..1 rim refraction — a water-droplet lens riding the advancing edge); the distort family takes blur, blurAniso (0 = even blur, 1 = a directional streak), blurAngle (degrees) and blurStreak; wipes take angle / softness / borderWidth; dissolve.film takes gamma. Unknown params are ignored, out-of-range values are clamped.

| param | type | notes |
| --- | --- | --- |
| fromLayerId\* | string | Outgoing clip — the one that ends at the cut. |
| toLayerId\* | string | Incoming clip — the one that starts at the cut. |
| effectId\* | string | Transition id from list_transitions. |
| durationSec | number | Clamped to the cut's capacity. Default 1s. |
| alignment | string | one of: `center`, `start`, `end` |
| ease | string | one of: `none`, `in`, `out`, `inOut`, `custom` |
| reverse | boolean | Play the effect backwards. |
| endRatio | number | Progress reached on the final frame, 0..1. Below 1 the incoming clip never fully resolves. |
| params | object | Family options — see the description. |

## set_layer_border

Add or tune the stroke border around a layer (separate from set_layer_border_glow). presetId applies a built-in look (Polaroid, Film Strip, Neon Pink, Rainbow, … — see list_border_presets) as the base; the other args then override it. width is px @ 1080p. pattern: solid|dashed|dotted|double. cornerRadius rounds the corners (RADIUS). sides sets per-side visibility + per-side width (the SIDES / Per-side widths controls). position: inside|outside|center. Pass enabled=false to remove the stroke (preserves any glow).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| presetId | string | Built-in border preset id (see list_border_presets). |
| enabled | boolean |  |
| width | number |  |
| color | string |  |
| pattern | string | one of: `solid`, `dashed`, `dotted`, `double` |
| cornerRadius | number |  |
| position | string | one of: `inside`, `outside`, `center` |
| sides | object | Per-side { visible?, width? } for top/right/bottom/left. |

## set_layer_border_glow

Enable or tune the halo glow around any layer. Modes: static, pulse, rainbow, chase, breathe, gradient. radius: 0..40 px @ 1080p. intensity: 0..100 %. speed: 0.25..4. For gradient mode pass colorStops=["#hex1","#hex2",...]. layers (1..3) stacks halos for the "thick neon" look. Pass enabled=false to turn the halo off.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| mode | string | one of: `static`, `pulse`, `rainbow`, `chase`, `breathe`, `gradient` |
| color | string |  |
| radius | number |  |
| intensity | number |  |
| speed | number |  |
| position | string | one of: `inside`, `outside` |
| colorStops | array |  |
| borderSpeedMultiplier | number |  |
| layers | number | one of: `1`, `2`, `3` |

## set_layer_effect

Apply (or clear) a visual effect on an existing layer. Use list_effects to discover valid effectIds and which params each accepts. Pass effectId=null or "" to remove the effect.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId | string \| null |  |
| params | object |  |

## set_layer_filter

Apply a preset filter to an image or video layer (single look — e.g. "Vintage", "Lo-Fi"). For granular effect chains use set_layer_video_effects instead. intensity 0..1 blends the filter back to original. Pass filterId=null to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| filterId | string \| null |  |
| intensity | number |  |

## set_layer_overlay_color

Apply a tint overlay to any layer. Color blends multiplicatively over the rendered layer — useful for "duotone" looks, mood treatments, or unifying a clip palette. Pass color=null to remove the tint.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| color\* | string \| null |  |

## set_layer_shader_filter

Apply a procedural/shader FILTER to an EXISTING image/video layer — the 7 parametric engines (cinematicgrade: split-tone wheels + skin protection + halation; warp: swirl/fisheye/kaleidoscope/tiny-planet; retrodisplay: CRT/LED/handheld; edgesketch; lightfx; cartoon; lightflicker) plus vignette, noir, duotone, halftone, vcrdistortion, oldfilm, pixelate, glitchrgb, bloomglow, chromaticaberration, etc. Rendered live on canvas AND in the export encoder. effectId must have scope:filter (list_effects category="filter"). preset applies a named Look from the engine (get_effect_schema lists names, e.g. "Teal & Orange" on cinematicgrade); explicit fxParams override preset values. Default REPLACES the layer’s filter chain. append=true STACKS a different engine (max 4 stages compose; exceeding throws) — but if the same effectId is already in the chain, append swaps that instance in place instead of stacking a duplicate. mapUri gives a MAP-DRIVEN filter (compoundblur, displacementmap) its control image — a local file:// image sampled at texture slot 1: compoundblur reads its luminance as a per-pixel blur radius, displacementmap reads R/G (or luminance) as a warp field. Pass null to clear it. With no map, compoundblur blurs evenly and displacementmap displaces by the source’s own luminance.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId\* | string |  |
| fxParams | object |  |
| append | boolean |  |
| preset | string |  |
| mapUri | string \| null | Control image for a map-driven filter (compoundblur, displacementmap). Local file:// path; null clears it. |

## set_layer_shutter_angle

Shutter-angle motion blur on a BASE video clip — an export-time temporal blend of each frame with the previous few (echo), which smooths the strobing that speed ramps and stepped slow-mo produce. angleDeg 0 = off, 180 = film convention, up to 720 for long trails. Two caveats: it affects the BASE clip only (not overlays), and the canvas preview does NOT simulate it — the editor shows a sharp frame and only the export carries the blur, so verify with export_project rather than capture_canvas.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| angleDeg\* | number | 0 = off · 180 = film · max 720 |

## set_layer_transition

Set or change the entrance (in) / exit (out) transition on an EXISTING layer. Each role takes a transition id from list_transitions plus optional durationSec/easing/intensity/blur. Classic and Shader-category ids are mutually exclusive per role — picking one clears the other automatically. For Shader-category ids (liquidwipe, slicewipe, …) you can also "Customize" the look via preset (a named preset like "Pink Boards" / "Cyan Shards") and shaderParams (fxParams such as fillColors / angle / transparentBg / revealOnly / useTexture — see get_effect_schema). Pass {id:null} (or "none") to clear a role. Provide at least one of in/out.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object |  |
| out | object |  |

## set_layer_video_effects

Set the per-layer video effect chain (Film, Color, Mood, Stylize, Light, Blur & Focus, Distort). Each entry: {effectId, intensity 0..100, params?}. Pass an empty array to clear. Use list_video_effects to discover valid effectIds and their categories. A few effects accept `params` to change their shape rather than their strength — motionBlur takes {angle: 0..360 degrees, radius: 0..60 px}, so angle 90 gives a vertical smear instead of the default horizontal one. Unknown param keys are rejected.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effects\* | array |  |

## set_shader_source

Give an existing shader layer (generativeBg / proceduralFilter) a source image/video to sample as its fill (the "Source Media" Pick Image / Pick Video control). uri is a local file://; kind defaults to "image". Only shaders with acceptsSource:true (see get_effect_schema) actually sample it. Use clear_shader_source to remove.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| uri\* | string |  |
| kind | string | one of: `image`, `video` |

## set_shape_glow

Same surface as set_layer_border_glow but for shape layers — writes to shapeConfig.glow instead of border.glow. Target layer must be type="shape" (created via add_shape_layer).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| mode | string | one of: `static`, `pulse`, `rainbow`, `chase`, `breathe`, `gradient` |
| color | string |  |
| radius | number |  |
| intensity | number |  |
| speed | number |  |
| colorStops | array |  |
| borderSpeedMultiplier | number |  |
| layers | number | one of: `1`, `2`, `3` |
| placement | string | one of: `outer`, `inner`, `both` — Where the halo sits relative to the shape (Glow ▸ Placement). |

## set_text_effect

Apply a stacked text effect preset to an existing text layer (Style ▸ Effects — glow / outline / 3D / shadow / retro / metallic / comic / tech). Independent of set_text_style. Pass effectId=null (or "") to clear. Discover ids with list_text_effects.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId\* | string \| null |  |

## subject_blur_download_model

Downloads the segmentation model Subject Blur needs for this layer (IS-Net ~44 MB for stills, RVM for video). Explicit and separate from apply_subject_blur because it is a large fetch. No-op when the model is already present.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## subject_blur_status

Reports whether Subject Blur is applied to a layer and whether the segmentation model it needs is already on the device. Call before apply_subject_blur so a ~44 MB download is never a surprise. Returns { applied, modelId, modelDownloaded, sourceKind }.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## verify_export_parity

Pixel-level canvas-vs-export verification. Captures canvas frames at specified timestamps, exports the project, extracts matching frames from the exported video, and returns side-by-side image pairs plus comparison metrics for each timestamp. The AI can then visually inspect any differences. Use existingExportPath to skip re-exporting when iterating on comparisons. Returns image content blocks for visual inspection.

| param | type | notes |
| --- | --- | --- |
| timesSec | array | Timestamps in seconds to compare. Default [1, 3, 5]. |
| maxWidth | number | Max frame width. Default 512. |
| existingExportPath | string | Skip export, use this video path instead. |
