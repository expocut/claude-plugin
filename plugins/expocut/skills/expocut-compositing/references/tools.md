# Tool signatures used by expocut-compositing

<!-- generated from the app's live MCP registry by ExpoCut's skill-parity test; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_light_leak_overlay

Add a CDN Light Leak as a real-footage overlay on a new "light" track above the current content. Looks the preset up by id (use list_light_leaks to discover ids). The clip is cached locally, then tiled back-to-back to fill `duration`. intensity (0..1) overrides the preset's default opacity. Distinct from apply_fx_template's leak transition.

| param | type | notes |
| --- | --- | --- |
| presetId\* | string |  |
| category | string | one of: `warm-sunset`, `cool-window`, `cool-bokeh`, `prism-rainbow`, `prism-edge`, `vintage-filmburn`, `neon`, `soft-anamorphic`, `sun-flare` |
| startTime | number | seconds |
| duration | number | seconds |
| intensity | number |  |

## add_shape_layer

Add a shape layer. `shape` is any built-in preset id — basic (rectangle, circle, triangle, hexagon…), arrows (arrow, chevron…), stars (star, burst, sun…), objects (heart, shield, speech_bubble, badge, ribbon, callout…), lines, rulers. Call list_shapes to discover ids. For gradient backgrounds: pass gradientColors=[startHex, endHex] and stretchToCanvas=true.

| param | type | notes |
| --- | --- | --- |
| shape | string | one of: `circle`, `ellipse`, `square`, `rectangle`, `rounded_rect`, `triangle`, `diamond`, `pentagon`, `hexagon`, `octagon`, `parallelogram`, `trapezoid`, `cross`, `right_triangle`, `heptagon`, `nonagon`, `decagon`, `semicircle`, `quarter_circle`, `donut`, `l_shape`, `t_shape`, `rhombus`, `kite`, `capsule`, `arrow`, `arrow_left`, `arrow_up`, `arrow_down`, `arrow_double`, `chevron`, `chevron_left`, `arrow_up_down`, `arrow_block`, `arrow_bent`, `chevron_double`, `chevron_up`, `chevron_down`, `arrow_notched`, `arrow_curved`, `star`, `star4`, `star6`, `star8`, `star3`, `star10`, `star12`, `sun`, `flower4`, `flower6`, `burst`, `heart`, `crescent`, `cloud`, `shield`, `speech_bubble`, `lightning`, `teardrop`, `leaf`, `moon`, `crown`, `infinity`, `badge`, `clover4`, `spade`, `club`, `hexagram`, `octagram`, `speech_bubble_round`, `thought_bubble`, `callout`, `gear`, `frame`, `ribbon`, `egg`, `flag`, `cross_rounded`, `puzzle`, `arrow_circle`, `line`, `line_diagonal`, `bracket_left`, `bracket_right`, `brace_left`, `brace_right`, `line_wavy`, `line_zigzag`, `line_double`, `angle`, `ruler_horizontal`, `ruler_vertical` |
| fillColor | string |  |
| gradientColors | array | Two or more hex stops. Sets the fill to a gradient. |
| gradientDirection | string | one of: `horizontal`, `vertical`, `diagonal`, `radial` |
| opacity | number |  |
| stretchToCanvas | boolean |  |
| canvasRelativeWidth | number | % of canvas width (0–100). Set BOTH canvasRelative* for fixed-fraction sizing. |
| canvasRelativeHeight | number | % of canvas height (0–100) |
| strokeColor | string | #RRGGBB outline color |
| strokeWidth | number |  |
| cornerRadius | number |  |
| rotation | number | degrees |
| fadeInMs | number |  |
| fadeOutMs | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| startTime | number |  |
| duration | number |  |

## add_text_layer

Add a text layer. Defaults to fullWidth=true + textAlign="center" so the text auto-fits the canvas regardless of aspect ratio (9:16, 16:9, 1:1) — perfect for title cards. Use verticalAnchor="top|center|bottom" instead of computing y. startTime/duration are seconds. Use transitionIn/Out (e.g. "fade", "scale") for entrance/exit animations.

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

## capture_export_frame

P3.1: render ONE export-accurate frame of the OPEN project at timeSec (default playhead) through the editor's real export builder in single-frame mode — ALL overlay layers composite exactly as a full export (text/shapes/images/shaders/lower-thirds/transcript). Returns an inline PNG. Needs the editor mounted (call open_project first). This is the true preview≡export still.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| format | string | one of: `png`, `jpg` |

## clear_layer_fade_mask

Remove the spatial fade mask ("fade on edge") from a layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## clear_time_remap

Remove the time-remap track from a layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## clear_track_matte

Remove a track-matte configuration from a layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

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

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## mask_register_shape

