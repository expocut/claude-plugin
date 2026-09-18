# Tool signatures used by expocut-kinetic-captions

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_caption_layer_from_audio

Transcribe an audio file and create a transcript layer with the segments populated. Same model requirements as transcribe_audio. Position via x/y (top-left percent). The layer's duration is derived from the last segment's end time.

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| language | string |  |
| modelSize | string | one of: `tiny`, `base` |
| startTime | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |

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

## clear_text_media_fill

Remove the video/image media fill from a text layer, restoring solid/gradient fill.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## clear_text_path

Remove the curved path layout from a text layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## clear_text_style_runs

Remove all per-range style runs from a text layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

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

## list_fonts

List the bundled text fonts (the Fonts tab): id, label, category, source (system / google / rtl) and isRTL. Filter by category (sans-serif, serif, display, handwriting, monospace, rounded, condensed, arabic, urdu, …) or source. Pass an id to set_text_font or add_text_layer({fontFamily}). Google Fonts beyond this set load at runtime.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `sans-serif`, `serif`, `display`, `handwriting`, `monospace`, `rounded`, `condensed`, `arabic`, `urdu` |
| source | string | one of: `system`, `google`, `rtl` |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_lower_thirds

List all lower-third presets (broadcast-style title cards). Use a returned id with add_lower_third_layer.

No parameters.

## list_text_animations

List all text-specific animation ids (entrance, exit, loop) usable in set_text_animation. Includes the 57-preset typewriter family — each entry exposes its tunable params (passed to set_text_animation via inParams / outParams / loopParams).

No parameters.

## list_text_effects

List stacked text effect presets (Style ▸ Effects — glow / outline / 3D / shadow / retro / metallic / comic / tech …): id, label, category. Independent of text styles; apply with set_text_effect({layerId, effectId}).

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `glow`, `outline`, `3d`, `shadow`, `distort`, `retro`, `nature`, `metallic`, `comic`, `tech` |

## list_text_styles

List one-tap text style presets (Style ▸ Text Styles — e.g. Hero Title, News Title, Breaking News, Cinematic): id, label, category, and the props each applies. Apply with set_text_style({layerId, styleId}). Categories: basic, title, subtitle, outline, shadow, gradient, neon, retro, elegant, fun, social.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `basic`, `title`, `subtitle`, `outline`, `shadow`, `gradient`, `neon`, `retro`, `elegant`, `fun`, `social` |

## list_transitions

List all entrance/exit transitions (fadeIn, slideUp, lightCinematic, …). Use the returned id at creation time with add_text_layer / add_shape_layer transitionIn or transitionOut, or on an existing layer with set_layer_transition. Shader-category ids are cover-and-reveal GPU transitions. Durations are in seconds.

No parameters.

## open_project

Load a project into the active editor session by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

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

## set_layer_effect

Apply (or clear) a visual effect on an existing layer. Use list_effects to discover valid effectIds and which params each accepts. Pass effectId=null or "" to remove the effect.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId | string \| null |  |
| params | object |  |

## set_layer_transition

Set or change the entrance (in) / exit (out) transition on an EXISTING layer. Each role takes a transition id from list_transitions plus optional durationSec/easing/intensity/blur. Classic and Shader-category ids are mutually exclusive per role — picking one clears the other automatically. For Shader-category ids (liquidwipe, slicewipe, …) you can also "Customize" the look via preset (a named preset like "Pink Boards" / "Cyan Shards") and shaderParams (fxParams such as fillColors / angle / transparentBg / revealOnly / useTexture — see get_effect_schema). Pass {id:null} (or "none") to clear a role. Provide at least one of in/out.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object |  |
| out | object |  |

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

## set_text_animation_range

Constrain which glyphs the layer's perCharacter text animation touches. start/end are 0..1 fractions of the glyph count. randomize=0..1 shuffles order with `seed`. invert flips the selection.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| start | number |  |
| end | number |  |
| randomize | number |  |
| seed | number |  |
| invert | boolean |  |

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

## set_text_font_features

Set OpenType feature toggles for a text layer (liga, smcp, tnum, ss01…). Pass {} to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| features\* | object |  |

## set_text_font_variations

Set variable-font axis values (wght, wdth, slnt, …) for a text layer. Pass {} to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| axes\* | object |  |

## set_text_media_fill

Fill a text layer's glyphs with a video or image ("Video in Text"). uri is a local file:// path; type is 'video' or 'image'. offsetSec (video only) picks the source in-point. Use clear_text_media_fill to remove.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| uri\* | string | local file:// URI of the fill media |
| type\* | string | one of: `video`, `image` |
| offsetSec | number | seconds into the source (video fills only) |

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

## set_typewriter

Enable a character-by-character typewriter reveal on a text layer. charDelayMs sets how fast each character appears (30-80 ms = human-feeling; lower = robotic-fast). Pass charDelayMs=0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| charDelayMs | number |  |
| startDelayMs | number |  |

## transcribe_audio

Transcribe an audio file using on-device Whisper. Returns time-stamped text segments. Requires the Whisper model to be downloaded already (open the app's transcribe panel to download). Default model: "tiny" — faster but less accurate; pass "base" for better accuracy at the cost of speed.

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| language | string | e.g. "en", "ur". Omit for auto-detect. |
| modelSize | string | one of: `tiny`, `base` |

## tts_add_audio_layer

Generate speech with the on-device TTS engine (Kokoro; falls back to AVSpeech if Kokoro not downloaded) and add the resulting WAV as an audio layer. Use tts_list_voices to find voiceId. Layer duration defaults to the generated audio length.

Script markers — embed in `text` for dramatic pacing:
  ...p   paragraph pause (≈850 ms silence)
  ...s   sentence pause  (≈420 ms silence)
  ...c   comma beat      (≈160 ms silence)
  blank line (\n\n) → paragraph break (≈500 ms)
  [VOICE: am_michael] — switch voice mid-script. Repeat as needed.

Example: "[VOICE: af_bella] Welcome to the show ...p [VOICE: am_michael] Today we explore... ...s a hidden world."
Call tts_validate_script first to preview the segment count and per-voice breakdown before committing to a long synthesis.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |
| voiceId | string |  |
| speed | number | 0.5..2.0; 1.0 default |
| pitch | number | semitones; 0 default |
| sampleRate | number | one of: `16000`, `22050`, `44100` |
| startTime | number |  |
| duration | number |  |
| volume | number | 0..1 layer volume |
| fadeInMs | number |  |
| fadeOutMs | number |  |

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
