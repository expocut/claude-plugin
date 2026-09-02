# Tool signatures used by expocut-color-grading

<!-- generated from the app's live MCP registry by ExpoCut's skill-parity test; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_light_region

Add a per-layer Light / LUT Zone — a grade-only lighting region (the "Light" bottom-bar tool). SHAPE: area (rectangle), gradient (wide feathered ND-grad band), radial (soft depth spot, seeded inverted so the surroundings recede), object (freeform path), trident (seeds TWO gradient bands, Sky + Ground). Geometry: rect {x,y,width,height} in 0..1 layer space, feather (px @1080p), invert (grade outside the shape), rotation (deg, for a diagonal gradient), expansion. intensity (0..1) scales the whole effect. GRADE: tone {exposure, contrast, brightness, highlights, shadows, whites, blacks, vibrance, saturation} — a Lightroom-style light grade compiled to ASC-CDL through the existing masked-grade path. LOOK: filterId + filterIntensity (0..1) apply an app filter inside the scope. Regions stack (append order = render order); use list_light_regions / clear_light_regions to inspect or remove.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| shape | string | one of: `area`, `gradient`, `radial`, `object`, `trident` |
| rect | object |  |
| feather | number |  |
| invert | boolean |  |
| rotation | number | degrees |
| expansion | number | px @1080p, signed |
| intensity | number | 0..1 |
| label | string |  |
| tone | object |  |
| filterId | string |  |
| filterIntensity | number | 0..1 |

## apply_global_color_grade

Apply a uniform LUT + colorAdjust to every video/image layer that overlaps the given time range. Use this for "look" passes — a teal/orange grade across all clips of a reel, a B&W look on a flashback section, etc. Calling once is equivalent to running set_layer_lut + set_layer_color_adjust on each affected layer. Layers outside the range are untouched. Returns the count and ids of layers patched. hue/saturation/brightness/intensity use the SAME scale as set_layer_color_adjust: offsets where 0 is neutral (saturation/brightness -1..+1), NOT multipliers.

| param | type | notes |
| --- | --- | --- |
| startSec | number |  |
| endSec | number |  |
| lutId | string |  |
| lutIntensity | number | 0..1; default 1 |
| hue | number | 0..360 degrees of rotation; 0 = neutral |
| saturation | number | -1 (greyscale) .. +1 (double); 0 = neutral |
| brightness | number | -1 (black) .. +1 (white); 0 = neutral |
| intensity | number | 0..1 global blend of the adjustment |
| includeImages | boolean |  |
| includeVideos | boolean |  |

## bake_cdl_to_cube

Bake an ASC-CDL into an Adobe `.cube` 3D LUT text payload (DaVinci/Premiere/FCP compatible). Sizes 17/33/65; default 33. Returns `{ cube, size }` — the text is ready to be written to a `.cube` file.

| param | type | notes |
| --- | --- | --- |
| cdl\* | object |  |
| size | number | one of: `17`, `33`, `65` |
| title | string |  |
| allowNegative | boolean |  |
| clipOutput | boolean |  |

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

## clear_light_regions

Remove one Light / LUT Zone region (pass regionId) or the whole stack (omit regionId) from a layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| regionId | string | omit to clear all regions |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden or scheduled outside this frame. This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## get_active_project

Return the currently-open project id, layer count, and export settings.

No parameters.

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_light_regions

Inspect a layer's Light / LUT Zone stack — every region's id, shape, scope, label, enabled flag, intensity, and whether it carries a grade and/or a filter look.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## lut_list_custom

List registered custom LUTs (AI and user). Returns metadata only — pass the id to set_layer_lut to apply.

| param | type | notes |
| --- | --- | --- |
| author | string | one of: `ai`, `user`, `any` |

## lut_register_custom

Register a custom 3D LUT. Two variants: pass cubeText for a raw Adobe .cube file, or pass grade for a declarative {whiteBalance, toneCurve, lift} descriptor that gets baked to a Lut3d on demand. The new id is callable from set_layer_lut.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| cubeText | string | Raw Adobe .cube text. Max 1 MB. |
| grade | object |  |
| persist | boolean |  |

## parse_cube_lut

Parse an Adobe `.cube` LUT text file. Returns the parsed metadata (size, domain, title) and the data length. The data buffer itself is not serialized — call `apply_global_color_grade` or future LUT tools to use the LUT in the editor.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |

## save_history_checkpoint

Push a session-scoped checkpoint of the editor state onto the undo stack. Returns the checkpoint id. Use undo() to revert to the previous checkpoint or undo_to_checkpoint({id}) for direct jump.

| param | type | notes |
| --- | --- | --- |
| label | string |  |

## save_project

Persist the active editor session to projects.json. Call after any sequence of layer mutations to make them durable across app restarts.

No parameters.

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

## set_layer_filter

Apply a preset filter to an image or video layer (single look — e.g. "Vintage", "Lo-Fi"). For granular effect chains use set_layer_video_effects instead. intensity 0..1 blends the filter back to original. Pass filterId=null to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| filterId | string \| null |  |
| intensity | number |  |

## set_layer_lut

Apply a 3D LUT (color lookup table) to an image or video layer. `id` is the LUT id from the app's registered LUTs. intensity blends 0..1 (1 = full LUT, 0 = no change). Pass id=null or "" to remove the LUT.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| id | string \| null |  |
| intensity | number |  |

## set_working_color_space

Set the project's working color space. One of: sRGB, Rec.709, Rec.2020, linear. Non-sRGB values are accepted by the data model but currently downgrade at encode time.

| param | type | notes |
| --- | --- | --- |
| space\* | string | one of: `sRGB`, `Rec.709`, `Rec.2020`, `linear` |

## split_layer

Cut a layer into two halves at atSec (relative to the layer's startTime). The first half keeps the original id; the second half is a fresh layer with its mediaOffset advanced by atSec so it continues playing the source seamlessly. Both halves keep all styling, effects, color settings.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| atSec\* | number |  |

## verify_export_parity

Pixel-level canvas-vs-export verification. Captures canvas frames at specified timestamps, exports the project, extracts matching frames from the exported video, and returns side-by-side image pairs plus comparison metrics for each timestamp. The AI can then visually inspect any differences. Use existingExportPath to skip re-exporting when iterating on comparisons. Returns image content blocks for visual inspection.

| param | type | notes |
| --- | --- | --- |
| timesSec | array | Timestamps in seconds to compare. Default [1, 3, 5]. |
| maxWidth | number | Max frame width. Default 512. |
| existingExportPath | string | Skip export, use this video path instead. |

## write_cdl

Serialise one or more ASC-CDL grades into an XML document (`.cdl` for one, `.ccc` for many, or `cdl-list` for ColorDecisionList). Round-trips through `parseCdlXml`. Returns `{ xml, kind }`.

| param | type | notes |
| --- | --- | --- |
| entries\* | array |  |
| kind | string | one of: `cdl`, `ccc`, `cdl-list` |
