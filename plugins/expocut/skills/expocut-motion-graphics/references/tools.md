# Tool signatures used by expocut-motion-graphics

<!-- generated from the app's live MCP registry by ExpoCut's skill-parity test; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## capture_canvas

Capture the editor canvas to a PNG (or JPG) at a given frame and return it as an MCP image block, so you can SEE the project state — layer placement, colors, overlap, final composition. The leading text block is SELF-DESCRIBING for debugging: it reports the captured time, project canvas size (aspectRatio + resolution), total length, layer/track counts, and — most useful — the list of layers actually VISIBLE at that frame (sorted top-most first, each with its computed bounding box in canvas %), so an empty/wrong frame is immediately explainable. DEBUG VIEWS: xray=true dims the composition and draws labeled layer bounding boxes on top; outlinesOnly=true hides content entirely (borders only); grid=true overlays a 10%-step coordinate grid with % labels to pin-point positions — all composable with timeSec. Requires the editor mounted on the active project (Library → tap the project). timeSec scrubs the playhead first; maxWidth defaults to 512 (cap 1024).

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |
| xray | boolean |  |
| outlinesOnly | boolean |  |
| grid | boolean |  |

## clear_layer_transition

Remove transition(s) from a layer. role: in | out | both (default both). Clears both the classic and shader channel plus the duration/easing/intensity/blur tweaks for the affected role(s).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| role | string | one of: `in`, `out`, `both` |

## clear_motion_path

Remove the motion-path animation from a layer, restoring its static + keyframe position track.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## create_mask_animation

Create a complete mask animation in one call. Select any mask shape and a built-in pattern (shape-aware samples such as mirror:sample:reveal, or core patterns such as reveal, pulse, sweep, elastic), then choose a curve/easing. For full control pass keyframes as a custom graph; each node can change mask rect, feather, expansion, rotation, bandWidth, invert, opacity, layerRotation, and filter. The result is real LayerAnimation data used by canvas preview and export, and returns a receipt.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| shape | string | one of: `rectangle`, `roundedRect`, `ellipse`, `triangle`, `star`, `heart`, `cross`, `xShape`, `linear`, `mirror`, `radial`, `angular`, `diamond`, `path`, `text` |
| rect | object |  |
| rotation | number |  |
| bandWidth | number |  |
| feather | number |  |
| expansion | number |  |
| gradientSoftness | number |  |
| invert | boolean |  |
| mirrorAxis | string | one of: `horizontal`, `vertical` |
| pattern | string | Built-in pattern id. Omit when using custom keyframes. |
| curve | any | Easing applied to scalar transitions; supports named curves or cubic bezier. |
| keyframes | array | Custom animation graph nodes, sorted automatically by timeMs. |
| replaceExisting | boolean | Clear prior mask/opacity/filter tracks (default true). |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden or scheduled outside this frame. This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## export_project

Render and encode the active project to a video file. Reuses the in-editor export pipeline — the editor must be mounted on this project (open_project auto-navigates so this normally just works). Encoder settings come from set_export_settings + the editor's defaults. Returns the local file:// path of the rendered video on success. Long timelines can take minutes; client should be patient (10-minute internal timeout).

No parameters.

## get_active_project

Return the currently-open project id, layer count, and export settings.

No parameters.

## get_canvas_info

Return the canvas/preview context in one cheap call (no image, editor need not be mounted): aspectRatio + numeric aspect, pixel width/height, fps, format, quality, total duration (ms + sec), estimated frame count, layer/track counts, current playhead, isPlaying and the selected layer id. Use this to understand the frame size and timeline length before placing layers or capturing.

No parameters.

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

## keyframe_add