Register a custom mask shape. Geometry kinds: rect | ellipse (rx, ry in (0,1]) | polygon (3..256 points, normalized) | path (limited SVG d — M L Q C Z only, ≤2048 chars). Runs a 64×64 bake probe to verify non-empty / non-trivial coverage before admitting.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| geometry\* | object |  |
| feather | number |  |
| invert | boolean |  |
| persist | boolean |  |

## mute_video_audio

Mute or unmute the embedded audio on a video layer (does not detach the audio into its own track).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| muted\* | boolean |  |

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

## set_aspect_lock

Lock or unlock proportional scaling on a layer's edge-handle gestures. When locked, scaleX/scaleY move together.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| locked\* | boolean |  |

## set_blur_fill

Override the auto-blur-background fill for a `fitMode: contain` layer. true = always on, false = always off, null = auto (the default for 9:16/4:5/1:1 canvases).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled\* | boolean \| null |  |

## set_layer_alpha_mode

Set the source-alpha interpretation: straight (RGB independent) or premultiplied (RGB already multiplied by alpha). Mismatch causes dark fringes around edges — set based on source metadata.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mode\* | string | one of: `straight`, `premultiplied` |

## set_layer_alpha_packing

Enable/disable stacked-alpha packing for a layer: a single source where the bottom half carries RGB and the top half carries a luma matte, composited into transparency at render time. packing='stacked' enables it; packing='none' clears it. Distinct from set_layer_alpha_mode (straight/premultiplied).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| packing\* | string | one of: `stacked`, `none` |

## set_layer_anchor

Set the layer's anchor pivot for scale + rotation. 0..1 in normalized layer-local coords (top-left origin). Default (when unset) is 0.5, 0.5 = center.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| anchorX | number |  |
| anchorY | number |  |

## set_layer_audio_offset

Nudge an audio layer's playback relative to its timeline startTime. Positive offset = audio plays LATER (delayed); negative = EARLIER. Typical lip-sync range is ±200ms; larger values for creative misalignment. Combined with startTime and mediaOffset by the exporter; the encoder schema does not have a separate audioOffset field.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| offsetMs\* | number |  |

## set_layer_background_remover

ML-based per-frame background removal for video layers (talking heads, vlogs). iOS uses VNGeneratePersonSegmentationRequest; Android uses MLKit Selfie Segmentation. quality trades export time for matte accuracy. featherPx softens the edge to hide frame-to-frame flicker. Pass enabled=false to disable.

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

## set_layer_crop

Crop an image or video layer to a sub-rectangle of the source. All four values are normalised 0..1 — {x:0, y:0, width:1, height:1} is the identity (no crop). Origin is top-left. Native encoders clamp invalid rects to the identity.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| x\* | number |  |
| y\* | number |  |
| width\* | number |  |
| height\* | number |  |

## set_layer_fade

Set per-layer fade-in and/or fade-out (milliseconds). Works on every layer type. For video/audio it ducks the alpha + volume envelope; for text/shape it cross-fades the rendered alpha. Pass 0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## set_layer_fade_mask

Apply a spatial gradient alpha fade ("fade on edge") to an image/video/shape layer. mode: linear (directional gradient via angle 0=left,90=top,180=right,270=bottom), radial (vignette outward from center), or inset (feather inward from all four edges). position/softness/floor are 0..1; invert flips opaque/transparent; curve eases the ramp. Fields you omit keep their current value (or the default on first apply). Distinct from the time-based fadeInMs/fadeOutMs ramps. Use clear_layer_fade_mask to remove.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| mode | string | one of: `linear`, `radial`, `inset` |
| angle | number |  |
| position | number |  |
| softness | number |  |
| floor | number |  |
| invert | boolean |  |
| curve | string | one of: `linear`, `easeIn`, `easeOut`, `easeInOut` |

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

## set_stretch_pan

Pan a stretchToCanvas layer within the canvas (percentage of canvas, can be negative). Ignored when the layer is not in fill / stretch mode.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| x | number |  |
| y | number |  |

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

## set_working_color_space

Set the project's working color space. One of: sRGB, Rec.709, Rec.2020, linear. Non-sRGB values are accepted by the data model but currently downgrade at encode time.

| param | type | notes |
| --- | --- | --- |
| space\* | string | one of: `sRGB`, `Rec.709`, `Rec.2020`, `linear` |

## trim_layer

Trim a video/audio (or any) layer. mediaOffsetSec moves the in-point into the source media; durationSec sets how long the clip plays for on the timeline; startTimeSec moves where on the timeline the clip starts. Pass any subset — omitted fields stay put.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mediaOffsetSec | number |  |
| durationSec | number |  |
| startTimeSec | number |  |

## unlink_video_audio

Detach a video layer's embedded audio into a separate audio Layer + Track. The video is forced muted afterward. Returns the new audio layer id. Use relink_video_audio to undo.

| param | type | notes |
| --- | --- | --- |
| videoLayerId\* | string |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
