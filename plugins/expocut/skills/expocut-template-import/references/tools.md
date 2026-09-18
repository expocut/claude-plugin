# Tool signatures used by expocut-template-import

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

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

## audit_font_coverage

Audit a list of font names. Returns {totalRequested, exact[], aliased[], fuzzy[], histogram}. Useful for importer compatibility reports.

| param | type | notes |
| --- | --- | --- |
| fontNames\* | array |  |

## bake_cdl_to_cube

Bake an ASC-CDL into an Adobe `.cube` 3D LUT text payload (DaVinci/Premiere/FCP compatible). Sizes 17/33/65; default 33. Returns `{ cube, size }` — the text is ready to be written to a `.cube` file.

| param | type | notes |
| --- | --- | --- |
| cdl\* | object |  |
| size | number | one of: `17`, `33`, `65` |
| title | string |  |
| allowNegative | boolean |  |
| clipOutput | boolean |  |

## build_loudness_plan

Compute a per-clip gain-ramp plan that normalizes each clip to a target loudness, clamped by the true-peak ceiling. Returns the structured plan + the JSON sidecar payload the native bridge consumes at export time.

| param | type | notes |
| --- | --- | --- |
| rows\* | array |  |
| target\* | string |  |
| mode | string | one of: `absolute`, `relative` |
| maxBoostDb | number |  |
| truePeakCeilingDbtp | number |  |

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

## default_device_class

Return the conservative default device class for a platform.

| param | type | notes |
| --- | --- | --- |
| platform\* | string | one of: `ios`, `android` |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden, scheduled outside this frame, or non-visual (audio never paints and is never listed). This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## detect_format

Detect the format of an importable file (lottie / fcpxml / otio / mogrt / cube / cdl / ectpl / unknown) from filename + optional text head.

| param | type | notes |
| --- | --- | --- |
| filename\* | string |  |
| textHead | string | First ~4KB of the file content (UTF-8 text). |
| isZipContainer | boolean |  |

## export_project

Render and encode the active project to a video file. Reuses the in-editor export pipeline via a module-scope bridge — the editor must be mounted on this project (open_project auto-navigates so this normally just works). Encoder settings come from set_export_settings + the editor's defaults. Returns the local file:// path of the rendered video on success. Long timelines can take minutes; client should be patient (10-minute internal timeout).

No parameters.

## export_template_to_fcpxml

Export an ExpoCut Template to Final Cut Pro XML (FCPXML 1.10). Supports text / image / video / shape layers; audio + unsupported types drop with structured warnings. Returns `{ xml, warnings }` ready to be written to disk.

| param | type | notes |
| --- | --- | --- |
| template\* | object |  |
| fps | number |  |
| width | number |  |
| height | number |  |
| wrapInLibrary | boolean |  |

## export_template_to_lottie

Export an ExpoCut Template to a Lottie Bodymovin v5 JSON object. Supports text / image / shape layers; video / unknown layer types are dropped with structured warnings. Returns `{ lottie, warnings }`.

| param | type | notes |
| --- | --- | --- |
| template\* | object |  |
| fr | number |  |
| width | number |  |
| height | number |  |

## gain_to_loudness_target

Compute the dB gain to apply to a signal at `currentLufs` to land at the named target (tiktok / spotify / youtube / appleMusic / broadcastEbu / broadcastUs, or a numeric LUFS string). Capped at `maxBoostDb` (default 12).

| param | type | notes |
| --- | --- | --- |
| currentLufs\* | number |  |
| target\* | string |  |
| maxBoostDb | number |  |

## import_foreign_file

Import a Lottie .json / FCPXML .fcpxml / Adobe .mogrt file and return the synthesized Template + structured warnings. Provide either `text` (for JSON/XML) or `bytesBase64` (for .mogrt).

| param | type | notes |
| --- | --- | --- |
| filename\* | string | File name with extension; drives format detection. |
| bytesBase64 | string | Base64-encoded raw bytes (use for .mogrt). |
| text | string | UTF-8 text content (use for Lottie / FCPXML). |

## import_from_file_system