Add or replace a scalar keyframe on a layer. Accepts image, text, shape, and video layers for the common transform/opacity/fx/border/mask/color surface. Call list_keyframe_properties to see the full property catalog and which layer types each applies to. The easing curve (interp) is optional; default is linear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `transform.x`, `transform.y`, `transform.scale`, `transform.scaleX`, `transform.scaleY`, `transform.rotation`, `transform.anchorX`, `transform.anchorY`, `opacity`, `color.hueShift`, `color.saturation`, `color.brightness`, `color.contrast`, `color.intensity`, `fx.blur`, `fx.intensity`, `mask.rect.x`, `mask.rect.y`, `mask.rect.width`, `mask.rect.height`, `mask.feather`, `mask.expansion`, `mask.rotation`, `mask.bandWidth`, `mask.gradientSoftness`, `secondaryEffect.intensity`, `audio.volume`, `filter.id`, `filter.intensity`, `transition.inIntensity`, `transition.outIntensity`, `border.width`, `border.glowIntensity`, `border.cornerRadius`, `text.color.r`, `text.color.g`, `text.color.b`, `text.stroke.color.r`, `text.stroke.color.g`, `text.stroke.color.b`, `text.stroke.width`, `border.color.r`, `border.color.g`, `border.color.b`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `anchorX`, `anchorY` — Animatable scalar property. Full dot-path (transform.scale) or shorthand (scale) accepted. |
| timeMs\* | number | Time on the timeline in milliseconds. |
| value\* | number | Numeric value at this keyframe. |
| interp | object | Easing leaving this keyframe. Shape: { type: "hold" \| "linear" } \| { type: "bezier", x1, y1, x2, y2 } \| { type: "preset", name: "ease" \| "easeIn" \| "easeOut" \| "easeInOut" \| "bounce" \| "elastic" \| "spring" }. Default linear. |

## keyframe_add_discrete

Add a discrete (held-step) keyframe — for properties that do not interpolate (font weight, italic, mask shape, transition id, etc.). Value type follows the property: string for font/family/align/transform/pattern/glowMode/shape/transition ids; boolean for italic / invert.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `text.fontWeight`, `text.italic`, `text.fontFamily`, `text.align`, `text.transform`, `border.pattern`, `border.glowMode`, `mask.shape`, `mask.invert`, `mask.mirrorAxis`, `transition.in.id`, `transition.out.id`, `shape.fillStyle`, `lut.id` |
| timeMs\* | number |  |
| value\* | any |  |

## keyframe_clear

Clear all keyframes on a layer. Pass a property to clear only that track. This is the "remove animation" path — equivalent to the editor's Reset button.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property | string |  |

## keyframe_list

Return the full LayerAnimation JSON for a layer — every scalar track, position track, and discrete track. Use to inspect current keyframes before authoring more.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## keyframe_remove_at

Remove every keyframe at the given time across all tracks on a layer (the editor "delete column" UX). Times are matched with the same tolerance the editor uses (~1 ms). To remove only one property, pass the whole animation through keyframe_set_animation with that track stripped.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| timeMs\* | number |  |

## keyframe_set_animation

Bulk-replace the entire LayerAnimation on a layer. Use when the agent has authored a full animation plan (multiple tracks, full keyframe sequences) in one shot. Validates each property against the layer type. Pass an empty animation { tracks: [] } to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| animation\* | object |  |

## keyframe_set_interp

Replace the easing curve leaving a keyframe at the given time. Use to refine an existing animation without re-adding the keyframe value.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `transform.x`, `transform.y`, `transform.scale`, `transform.scaleX`, `transform.scaleY`, `transform.rotation`, `transform.anchorX`, `transform.anchorY`, `opacity`, `color.hueShift`, `color.saturation`, `color.brightness`, `color.contrast`, `color.intensity`, `fx.blur`, `fx.intensity`, `mask.rect.x`, `mask.rect.y`, `mask.rect.width`, `mask.rect.height`, `mask.feather`, `mask.expansion`, `mask.rotation`, `mask.bandWidth`, `mask.gradientSoftness`, `secondaryEffect.intensity`, `audio.volume`, `filter.id`, `filter.intensity`, `transition.inIntensity`, `transition.outIntensity`, `border.width`, `border.glowIntensity`, `border.cornerRadius`, `text.color.r`, `text.color.g`, `text.color.b`, `text.stroke.color.r`, `text.stroke.color.g`, `text.stroke.color.b`, `text.stroke.width`, `border.color.r`, `border.color.g`, `border.color.b`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `anchorX`, `anchorY` |
| timeMs\* | number |  |
| interp\* | object |  |

## keyframe_snapshot_at

Capture the layer's current resolved transform + opacity + color values as a column of keyframes at the given time. Useful for setting a "before" state before authoring subsequent changes — mirrors the editor's "Add Snapshot" button.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| timeMs\* | number |  |

## list_fonts

