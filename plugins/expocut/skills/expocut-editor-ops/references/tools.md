# Tool signatures used by expocut-editor-ops

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_text_layer

Add a text layer. Defaults to fullWidth=true + textAlign="center" so the text auto-fits the canvas regardless of aspect ratio (9:16, 16:9, 1:1) — perfect for title cards. x/y are the TOP-LEFT corner of the text block in canvas % (fullWidth pins x=0). Use verticalAnchor="top|center|bottom" instead of computing y: it places the block top at 12 %, the glyph centre at 50 %, or the block bottom at 88 % on any aspect. startTime/duration are seconds. Use transitionIn/Out (e.g. "fade", "scale") for entrance/exit animations.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |
| fontSize | number |  |
| fontFamily | string |  |
| fontWeight | string | e.g. "400", "700", "bold" |
| fontItalic | boolean |  |
| textColor | string | #RRGGBB |
| textAlign | string | one of: `left`, `center`, `right`, `justify` |
| fullWidth | boolean | Default true. Layer spans full canvas width; textAlign places the glyphs. |
| verticalAnchor | string | one of: `top`, `center`, `bottom` — Convenience for y. Use this OR y, not both. |
| x | number | Top-left x percent 0..100. Ignored when fullWidth=true. |
| y | number | Top-left y percent 0..100. |
| scale | number |  |
| rotation | number | degrees |
| opacity | number | 0..1 |
| letterSpacing | number | pt tracking; 2–3 for luxe caps labels |
| textTransform | string | one of: `none`, `uppercase`, `lowercase`, `capitalize` |
| lineHeight | number | multiplier, e.g. 1.2 |
| startTime | number | seconds |
| duration | number | seconds |
| fadeInMs | number |  |
| fadeOutMs | number |  |
| transitionIn | string |  |
| transitionOut | string |  |
| transitionInDuration | number | seconds |
| transitionOutDuration | number | seconds |
| textShadowColor | string |  |
| textShadowBlur | number |  |
| textStrokeColor | string |  |
| textStrokeWidth | number |  |
| textAutoFit | object | Shrink-to-fit. Resolver picks the largest fontSize ≤ maxSize that fits the text within maxLines lines, never below minSize. |

## analyze_pixels

Native pixel-analysis pipeline: load a base64 image, run color-range masks, measure per-mask bounding box + center, optionally diff against a reference image. Use it to verify a layer's exact position/size in the rendered MP4 against canvas, spot drift between two captures, or measure how much of a text glyph is obscured by an overlapping shape. Pair with `capture_canvas`.

| param | type | notes |
| --- | --- | --- |
| imageBase64\* | string |  |
| referenceBase64 | string |  |
| masks\* | array |  |

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

## capture_export_frame

P3.1: render ONE export-accurate frame of the OPEN project at timeSec (default playhead) through the editor's real export builder in single-frame mode — ALL overlay layers composite exactly as a full export (text/shapes/images/shaders/lower-thirds/transcript). Returns an inline PNG. Needs the editor mounted (call open_project first). This is the true preview≡export still.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| format | string | one of: `png`, `jpg` |

## capture_project_base_frame

P3.1: render the OPEN project's lowest-track video layer at timeSec (default playhead) through the NATIVE effect compositor with that layer's real filter LUT / chroma key / colour grading / shader filters, and return an inline image. Base video only (overlays TBD). Fixes the black/poster frame MCP returns for effected video.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |

## clear_resize_review

Dismiss the entire aspect-change review queue (equivalent to accepting all re-anchored layers).

No parameters.

## compose_single_frame

P3.1: render ONE frame of the OPEN project through the NATIVE EXPORT pipeline (composeVideo single-frame mode) — same videoComposition + overlay loop as a real export, rasterized at timeSec via AVAssetImageGenerator. Returns an inline image that matches export by construction. Base video + its effects for now (full overlay serialization shares the editor builder next).

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |

## create_project

Create a new empty project. Returns the project id so subsequent calls can target it. aspectRatio defaults to 9:16 (vertical). fps stored on exportSettings.