Read a Lottie/FCPXML/.mogrt file from the device filesystem (absolute file:// URI or path under the document dir) and run it through the foreign-file importer. Sibling of `import_foreign_file` that avoids needing the caller to base64-encode the payload.

| param | type | notes |
| --- | --- | --- |
| path\* | string | Absolute file:// URI or path relative to the document directory. |
| filename | string | Override filename for format detection (defaults to basename of path). |

## import_template_json

Create a new project from a raw Template JSON document (the same shape produced by save_project_as_template, the "Templates → + Import" UI path, or a hand-authored My-Templates file). Treats the input as UNTRUSTED — runs validateTemplate with BOTH strictOneLayerPerTrack (rejects two layers on one trackIndex) AND enforceSecurity (URL-scheme whitelist on every remoteSource: https / asset / bundled / data only — http, file, blob are rejected; size caps on layers/slots/tracks/strings/duration). After validation, runs the same inflate→brand→theme→persist→load→navigate pipeline as apply_template. Use this when you want to drop a JSON authored offline straight into the editor without going through the file-picker. Returns the new projectId, layer count, any unfilled required slots, and validation warnings (non-blocking).

| param | type | notes |
| --- | --- | --- |
| template\* | object | Full Template document. Must declare schemaVersion "1.0", id, name, category, aspectRatio, durationMs, and non-empty slots/tracks/layers arrays. |
| name | string | Project display name. Defaults to template.name. |
| bindings | object | Optional { slotId: SlotValue } map to pre-fill slots at import time. |
| themeId | string | Optional palette id from the template — applied immediately. |

## list_font_aliases

List the curated font-name aliases the fallback resolver knows about. Each entry maps a normalized foreign-font name (lowercased + punctuation-stripped) to the bundled font id it resolves to.

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

## list_loudness_targets

List the named loudness targets the resolver knows about.

No parameters.

## lut_register_custom

Register a custom 3D LUT. Two variants: pass cubeText for a raw Adobe .cube file, or pass grade for a declarative {whiteBalance, toneCurve, lift} descriptor that gets baked to a Lut3d on demand. The new id is callable from set_layer_lut.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| cubeText | string | Raw Adobe .cube text. Max 1 MB. |
| grade | object |  |
| persist | boolean |  |

## measure_loudness

EBU R128 loudness measurement on a mono PCM buffer. Returns integrated LUFS, max short-term LUFS, true-peak dBTP, and gated-block count.

| param | type | notes |
| --- | --- | --- |
| samplesBase64\* | string | Base64-encoded Float32Array of mono samples in [-1, 1]. |
| sampleRate\* | number |  |

## migrate_template

Run the D9 data-model migrator over a list of legacy-shaped layers. Back-fills D1–D5 defaults (parentId / position / scale / rotation / trackIndex / startTime / duration / blendMode / opacity) and drops dangling trackMatte refs. Returns migrated layers + a per-layer fill report.

| param | type | notes |
| --- | --- | --- |
| layers\* | array |  |

## open_project

Load a project into the active editor session by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## parse_cube_lut

Parse an Adobe `.cube` LUT text file. Returns the parsed metadata (size, domain, title) and the data length. The data buffer itself is not serialized — call `apply_global_color_grade` or future LUT tools to use the LUT in the editor.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |

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

## query_codec_support

Check whether a given video or audio codec is supported on the target platform + device class. Returns {supported, reason?}.

| param | type | notes |
| --- | --- | --- |
| kind\* | string | one of: `video`, `audio` |
| codec\* | string |  |
| platform\* | string | one of: `ios`, `android` |
| deviceClass | string |  |

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

## resolve_codec_fallback

Resolve the degrade-and-warn output profile for the given requested codec / container / alpha / bit-depth on the target platform. Returns the effective profile + structured warnings.

| param | type | notes |
| --- | --- | --- |
| videoCodec\* | string |  |
| audioCodec\* | string |  |
| container\* | string | one of: `mp4`, `mov`, `webm`, `mxf`, `mkv` |
| alpha\* | boolean |  |
| bitDepth\* | number | one of: `8`, `10` |
| platform\* | string | one of: `ios`, `android` |
| deviceClass | string |  |

## resolve_font_fallback

Resolve a foreign font name (e.g. "Bebas Neue", "Proxima Nova", "Roboto") to the closest bundled font. Returns {font, confidence, reason, exactMatch, requestedWeight?}. Used by the importer to map imported templates onto the bundled-font set.

| param | type | notes |
| --- | --- | --- |
| name\* | string | The font name from the foreign template. |
| weight | any | Optional weight: named (ultralight..black) or numeric (100..900). Numeric values are quantized to the nearest named weight. |
| italic | boolean |  |
| category | string | one of: `sans-serif`, `serif`, `display`, `handwriting`, `monospace`, `rounded`, `condensed`, `arabic`, `urdu` — Optional pre-narrowed category from the source. |

## save_project

Persist the active editor session to projects.json. Call after any sequence of layer mutations to make them durable across app restarts.

No parameters.

## save_project_as_template

Serialise the currently-open project to a custom Template JSON. Two modes: "template" (default) — text/media layers become editable slots, other layers baked in (reusable recipe); "snapshot" — every layer property (media URIs, keyframes, effects, masks, light zones, camera params, shader/three params, filters, LUTs, transitions) is preserved verbatim (same edit, no slotification). Snapshot is what Community sharing packages as an .ectpl bundle. Returns the Template body and registers it under user-custom templates. AUTHORING RULES (verified on-device; see docs/MCP-template-authoring.md): (1) one layer = one object — unique trackIndex per layer, lower paints on top (violations rejected in template mode; snapshot mode preserves the source project as-is); (2) position{x,y} is the layer TOP-LEFT corner, not center — center a W×H box at (cx,cy) via x=cx-W/2,y=cy-H/2; (3) center text with textFullWidth+textAlign:"center"; (4) shape keyframes paint in preview (opacity/rotation everywhere; position on non-stretch shapes; transform.scale ONLY on base-box shapes — canvas-relative/stretch sizes are final); fadeInMs/fadeOutMs stays simplest for plain fades; (5) full-canvas via stretchToCanvas+fitMode:"fill"; (6) video cards = shape fillStyle:"video" + media slotRef; (7) captions = transcript layer needing transcriptSegments + textAnimationWords + textAnimationStyleId, with contiguous segment timing and no overlap of no-caption beats. Verify with capture_canvas (xray+grid).

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| description | string |  |
| category | string |  |
| mode | string | one of: `template`, `snapshot` — "template" (default) = slotified reusable recipe; "snapshot" = full-fidelity clone of the current project (preserves all layer properties verbatim). |

## set_export_settings

Update the active project export settings (aspectRatio, resolution, quality, format, fps). Only the fields you pass are changed; the rest are preserved.

| param | type | notes |
| --- | --- | --- |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| resolution | string | e.g. "1080x1920" |
| quality | string |  |
| format | string |  |
| fps | number |  |

## set_layer_cdl

Apply an ASC CDL grade (slope/offset/power + saturation) to a layer. Each of slope/offset/power is an RGB triplet. Partial inputs merge with existing values; identity = [1,1,1]/[0,0,0]/[1,1,1] sat=1.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| slope | array |  |
| offset | array |  |
| power | array |  |
| saturation | number |  |

## set_layer_lut

Apply a 3D LUT (color lookup table) to an image or video layer. `id` is the LUT id from the app's registered LUTs. intensity blends 0..1 (1 = full LUT, 0 = no change). Pass id=null or "" to remove the LUT.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| id | string \| null |  |
| intensity | number |  |

## set_text_font

Set the font of an existing text layer (Fonts tab). fontFamily is a font id from list_fonts (e.g. "helvetica-neue", "futura", "georgia"). Bundled ids are validated; a font not in the bundled set is still accepted (Google Fonts load at runtime) and flagged in the response. Clears nothing — use list_fonts to discover ids.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fontFamily\* | string |  |

## submit_template

Snapshot the currently-open project, bundle its local file:// assets into an .ectpl zip, and submit it to the ExpoCut Community. Uses snapshot mode so every layer property is preserved verbatim. The app UI requires Elite; submissions are validated and published immediately. Private media is stripped by default; set stripPrivateMedia=false only when the author explicitly intends to share source media. Returns the shared template, optional preview links, retention/expiry, and an owner record so only this device can delete the submission.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| description | string |  |
| category | string |  |
| metadata | object | Optional author + submission metadata forwarded to the backend as a JSON form field. |
| retention | string | one of: `once`, `1d`, `7d`, `21d`, `30d` — How long the Community keeps the submission. "once" deletes on first download; otherwise it auto-deletes after the interval. The service caps retention at 60 days. |
| thumbnailUri | string | Optional local file:// URI to a thumbnail image (jpg/png/webp, ≤512 KB) for the Community preview. |
| previewVideoUri | string | Optional local file:// URI for a rendered demo MP4 to show with the Community template. |
| stripPrivateMedia | boolean | Defaults true: remove video/image/audio source URIs before sharing while preserving masks, effects, keyframes and layout. Set false only for media explicitly intended to be public. |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer. rotationX / rotationY tilt the layer out of plane in degrees (0 = flat, clamped to ±75) — that is the card-in-3D-space move; plain `rotation` remains the in-plane spin. Supported on every visual layer type that can rotate at all — image, video, base video, text, shape, shape-widget, collage and Lottie — on canvas and at export. Android adds transcript and lower-third; on iOS those two carry no layer rotation in the encoder at all, so they stay flat there.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |

## write_cdl

Serialise one or more ASC-CDL grades into an XML document (`.cdl` for one, `.ccc` for many, or `cdl-list` for ColorDecisionList). Round-trips through `parseCdlXml`. Returns `{ xml, kind }`.

| param | type | notes |
| --- | --- | --- |
| entries\* | array |  |
| kind | string | one of: `cdl`, `ccc`, `cdl-list` |