List the bundled text fonts (the Fonts tab): id, label, category, source (system / google / rtl) and isRTL. Filter by category (sans-serif, serif, display, handwriting, monospace, rounded, condensed, arabic, urdu, …) or source. Pass an id to set_text_font or add_text_layer({fontFamily}). Google Fonts beyond this set load at runtime.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `sans-serif`, `serif`, `display`, `handwriting`, `monospace`, `rounded`, `condensed`, `arabic`, `urdu` |
| source | string | one of: `system`, `google`, `rtl` |

## list_keyframe_properties

Catalog every animatable property the keyframe system supports — scalar (interpolated) and discrete (held-step) — with the layer types each applies to. Optionally filter by layerType to see only what is valid on image / text / shape / video / audio.

| param | type | notes |
| --- | --- | --- |
| layerType | string | one of: `image`, `text`, `shape`, `video`, `audio`, `animation`, `lottie` |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_motion_path_presets

List every motion-path preset (id + name + category). Use the id with set_layer_motion_path.

No parameters.

## list_transitions

List all entrance/exit transitions (fadeIn, slideUp, lightCinematic, …). Use the returned id at creation time with add_text_layer / add_shape_layer transitionIn or transitionOut, or on an existing layer with set_layer_transition. Shader-category ids are cover-and-reveal GPU transitions. Durations are in seconds.

No parameters.

## open_project

Load a project into the active editor session by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

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

## save_history_checkpoint

Push a session-scoped checkpoint of the editor state onto the undo stack. Returns the checkpoint id. Use undo() to revert to the previous checkpoint or undo_to_checkpoint({id}) for direct jump.

| param | type | notes |
| --- | --- | --- |
| label | string |  |

## save_project

Persist the active editor session to projects.json. Call after any sequence of layer mutations to make them durable across app restarts.

No parameters.

## set_aspect_lock

Lock or unlock proportional scaling on a layer's edge-handle gestures. When locked, scaleX/scaleY move together.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| locked\* | boolean |  |

## set_camera

Set (or clear) the project-level virtual camera. Tracks are keyframe arrays { t: microseconds (project-relative), v: value } — panX/panY in canvas-% units, panZ (dolly, 0 = neutral), zoom (1 = neutral), rotation in degrees. Layers opt in via update_layer patch { cameraEnabled: true, z?: -1..1 }. Pass clear: true to remove the camera.

| param | type | notes |
| --- | --- | --- |
| panXTrack | object \| null |  |
| panYTrack | object \| null |  |
| panZTrack | object \| null |  |
| zoomTrack | object \| null |  |
| rotationTrack | object \| null |  |
| parallaxStrength | number |  |
| clear | boolean |  |

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

## set_layer_anchor

Set the layer's anchor pivot for scale + rotation. 0..1 in normalized layer-local coords (top-left origin). Default (when unset) is 0.5, 0.5 = center.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| anchorX | number |  |
| anchorY | number |  |

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

## set_layer_color_adjust

Adjust hue / saturation / brightness on an image, video, or shape layer. hue: 0..360 degrees of rotation. saturation: -1 (greyscale) to +1 (double). brightness: -1 (black) to +1 (white). intensity: 0..1 global blend.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| hue | number |  |
| saturation | number |  |
| brightness | number |  |
| intensity | number |  |

## set_layer_effect

Apply (or clear) a visual effect on an existing layer. Use list_effects to discover valid effectIds and which params each accepts. Pass effectId=null or "" to remove the effect.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId | string \| null |  |
| params | object |  |

## set_layer_fade

Set per-layer fade-in and/or fade-out (milliseconds). Works on every layer type. For video/audio it ducks the alpha + volume envelope; for text/shape it cross-fades the rendered alpha. Pass 0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## set_layer_filter

Apply a preset filter to an image or video layer (single look — e.g. "Vintage", "Lo-Fi"). For granular effect chains use set_layer_video_effects instead. intensity 0..1 blends the filter back to original. Pass filterId=null to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| filterId | string \| null |  |
| intensity | number |  |

## set_layer_mask