| param | type | notes |
| --- | --- | --- |
| name\* | string |  |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| fps | number |  |

## delete_project

Permanently delete a project from disk + the Library store. If the deleted project is currently open in the editor, the editor session is cleared (projectId set to null). This is destructive — there is no undo.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden, scheduled outside this frame, or non-visual (audio never paints and is never listed). This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## duplicate_project

Duplicate a project — clones its layers, tracks, timelineClips, exportSettings into a fresh id. Useful for branching a working draft before risky edits. Returns the new project id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name | string |  |

## export_project

Render and encode the active project to a video file. Reuses the in-editor export pipeline via a module-scope bridge — the editor must be mounted on this project (open_project auto-navigates so this normally just works). Encoder settings come from set_export_settings + the editor's defaults. Returns the local file:// path of the rendered video on success. Long timelines can take minutes; client should be patient (10-minute internal timeout).

No parameters.

## fx_compose_from_template

Materialize a full FxSpec from a curated template family and overrides. Templates: transition.distortion.{warp|ripple|melt|inkBleed|liquid|twirl|pinch|displace} and transition.lightLeak.{warm-sunset|cool-window|prism-rainbow|vintage-orange|neon-magenta|soft-anamorphic}. The agent never writes raw GLSL through this tool — only typed param overrides.

| param | type | notes |
| --- | --- | --- |
| templateId\* | string |  |
| name\* | string |  |
| id | string | Optional; auto-generated when omitted. |
| params | object |  |
| durationMs | number |  |
| persist | boolean |  |

## fx_register_spec

Submit a full FxSpec (declarative or shader) and admit it to the registry. Validates shape, checks id format, applies quota / rate limit, then admits. Returns the admitted id; the spec is immediately usable via set_layer_effect.

| param | type | notes |
| --- | --- | --- |
| spec\* | object |  |
| persist | boolean |  |
| overwriteIfExists | boolean |  |
| idempotencyKey | string |  |

## get_active_project

Return the currently-open project id, layer count, and export settings.

No parameters.

## get_authoring_capabilities

Report which AI asset-authoring surfaces are permitted right now, the current permission tier, and the lowest tier that would unlock each locked surface. Call this BEFORE planning any fx_register_spec / lut_register_custom / border_register_preset / mask_register_shape work — a locked surface means the user must raise a setting, not that the app lacks the feature.

No parameters.

## get_canvas_info

Return the canvas/preview context in one cheap call (no image, editor need not be mounted): aspectRatio + numeric aspect, pixel width/height (from the stored resolution, else the 1080p preset — resolutionAssumed=true), the editor canvas size in points, layerBaseWidthPct / layerBaseHeightPct (how big an unsized layer lands, as % of the canvas), fps, format, quality, total duration (ms + sec), estimated frame count, layer/track counts, current playhead, isPlaying and the selected layer id. Use this to understand the frame size, the default layer size and the timeline length before placing layers or capturing.

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

## get_layer_schema

Return the public field list for the Layer type, grouped by category (core, text, animation, transition, audio, media, color, visual_effects, compositing, masks, shape, widget_configs, lottie, transcript). Filter by passing `category`. Use this to discover which fields are valid in update_layer({patch}).

| param | type | notes |
| --- | --- | --- |
| category | string |  |

## get_project

Return the entire active project content: { projectId, layers, tracks, timelineClips, exportSettings, selectedLayerId, playheadMs }. Heavy — use list_layers for a compact summary unless you really need everything.

No parameters.

## get_render_status

Report render state without starting one: { isExporting, lastExportUri, exportSettings, estimatedFrames, totalDurationSec }. export_project blocks until the file is written, so use this from a second call/connection to see whether a render is in flight or to fetch the most recent output uri.

No parameters.

## get_resize_review_queue

List layer ids flagged for review after an aspect-ratio change (the AspectChangeReviewModal queue). Empty array means nothing needs review.

No parameters.

## get_selection

Return the currently-selected layer id (or null).

No parameters.

## get_widget_config

Read the current widget config for a layer. Returns { field, config } where field is the layer's *Config key.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## list_checkpoints

