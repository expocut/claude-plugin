# Tool signatures used by expocut-data-widgets

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_device_mockup

Add a clean-room device-frame overlay (phone / tablet / browser) with a TRANSPARENT screen — the "phone mockup" for showcase / "works on any screen" shots. Place a video or image layer BEHIND it (higher trackIndex) at the returned screen rect so it shows through. Generated as an SVG and rendered + exported via the SVG layer pipeline — no native work. Sized as a % of the canvas (aspect-correct from the open project).

| param | type | notes |
| --- | --- | --- |
| device | string | one of: `phone`, `tablet`, `browser` — phone \| tablet \| browser. Default phone. |
| color | string | Frame body colour #RRGGBB. Default #1A1A1F. |
| widthFrac | number | Painted frame width as % of canvas width (default 32). |
| x | number | Top-left x percent 0..100 (default centres horizontally). |
| y | number | Top-left y percent 0..100 (default centres vertically). |
| name | string |  |
| startTime | number | seconds |
| duration | number | seconds; default 5 |
| opacity | number | 0..1 |
| rotation | number | degrees |

## add_lottie_layer

Add a Lottie animation layer (motion graphics, stickers, icons). Pass either uri (a file:// path, an http(s) URL, or the Lottie JSON text itself) or presetId (bundled animation: pulse-circle, spinning-star, bouncing-heart, pulsing-star, fade-ring, spinning-ring, pulse-glow, rotating-rings, pulsing-circles, floating-stars, slide-line, pulse-dot, corner-star, expand-ring, flash-star, spin-rings, zoom-burst, sparkle-burst, floating-dots). The JSON is read and stored inline, which is what the renderer plays. PLACEMENT: x/y is the TOP-LEFT corner in canvas % (default 50/50); the animation paints in the 150 pt design square (get_canvas_info.layerBaseWidthPct of the canvas width). Use playbackSpeed to speed up / slow down (1.0 default) and loop=true to repeat for the full layer duration.

| param | type | notes |
| --- | --- | --- |
| uri | string |  |
| presetId | string |  |
| startTime | number |  |
| duration | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| playbackSpeed | number |  |
| loop | boolean |  |

## add_lower_third_layer

Add a lower-third title card layer (broadcast-style name + role overlay). Use list_lower_thirds for preset ids. Pass lines[] to override the default placeholder text. PLACEMENT: x/y is the TOP-LEFT corner in canvas % (default 50/75, i.e. the card starts at the horizontal centre, in the lower quarter); the card is CONTENT-SIZED (describe_canvas reports the default square as approx) and most presets animate in and out within the layer duration.

| param | type | notes |
| --- | --- | --- |
| presetId\* | string |  |
| lines | array |  |
| startTime | number |  |
| duration | number |  |
| x | number |  |
| y | number |  |

## add_shape_widget

Add a shape-widget layer: rows of shapes (1–8 per row) with an animation mode. Omit rows for the default 3-row layout. Each row: {shape, count, fillColor}. animation one of: none, scroll-up, scroll-down, scroll-left, scroll-right, continue, parallel, juggling, swapping, zoom-in, zoom-shapes. PLACEMENT: x/y is the TOP-LEFT of a SQUARE box (the 150 pt design square = get_canvas_info.layerBaseWidthPct of the canvas width); the rows are centred vertically inside it, so a single row paints in the middle of that square, not at y. startTime/duration in seconds.

| param | type | notes |
| --- | --- | --- |
| rows | array |  |
| gap | number | spacing fraction between cells/rows (0–0.4) |
| animation | string | one of: `none`, `scroll-up`, `scroll-down`, `scroll-left`, `scroll-right`, `continue`, `parallel`, `juggling`, `swapping`, `zoom-in`, `zoom-shapes` |
| animationSpeed | number | speed multiplier (0.25–4) |
| backgroundColor | string \| null |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| startTime | number |  |
| duration | number |  |

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

## add_video_layer

Add a video layer from any local file:// URI (camera roll exports, downloaded clips, TTS-generated screens, etc). For Pexels stock specifically use add_stock_video_layer. mediaOffsetSec sets the source in-point (e.g. mediaOffsetSec=8 to skip first 8s of source). The layer is fit-to-screen (full-canvas) by default; pass stretchToCanvas:false to letterbox (x/y = TOP-LEFT corner in canvas %, default 0/0; the unscaled box is the 150 pt design square aspect-fitted to the source, whose natural size is probed at add time and stored).

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

## add_widget_layer

Add a widget layer (clock, scoreboard, poll, qr-code, weather, caption, confetti, …). Use list_widgets to discover valid widgetId values. config is a partial — fields you omit are filled by the widget's default factory. PLACEMENT: x/y is the TOP-LEFT corner in canvas % (default 50/50). Widgets are CONTENT-SIZED: the painted box hugs the widget (a clock pill is wider and much shorter than the default square that describe_canvas reports as approx). startTime/duration in seconds.

| param | type | notes |
| --- | --- | --- |
| widgetId\* | string | one of: news-ticker, live-clock, countdown, stopwatch, scoreboard, poll, stat-bar, quote-card, breaking-banner, news-alert, follower-counter, like-burst, comment-bubble, qr-code, weather-card, caption-box, confetti, fire-meter. For broadcast-style title cards use add_lower_third_layer instead. |
| config | object |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| startTime | number |  |
| duration | number |  |

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

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden, scheduled outside this frame, or non-visual (audio never paints and is never listed). This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## get_canvas_info

Return the canvas/preview context in one cheap call (no image, editor need not be mounted): aspectRatio + numeric aspect, pixel width/height (from the stored resolution, else the 1080p preset — resolutionAssumed=true), the editor canvas size in points, layerBaseWidthPct / layerBaseHeightPct (how big an unsized layer lands, as % of the canvas), fps, format, quality, total duration (ms + sec), estimated frame count, layer/track counts, current playhead, isPlaying and the selected layer id. Use this to understand the frame size, the default layer size and the timeline length before placing layers or capturing.

No parameters.

## get_layer

Return the full Layer object (every field) for a given id. Use this to diff state, then `update_layer` to patch.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## get_widget_config

Read the current widget config for a layer. Returns { field, config } where field is the layer's *Config key.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_widgets

List all widget types the editor can render (clock, scoreboard, poll, qr-code, weather, …). Returns the widget id, display name, category, and the layer.type string used internally.

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

## undo_to_checkpoint

Jump directly to a specific checkpoint by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer. rotationX / rotationY tilt the layer out of plane in degrees (0 = flat, clamped to ±75) — that is the card-in-3D-space move; plain `rotation` remains the in-plane spin. Supported on every visual layer type that can rotate at all — image, video, base video, text, shape, shape-widget, collage and Lottie — on canvas and at export. Android adds transcript and lower-third; on iOS those two carry no layer rotation in the encoder at all, so they stay flat there.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |

## update_widget_config

Merge a partial config patch into a widget layer's *Config field. Routes by layer.type: clock → clockConfig, scoreboard → scoreboardConfig, poll → pollConfig, statbar → statBarConfig, quote → quoteConfig, banner → bannerConfig, newsalert → newsAlertConfig, follower → followerConfig, likeburst → likeBurstConfig, comment → commentConfig, qrcode → qrCodeConfig, weather → weatherConfig, caption → captionConfig, confetti → confettiConfig, firemeter → fireMeterConfig, ticker → tickerConfig, lowerthird → lowerThirdConfig, collage → collageConfig, shape → shapeConfig. Use get_widget_config to inspect the current shape before patching.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| config\* | object |  |