Clip a layer to a mask — the full Layer Mask panel. SHAPE: rectangle, roundedRect (corner radius rides bandWidth 0..0.5 — a squircle/pill panel), ellipse (Circle), triangle, star, heart, cross, xShape, linear, mirror, radial, angular, diamond, path, text. ADJUST: rect {x,y,width,height} in 0..1 layer space (x/y = offset, w/h = size) + rotation (degrees). EDGE: feather (px @1080p), invert (show outside the shape). EFFECT: effect {type, intensity, speed, curve} = cinematic motion on the masked content (zoomIn/Out, pulse, breathe, panLeft/Right/Up/Down, kenBurns, spin, sway, shake; type="none" clears); morph {material, intensity, detail, direction} = Shape-Morph material between shape keyframes (water/wave/sand/air/stone/particles/marbles/wires; "none" clears). shape="text" is Video-in-Text via textData {content, fontFamily?, fontWeight?, italic?, align?}. Pass enabled=false to remove the mask.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| shape | string | one of: `rectangle`, `roundedRect`, `ellipse`, `triangle`, `star`, `heart`, `cross`, `xShape`, `linear`, `mirror`, `radial`, `angular`, `diamond`, `path`, `text` |
| rect | object |  |
| rotation | number | degrees, clockwise about rect centre |
| bandWidth | number | mirror shape only, 0..1 |
| feather | number |  |
| invert | boolean |  |
| textData | object |  |
| effect | object |  |
| morph | object |  |

## set_layer_motion_path

Animate a layer along a preset motion path (arc, loop, heart, spiral, …) instead of authoring position keyframes. When set, the path overrides the layer's position track for its full duration. presetId must match an id from MOTION_PATH_PRESETS — call list_motion_path_presets to discover. scale=fraction of canvas (0..1, default 0.5). offsetX/Y nudge the path centre in canvas-%. rotateDeg rotates the whole path. orientToPath=true makes the layer face along the tangent.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| presetId\* | string |  |
| scale | number |  |
| offsetX | number |  |
| offsetY | number |  |
| rotateDeg | number |  |
| orientToPath | boolean |  |
| autoReverse | boolean |  |
| phase | number |  |

## set_layer_scale_xy

Independent horizontal / vertical scale on a layer (overrides the uniform scale). Pass scaleX=-1 to mirror horizontally, scaleY=-1 to flip vertically. Setting either side leaves the uniform `scale` in place as a multiplier.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| scaleX | number |  |
| scaleY | number |  |

## set_layer_speed

Set a video/audio layer's playback speed (slow-mo / fast-forward). speed=2 plays twice as fast and halves the clip's timeline duration; speed=0.5 is slow motion and doubles it. The source in/out points are preserved (only the timeline length changes). keepPitch (default true) keeps the audio pitch natural; set false for the classic varispeed effect. Video / audio layers only. Presets: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| speed\* | number | 0.1..100 (e.g. 0.5 = slow-mo, 2 = 2× faster) |
| keepPitch | boolean | preserve audio pitch (default true) |

## set_layer_transition

Set or change the entrance (in) / exit (out) transition on an EXISTING layer. Each role takes a transition id from list_transitions plus optional durationSec/easing/intensity/blur. Classic and Shader-category ids are mutually exclusive per role — picking one clears the other automatically. For Shader-category ids (liquidwipe, slicewipe, …) you can also "Customize" the look via preset (a named preset like "Pink Boards" / "Cyan Shards") and shaderParams (fxParams such as fillColors / angle / transparentBg / revealOnly / useTexture — see get_effect_schema). Pass {id:null} (or "none") to clear a role. Provide at least one of in/out.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object |  |
| out | object |  |

## set_layer_volume_keyframes

Set the volume automation curve on an audio or video layer. keyframes are sorted by timeMs internally; the encoder linearly interpolates between them. Common pattern: duck under a voice-over by adding [{0,1},{ducked_start,1},{ducked_end,0.3},…,{end,1}].

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| keyframes\* | array |  |

## set_text_animation

Set text-specific entrance / exit / loop animations on an existing text layer (distinct from generic transitionIn/Out). Use list_text_animations to discover ids. Each slot is optional; pass null to clear. Duration is in seconds; loopSpeed is a multiplier.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| inId | string \| null |  |
| outId | string \| null |  |
| loopId | string \| null |  |
| inDurationSec | number |  |
| outDurationSec | number |  |
| loopSpeed | number |  |
| inParams | object \| null |  |
| outParams | object \| null |  |
| loopParams | object \| null |  |

## set_typewriter

Enable a character-by-character typewriter reveal on a text layer. charDelayMs sets how fast each character appears (30-80 ms = human-feeling; lower = robotic-fast). Pass charDelayMs=0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| charDelayMs | number |  |
| startDelayMs | number |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
