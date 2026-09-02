# Tool signatures used by expocut-social-speed-edit

<!-- generated from the app's live MCP registry by ExpoCut's skill-parity test; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_clip_sequence

Place N clips in order on the timeline as one call — the "room tour" / multi-scene composite. For each clip: imports the media (local uri, Pexels videoId, or a stockQuery that auto-picks the first landscape result), places it back-to-back on the timeline, adds a slow push-in (transform.scale keyframes scaled to that clip's own duration), sets an out-transition into the next clip, and — if `label` is given — adds a slide-in/hold/fade text label. Returns each clip's real layer ids (never guess ids like "video0") plus non-blocking warnings (e.g. a clip with no transition into the next one, or a label clamped to fit its clip).

| param | type | notes |
| --- | --- | --- |
| clips\* | array |  |
| startTimeSec | number |  |
| pushIn | any |  |
| transitionStyle | string \| null |  |
| transitionDurationSec | number |  |
| labelPosition | object |  |
| labelFontSize | number |  |
| labelFontFamily | string |  |
| labelDurationSec | number |  |

## add_video_layer

Add a video layer from any local file:// URI (camera roll exports, downloaded clips, TTS-generated screens, etc). For Pexels stock specifically use add_stock_video_layer. mediaOffsetSec sets the source in-point (e.g. mediaOffsetSec=8 to skip first 8s of source). The layer is fit-to-screen (full-canvas) by default; pass stretchToCanvas:false to letterbox.

| param | type | notes |
| --- | --- | --- |
| uri\* | string | file:// or absolute path |
| name | string |  |
| mediaOffsetSec | number |  |
| startTime | number |  |
| duration | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| stretchToCanvas | boolean |  |
| volume | number |  |

## auto_remove_silence

Auto-edit: detect and ripple-delete the silent gaps in a video/audio clip, closing the timeline so the result is one tight cut. Non-destructive to the media file (rebuilds the timeline layer into trimmed segments). thresholdDb (default -40), minSilenceMs (shortest gap to cut, default 500), paddingMs (silence kept around speech, default 80).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| thresholdDb | number |  |
| minSilenceMs | number |  |
| paddingMs | number |  |

## beat_cut_from_drums

Detect onsets on the isolated DRUM stem and return cut times (ms) to place cuts/transitions. Requires the clip to be separated first.

| param | type | notes |
| --- | --- | --- |
| sourceLayerId\* | string |  |
| sensitivity | number | Higher = fewer cuts. Default 1.5. |
| maxCuts | number | Cap to the N strongest cuts. |

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

## clear_junction_transition

Remove the transition from a CUT, leaving a straight cut. Addressed by the same layer pair as set_junction_transition. No-op (reports removed:false) when the cut has no transition.

| param | type | notes |
| --- | --- | --- |
| fromLayerId\* | string |  |
| toLayerId\* | string |  |

## create_project

Create a new empty project. Returns the project id so subsequent calls can target it. aspectRatio defaults to 9:16 (vertical). fps stored on exportSettings.

| param | type | notes |
| --- | --- | --- |
| name\* | string |  |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| fps | number |  |

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

## get_render_status

Report render state without starting one: { isExporting, lastExportUri, exportSettings, estimatedFrames, totalDurationSec }. export_project blocks until the file is written, so use this from a second call/connection to see whether a render is in flight or to fetch the most recent output uri.

No parameters.

## get_resize_review_queue

List layer ids flagged for review after an aspect-ratio change (the AspectChangeReviewModal queue). Empty array means nothing needs review.

No parameters.

## keyframe_add

Add or replace a scalar keyframe on a layer. Accepts image, text, shape, and video layers for the common transform/opacity/fx/border/mask/color surface. Call list_keyframe_properties to see the full property catalog and which layer types each applies to. The easing curve (interp) is optional; default is linear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `transform.x`, `transform.y`, `transform.scale`, `transform.scaleX`, `transform.scaleY`, `transform.rotation`, `transform.anchorX`, `transform.anchorY`, `opacity`, `color.hueShift`, `color.saturation`, `color.brightness`, `color.contrast`, `color.intensity`, `fx.blur`, `fx.intensity`, `mask.rect.x`, `mask.rect.y`, `mask.rect.width`, `mask.rect.height`, `mask.feather`, `mask.expansion`, `mask.rotation`, `mask.bandWidth`, `mask.gradientSoftness`, `secondaryEffect.intensity`, `audio.volume`, `filter.id`, `filter.intensity`, `transition.inIntensity`, `transition.outIntensity`, `border.width`, `border.glowIntensity`, `border.cornerRadius`, `text.color.r`, `text.color.g`, `text.color.b`, `text.stroke.color.r`, `text.stroke.color.g`, `text.stroke.color.b`, `text.stroke.width`, `border.color.r`, `border.color.g`, `border.color.b`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `anchorX`, `anchorY` — Animatable scalar property. Full dot-path (transform.scale) or shorthand (scale) accepted. |
| timeMs\* | number | Time on the timeline in milliseconds. |
| value\* | number | Numeric value at this keyframe. |
| interp | object | Easing leaving this keyframe. Shape: { type: "hold" \| "linear" } \| { type: "bezier", x1, y1, x2, y2 } \| { type: "preset", name: "ease" \| "easeIn" \| "easeOut" \| "easeInOut" \| "bounce" \| "elastic" \| "spring" }. Default linear. |

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

## list_junctions

List every CUT between two adjacent clips on the timeline, with the transition sitting on it (or null for a straight cut). A junction is derived from clip adjacency — it exists only while the two clips touch — so call this to discover the current cuts before setting one. Returns each cut's layer pair, track, time, the longest transition it can hold per alignment, and the current transition including its family params. This is the cut-level blend; for a layer's own intro/outro use set_layer_transition.

No parameters.

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_transitions

List all entrance/exit transitions (fadeIn, slideUp, lightCinematic, …). Use the returned id at creation time with add_text_layer / add_shape_layer transitionIn or transitionOut, or on an existing layer with set_layer_transition. Shader-category ids are cover-and-reveal GPU transitions. Durations are in seconds.

No parameters.

## long_video_to_short

Auto-edit: turn a long take into a short by keeping the most energetic passages (after trimming dead air) up to targetDurationSec, laid end-to-end in chronological order. maxSegmentSec caps any single passage so one long stretch cannot eat the whole budget.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| targetDurationSec\* | number | Target length of the short, seconds. |
| maxSegmentSec | number |  |

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

## remove_layer

Remove the layer with the given id from the active project.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

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

## separate_audio

Separate a clip into vocals/drums/bass/other stems on-device (non-destructive — adds 4 audio stem layers, source untouched). tier: "fast" (lightweight, low-end/quick) or "studio" (high quality; falls back to fast if it cannot run).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string | Source audio or video layer id. |
| tier | string | one of: `fast`, `studio` |
| stems | array |  |
| mutedStems | array |  |

## set_export_settings

Update the active project export settings (aspectRatio, resolution, quality, format, fps). Only the fields you pass are changed; the rest are preserved.

| param | type | notes |
| --- | --- | --- |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| resolution | string | e.g. "1080x1920" |
| quality | string |  |
| format | string |  |
| fps | number |  |

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

## set_layer_visibility

Toggle Layer.isHidden (hide from canvas + skip in export) and/or Layer.isLocked (prevent the user from selecting / dragging it in the editor). Useful for A/B previews or for protecting a finished caption layer while you tweak others.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| hidden | boolean |  |
| locked | boolean |  |

## split_layer

Cut a layer into two halves at atSec (relative to the layer's startTime). The first half keeps the original id; the second half is a fresh layer with its mediaOffset advanced by atSec so it continues playing the source seamlessly. Both halves keep all styling, effects, color settings.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| atSec\* | number |  |

## stock_search_videos

Search Pexels videos. Returns id, photographer, duration (seconds), width/height and a preview thumbnail url. Use the returned id with add_stock_video_layer. minDuration / maxDuration are post-filtered client-side (Pexels search has no native duration filter).

| param | type | notes |
| --- | --- | --- |
| query\* | string |  |
| orientation | string | one of: `landscape`, `portrait`, `square` |
| size | string | one of: `large`, `medium`, `small` |
| page | number |  |
| perPage | number |  |
| minDuration | number | seconds |
| maxDuration | number | seconds |

## trim_layer

Trim a video/audio (or any) layer. mediaOffsetSec moves the in-point into the source media; durationSec sets how long the clip plays for on the timeline; startTimeSec moves where on the timeline the clip starts. Pass any subset — omitted fields stay put.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mediaOffsetSec | number |  |
| durationSec | number |  |
| startTimeSec | number |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