List session checkpoints with id, label, ts, and cursor position.

No parameters.

## list_fonts

List the bundled text fonts (the Fonts tab): id, label, category, source (system / google / rtl) and isRTL. Filter by category (sans-serif, serif, display, handwriting, monospace, rounded, condensed, arabic, urdu, …) or source. Pass an id to set_text_font or add_text_layer({fontFamily}). Google Fonts beyond this set load at runtime.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `sans-serif`, `serif`, `display`, `handwriting`, `monospace`, `rounded`, `condensed`, `arabic`, `urdu` |
| source | string | one of: `system`, `google`, `rtl` |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_projects

List all projects with id, name, aspectRatio, and updatedAt.

No parameters.

## list_text_animations

List all text-specific animation ids (entrance, exit, loop) usable in set_text_animation. Includes the 57-preset typewriter family — each entry exposes its tunable params (passed to set_text_animation via inParams / outParams / loopParams).

No parameters.

## list_tracks

List every track with id, type, name, layerCount, isVisible, isMuted, volume. Tracks group layers in the timeline UI.

No parameters.

## list_transitions

List all entrance/exit transitions (fadeIn, slideUp, lightCinematic, …). Use the returned id at creation time with add_text_layer / add_shape_layer transitionIn or transitionOut, or on an existing layer with set_layer_transition. Shader-category ids are cover-and-reveal GPU transitions. Durations are in seconds.

No parameters.

## mute_video_audio

Mute or unmute the embedded audio on a video layer (does not detach the audio into its own track).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| muted\* | boolean |  |

## open_project

Load a project into the active editor session by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## playback_status

Report current playback state: { isPlaying, playheadMs, totalDurationMs }.

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

## relink_video_audio

Re-attach a detached audio layer back into its source video. Removes the audio layer and clears the video's muted flag.

| param | type | notes |
| --- | --- | --- |
| audioLayerId\* | string |  |

## remove_layer

Remove the layer with the given id from the active project.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## rename_project

Rename a project. Updates projects.json + the Library store so the new name shows immediately. Does not touch any of the project's layers / clips / settings.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |

## render_composited_frame

P3.1 test: render one video frame at timeSec through the NATIVE effect compositor (same chain as export: chroma→mask→fade→grade→LUT) and return an inline image {base64,width,height,mimeType}. Pass videoPath (file://) and optional lut / chromaKey / colorGrading job-spec objects. Returns an error if the native method is unavailable (needs rebuild / iOS).

| param | type | notes |
| --- | --- | --- |
| videoPath\* | string |  |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| lut | object |  |
| chromaKey | object |  |
| colorGrading | object |  |
| shaderFilters | array |  |
| lutRegions | array |  |
| border | object |  |
| overlayImageBase64 | string |  |

## render_still

Render the current frame to an image FILE on disk and return its file:// uri (plus width/height/atMs). Unlike capture_canvas (which returns an inline preview image for you to look at), this writes a reusable file — e.g. a poster/thumbnail, or a frame to re-import with add_image_layer. timeSec scrubs the playhead first; maxWidth defaults to the canvas pixel width (cap 2160). Requires the editor mounted on the active project.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |

## reorder_layer

Change a layer's z-order. "front" pulls it to trackIndex 0 (top); "back" pushes it past every other layer (bottom). Pass an explicit number for fine control. Other layers are shifted to keep the trackIndex sequence dense.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| position\* | any |  |

## reorder_track

Move a track to a new index in the tracks array. toIndex is clamped to [0, tracks.length-1].

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| toIndex\* | number |  |

## save_history_checkpoint

Push a session-scoped checkpoint of the editor state onto the undo stack. Returns the checkpoint id. Use undo() to revert to the previous checkpoint or undo_to_checkpoint({id}) for direct jump.

| param | type | notes |
| --- | --- | --- |
| label | string |  |

## save_project

Persist the active editor session to projects.json. Call after any sequence of layer mutations to make them durable across app restarts.

No parameters.

## seek_seconds

Move the playhead to a time in seconds (convenience wrapper around `seek` which takes seconds already). Exists for explicit-time-unit callers.

| param | type | notes |
| --- | --- | --- |
| timeSec\* | number |  |

## select_layer

Set the currently-selected layer (or null to clear). Affects in-app inspector + capture_canvas highlights.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string \| null |  |

## set_aspect_lock

Lock or unlock proportional scaling on a layer's edge-handle gestures. When locked, scaleX/scaleY move together.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| locked\* | boolean |  |

## set_blur_fill

Override the auto-blur-background fill for a `fitMode: contain` layer. true = always on, false = always off, null = auto (the CapCut-style default for 9:16/4:5/1:1 canvases).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled\* | boolean \| null |  |

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

## set_export_settings

Update the active project export settings (aspectRatio, resolution, quality, format, fps). Only the fields you pass are changed; the rest are preserved.

| param | type | notes |
| --- | --- | --- |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| resolution | string | e.g. "1080x1920" |
| quality | string |  |
| format | string |  |
| fps | number |  |

## set_layer_alpha_mode

Set the source-alpha interpretation: straight (RGB independent) or premultiplied (RGB already multiplied by alpha). Mismatch causes dark fringes around edges — set based on source metadata.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mode\* | string | one of: `straight`, `premultiplied` |

## set_layer_anchor

Set the layer's anchor pivot for scale + rotation. 0..1 in normalized layer-local coords (top-left origin). Default (when unset) is 0.5, 0.5 = center.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| anchorX | number |  |
| anchorY | number |  |

## set_layer_audio_effects

Set the per-layer audio effect chain (EQ, dynamics, spatial, modulation, filter, voice). Each entry: {effectId, enabled?, params?}. params are effect-specific (e.g. bass_boost takes gain/frequency/bandwidth). Use list_audio_effects to discover.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effects\* | array |  |

## set_layer_audio_offset

Nudge an audio layer's playback relative to its timeline startTime. Positive offset = audio plays LATER (delayed); negative = EARLIER. Typical lip-sync range is ±200ms; larger values for creative misalignment. Combined with startTime and mediaOffset by the exporter; the encoder schema does not have a separate audioOffset field.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| offsetMs\* | number |  |

## set_layer_audio_transitions

Set audio entrance/exit transitions (fades, beat-aligned cuts, filter sweeps). Use list_audio_transitions for valid ids. Pass in=null or out=null to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object \| null |  |
| out | object \| null |  |

## set_layer_background_remover

Stores a background-removal INTENT on the layer. NOTE: this flag is not yet consumed by the canvas renderer or either export encoder — today it only lights the toolbar affordance, so setting it does NOT remove the background in a preview or an export. For a result that actually renders, use apply_portrait_blur (bakes a cutout with the on-device model and composes it), or drive the Background Removal screen in the app. quality/featherPx are stored for the future per-frame path. Pass enabled=false to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| quality | string | one of: `fast`, `balanced`, `accurate` |
| featherPx | number |  |

## set_layer_blend_mode

Composite blend mode for this layer. One of: normal, multiply, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, add, subtract.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mode\* | string | one of: `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `add`, `subtract` |

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

## set_layer_cdl

Apply an ASC CDL grade (slope/offset/power + saturation) to a layer. Each of slope/offset/power is an RGB triplet. Partial inputs merge with existing values; identity = [1,1,1]/[0,0,0]/[1,1,1] sat=1.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| slope | array |  |
| offset | array |  |
| power | array |  |
| saturation | number |  |

## set_layer_chroma_key

Configure green-screen / chroma-key removal on a video layer. keyColor is hex (#00FF00 for green-screen, #0000FF for blue). similarity (0..1) widens the keyed-out hue range, smoothness (0..1) softens the edge, spill (0..1) desaturates residual color cast.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| keyColor | string |  |
| similarity | number |  |
| smoothness | number |  |
| spill | number |  |

## set_layer_color_adjust

Adjust hue / saturation / brightness on an image, video, or shape layer. hue: 0..360 degrees of rotation. saturation: -1 (greyscale) to +1 (double). brightness: -1 (black) to +1 (white). intensity: 0..1 global blend.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| hue | number |  |
| saturation | number |  |
| brightness | number |  |
| intensity | number |  |

## set_layer_crop

Crop an image or video layer to a sub-rectangle of the source. All four values are normalised 0..1 — {x:0, y:0, width:1, height:1} is the identity (no crop). Origin is top-left. Native encoders clamp invalid rects to the identity.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| x\* | number |  |
| y\* | number |  |
| width\* | number |  |
| height\* | number |  |

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

## set_layer_fit_mode

Set how a media layer fits inside its bounding box: contain | cover | fill | scale-down | none. Per CLAUDE.md §13, this also keeps the legacy `stretchToCanvas` boolean in lockstep (fill ↔ true, others ↔ false).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fitMode\* | string | one of: `contain`, `cover`, `fill`, `scale-down`, `none` |

## set_layer_is_adjustment

Convert this layer to an adjustment layer (its effect stack applies to every layer beneath it). Pass disabled=true to suspend without deleting.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| isAdjustment\* | boolean |  |
| disabled | boolean |  |

## set_layer_is_null

Mark a layer as a "null object" — it carries a transform rig for parented children but renders nothing itself.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| isNull\* | boolean |  |

## set_layer_lut

Apply a 3D LUT (color lookup table) to an image or video layer. `id` is the LUT id from the app's registered LUTs. intensity blends 0..1 (1 = full LUT, 0 = no change). Pass id=null or "" to remove the LUT.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| id | string \| null |  |
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

## set_layer_overlay_color

Apply a tint overlay to any layer. Color blends multiplicatively over the rendered layer — useful for "duotone" looks, mood treatments, or unifying a clip palette. Pass color=null to remove the tint.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| color\* | string \| null |  |

## set_layer_parent

AE-style parenting: child layer inherits the parent's world-space transform (position × scale × rotation). Pass parentId=null to detach.

| param | type | notes |
| --- | --- | --- |
| childId\* | string |  |
| parentId\* | string \| null |  |

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

## set_layer_video_effects

Set the per-layer video effect chain (Film, Color, Mood, Stylize, Light, Blur & Focus, Distort). Each entry: {effectId, intensity 0..100, params?}. Pass an empty array to clear. Use list_video_effects to discover valid effectIds and their categories. A few effects accept `params` to change their shape rather than their strength — motionBlur takes {angle: 0..360 degrees, radius: 0..60 px}, so angle 90 gives a vertical smear instead of the default horizontal one. Unknown param keys are rejected.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effects\* | array |  |

## set_layer_visibility

Toggle Layer.isHidden (hide from canvas + skip in export) and/or Layer.isLocked (prevent the user from selecting / dragging it in the editor). Useful for A/B previews or for protecting a finished caption layer while you tweak others.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| hidden | boolean |  |
| locked | boolean |  |

## set_layer_volume_keyframes

Set the volume automation curve on an audio or video layer. keyframes are sorted by timeMs internally; the encoder linearly interpolates between them. Common pattern: duck under a voice-over by adding [{0,1},{ducked_start,1},{ducked_end,0.3},…,{end,1}].

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| keyframes\* | array |  |

## set_shape_canvas_relative_size

Size a shape layer as a fraction of the canvas (widthPct + heightPct in 0..100). Use for bottom-strip bars and any shape that must keep a fixed canvas fraction at any canvas size.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| widthPct | number |  |
| heightPct | number |  |

## set_shape_fill

Set the fill of an existing shape layer (the Fill tab). style maps to the UI tiles: "solid" = Color (needs color), "transparent" = Empty, "gradient" = Blend (needs gradientColors[2+] + gradientDirection), "texture" = Pattern (needs textureId from list_shape_textures), "mesh" = Mesh (needs meshPresetId from list_mesh_gradients), "image" = Photo / "video" = Movie (needs mediaUri + optional mediaFit). Switching style clears the other fill sources. opacity 0..1 sets the shape opacity.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| style\* | string | one of: `solid`, `transparent`, `gradient`, `texture`, `mesh`, `image`, `video` |
| color | string | #RRGGBB (style="solid"). |
| gradientColors | array | 2+ stops (style="gradient"). |
| gradientDirection | string | one of: `horizontal`, `vertical`, `diagonal`, `radial` |
| textureId | string | Pattern id from list_shape_textures (style="texture"). |
| meshPresetId | string | Mesh id from list_mesh_gradients (style="mesh"). |
| mediaUri | string | Local file:// (style="image"/"video"). |
| mediaFit | string | one of: `cover`, `contain`, `fill`, `none` |
| opacity | number | 0..1 |

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

## set_shape_outline

Set the outline (stroke) of an existing shape layer (the Outline tab): color, width (px = Outline Thickness), align (inside / center / outside = Position), opacity (0..1, the shape opacity). Pass width:0 to remove the outline. Only the fields you pass change.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| color | string | #RRGGBB |
| width | number | px (Outline Thickness) |
| align | string | one of: `inside`, `center`, `outside` |
| opacity | number | 0..1 |

## set_shape_style

Apply a one-tap shape style preset (the "Pick a look" row — e.g. "clean", "neon-pink", "rainbow", "ghost"). The preset rewrites fill + outline + glow together. Discover ids with list_shape_styles.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| styleId\* | string |  |

## set_stretch_pan

Pan a stretchToCanvas layer within the canvas (percentage of canvas, can be negative). Ignored when the layer is not in fill / stretch mode.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| x | number |  |
| y | number |  |

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

## set_text_effect

Apply a stacked text effect preset to an existing text layer (Style ▸ Effects — glow / outline / 3D / shadow / retro / metallic / comic / tech). Independent of set_text_style. Pass effectId=null (or "") to clear. Discover ids with list_text_effects.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId\* | string \| null |  |

## set_text_font

Set the font of an existing text layer (Fonts tab). fontFamily is a font id from list_fonts (e.g. "helvetica-neue", "futura", "georgia"). Bundled ids are validated; a font not in the bundled set is still accepted (Google Fonts load at runtime) and flagged in the response. Clears nothing — use list_fonts to discover ids.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fontFamily\* | string |  |

## set_text_path

Lay text glyphs along a path. `path` is a CurvedTextPath spec (see src/text/CurvedTextLayout). Native encoder export support is in-progress.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| path\* | object |  |

## set_text_shade

Apply a stylized SVG shade silhouette behind a text layer (brush stroke, cloud, banner, starburst…). Pass shapeId=null to clear. opacity is the shade fill alpha (0..1, default 1).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| shapeId | string \| null |  |
| opacity | number |  |

## set_text_style

Apply a one-tap text style preset to an existing text layer (Style ▸ Text Styles — e.g. "title-hero", "title-news", "title-breaking"). The preset's props (color, weight, case, tracking, background …) drive the look. Pass styleId=null (or "") to clear it back to None. Discover ids with list_text_styles.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| styleId\* | string \| null |  |

## set_text_style_runs

Replace a text layer's per-range style runs with the provided array. Each run covers [start, end) into `content`. Runs must be sorted and non-overlapping. Pass [] to clear all runs.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| runs\* | array |  |

## set_text_wrap_box

Set the wrap-box width / horizontal offset of a text layer as a fraction of canvas width (0..1). Lets you tighten the wrap box without changing the font size.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| width | number |  |
| offsetX | number |  |

## set_text_writing_direction

Force a text layer's bidi direction. auto = detect from Unicode strong chars, ltr/rtl = force. Use this for Arabic/Urdu/Hebrew content that auto-detect mis-classifies.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| direction\* | string | one of: `auto`, `ltr`, `rtl` |

## set_time_remap

Map playhead time → source-media time for a video/audio layer. Enables speed changes, freeze frames, reverse. Keyframes must be sorted by playheadMs ascending.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| keyframes\* | array |  |
| extrapolation | string | one of: `clamp`, `hold` |

## set_track_matte

Composite this layer through another layer's alpha (or luma) as a track matte. mode: alpha | alpha-inverted | luma | luma-inverted. By AE convention the matte source is hidden — pass keepSourceVisible=true to override.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| sourceLayerId\* | string |  |
| mode\* | string | one of: `alpha`, `alpha-inverted`, `luma`, `luma-inverted` |
| keepSourceVisible | boolean |  |

## set_track_mute

Mute or unmute an audio/video track.

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| muted\* | boolean |  |

## set_track_visibility

Show or hide an entire track (hidden tracks are skipped in canvas + export).

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| visible\* | boolean |  |

## set_track_volume

Set the track-level volume multiplier (0..2.5).

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| volume\* | number |  |

## trim_layer

Trim a video/audio (or any) layer. mediaOffsetSec moves the in-point into the source media; durationSec sets how long the clip plays for on the timeline; startTimeSec moves where on the timeline the clip starts. Pass any subset — omitted fields stay put.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mediaOffsetSec | number |  |
| durationSec | number |  |
| startTimeSec | number |  |

## undo_to_checkpoint

Jump directly to a specific checkpoint by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## unlink_video_audio

Detach a video layer's embedded audio into a separate audio Layer + Track. The video is forced muted afterward. Returns the new audio layer id. Use relink_video_audio to undo.

| param | type | notes |
| --- | --- | --- |
| videoLayerId\* | string |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer. rotationX / rotationY tilt the layer out of plane in degrees (0 = flat, clamped to ±75) — that is the card-in-3D-space move; plain `rotation` remains the in-plane spin. Supported on every visual layer type that can rotate at all — image, video, base video, text, shape, shape-widget, collage and Lottie — on canvas and at export. Android adds transcript and lower-third; on iOS those two carry no layer rotation in the encoder at all, so they stay flat there.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |

## update_text

Edit the core properties of an EXISTING text layer (the Edit Text ▸ Text tab): text content, fontSize (pt), lineHeight (multiplier), fontWeight ("400"/"700"/"bold"), fontItalic, textTransform (none/uppercase/lowercase/capitalize = the Abc/ABC/abc case toggles), textAlign (left/center/right/justify), letterSpacing (pt), textColor (#RRGGBB), opacity (0..1). Only the fields you pass change. For the one-tap look presets use set_text_style; for the font use set_text_font.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| text | string |  |
| fontSize | number |  |
| lineHeight | number |  |
| fontWeight | string | e.g. "400", "700", "bold" |
| fontItalic | boolean |  |
| textTransform | string | one of: `none`, `uppercase`, `lowercase`, `capitalize` |
| textAlign | string | one of: `left`, `center`, `right`, `justify` |
| letterSpacing | number |  |
| textColor | string | #RRGGBB |
| opacity | number | 0..1 |

## update_widget_config

Merge a partial config patch into a widget layer's *Config field. Routes by layer.type: clock → clockConfig, scoreboard → scoreboardConfig, poll → pollConfig, statbar → statBarConfig, quote → quoteConfig, banner → bannerConfig, newsalert → newsAlertConfig, follower → followerConfig, likeburst → likeBurstConfig, comment → commentConfig, qrcode → qrCodeConfig, weather → weatherConfig, caption → captionConfig, confetti → confettiConfig, firemeter → fireMeterConfig, ticker → tickerConfig, lowerthird → lowerThirdConfig, collage → collageConfig, shape → shapeConfig. Use get_widget_config to inspect the current shape before patching.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| config\* | object |  |

## verify_export_parity

Pixel-level canvas-vs-export verification. Captures canvas frames at specified timestamps, exports the project, extracts matching frames from the exported video, and returns side-by-side image pairs plus comparison metrics for each timestamp. The AI can then visually inspect any differences. Use existingExportPath to skip re-exporting when iterating on comparisons. Returns image content blocks for visual inspection.

| param | type | notes |
| --- | --- | --- |
| timesSec | array | Timestamps in seconds to compare. Default [1, 3, 5]. |
| maxWidth | number | Max frame width. Default 512. |
| existingExportPath | string | Skip export, use this video path instead. |
