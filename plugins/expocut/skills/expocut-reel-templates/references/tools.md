# Tool signatures used by expocut-reel-templates

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

## delete_my_submission

Delete a template previously submitted from this device. Uses the local delete credential issued at upload time — only the original uploader can succeed. Returns {ok, reason?}. Marks the registry row `deleted:true` on success; a follow-up `list_my_submissions` will show the flag until the row is purged.

| param | type | notes |
| --- | --- | --- |
| binaryId\* | string | Submission id returned by list_my_submissions. |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden or scheduled outside this frame. This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## export_project

Render and encode the active project to a video file. Reuses the in-editor export pipeline — the editor must be mounted on this project (open_project auto-navigates so this normally just works). Encoder settings come from set_export_settings + the editor's defaults. Returns the local file:// path of the rendered video on success. Long timelines can take minutes; client should be patient (10-minute internal timeout).

No parameters.

## get_layer

Return the full Layer object (every field) for a given id. Use this to diff state, then `update_layer` to patch.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## import_template_json

Create a new project from a raw Template JSON document (the same shape produced by save_project_as_template, the "Templates → + Import" UI path, or a hand-authored My-Templates file). Treats the input as UNTRUSTED — runs validateTemplate with BOTH strictOneLayerPerTrack (rejects two layers on one trackIndex) AND enforceSecurity (URL-scheme whitelist on every remoteSource: https / asset / bundled / data only — http, file, blob are rejected; size caps on layers/slots/tracks/strings/duration). After validation, runs the same inflate→brand→theme→persist→load→navigate pipeline as apply_template. Use this when you want to drop a JSON authored offline straight into the editor without going through the file-picker. Returns the new projectId, layer count, any unfilled required slots, and validation warnings (non-blocking).

| param | type | notes |
| --- | --- | --- |
| template\* | object | Full Template document. Must declare schemaVersion "1.0", id, name, category, aspectRatio, durationMs, and non-empty slots/tracks/layers arrays. |
| name | string | Project display name. Defaults to template.name. |
| bindings | object | Optional { slotId: SlotValue } map to pre-fill slots at import time. |
| themeId | string | Optional palette id from the template — applied immediately. |

## keyframe_add

Add or replace a scalar keyframe on a layer. Accepts image, text, shape, and video layers for the common transform/opacity/fx/border/mask/color surface. Call list_keyframe_properties to see the full property catalog and which layer types each applies to. The easing curve (interp) is optional; default is linear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `transform.x`, `transform.y`, `transform.scale`, `transform.scaleX`, `transform.scaleY`, `transform.rotation`, `transform.anchorX`, `transform.anchorY`, `opacity`, `color.hueShift`, `color.saturation`, `color.brightness`, `color.contrast`, `color.intensity`, `fx.blur`, `fx.intensity`, `mask.rect.x`, `mask.rect.y`, `mask.rect.width`, `mask.rect.height`, `mask.feather`, `mask.expansion`, `mask.rotation`, `mask.bandWidth`, `mask.gradientSoftness`, `secondaryEffect.intensity`, `audio.volume`, `filter.id`, `filter.intensity`, `transition.inIntensity`, `transition.outIntensity`, `border.width`, `border.glowIntensity`, `border.cornerRadius`, `text.color.r`, `text.color.g`, `text.color.b`, `text.stroke.color.r`, `text.stroke.color.g`, `text.stroke.color.b`, `text.stroke.width`, `border.color.r`, `border.color.g`, `border.color.b`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `anchorX`, `anchorY` — Animatable scalar property. Full dot-path (transform.scale) or shorthand (scale) accepted. |
| timeMs\* | number | Time on the timeline in milliseconds. |
| value\* | number | Numeric value at this keyframe. |
| interp | object | Easing leaving this keyframe. Shape: { type: "hold" \| "linear" } \| { type: "bezier", x1, y1, x2, y2 } \| { type: "preset", name: "ease" \| "easeIn" \| "easeOut" \| "easeInOut" \| "bounce" \| "elastic" \| "spring" }. Default linear. |

## list_text_animations

List all text-specific animation ids (entrance, exit, loop) usable in set_text_animation. Includes the 57-preset typewriter family — each entry exposes its tunable params (passed to set_text_animation via inParams / outParams / loopParams).

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

## save_project_as_template

Serialise the currently-open project to a custom Template JSON. Two modes: "template" (default) — text/media layers become editable slots, other layers baked in (reusable recipe); "snapshot" — every layer property (media URIs, keyframes, effects, masks, light zones, camera params, shader/three params, filters, LUTs, transitions) is preserved verbatim (same edit, no slotification). Snapshot is what Community sharing packages as an .ectpl bundle. Returns the Template body and registers it under user-custom templates. AUTHORING RULES (verified on-device; see docs/MCP-template-authoring.md): (1) one layer = one object — unique trackIndex per layer, lower paints on top (violations rejected in template mode; snapshot mode preserves the source project as-is); (2) position{x,y} is the layer TOP-LEFT corner, not center — center a W×H box at (cx,cy) via x=cx-W/2,y=cy-H/2; (3) center text with textFullWidth+textAlign:"center"; (4) shape keyframes paint in preview (opacity/rotation everywhere; position on non-stretch shapes; transform.scale ONLY on base-box shapes — canvas-relative/stretch sizes are final); fadeInMs/fadeOutMs stays simplest for plain fades; (5) full-canvas via stretchToCanvas+fitMode:"fill"; (6) video cards = shape fillStyle:"video" + media slotRef; (7) captions = transcript layer needing transcriptSegments + textAnimationWords + textAnimationStyleId, with contiguous segment timing and no overlap of no-caption beats. Verify with capture_canvas (xray+grid).

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| description | string |  |
| category | string |  |
| mode | string | one of: `template`, `snapshot` — "template" (default) = slotified reusable recipe; "snapshot" = full-fidelity clone of the current project (preserves all layer properties verbatim). |

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

## set_template_theme

Re-theme the currently-open palette-based template project with a different palette (e.g. "sapphire", "emerald", "my-brand"). Remaps from the currently-active palette, so colours stay consistent. Requires a project created from a template that ships palettes.

| param | type | notes |
| --- | --- | --- |
| themeId\* | string |  |

## set_typewriter

Enable a character-by-character typewriter reveal on a text layer. charDelayMs sets how fast each character appears (30-80 ms = human-feeling; lower = robotic-fast). Pass charDelayMs=0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| charDelayMs | number |  |
| startDelayMs | number |  |

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

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |

## verify_export_parity

Pixel-level canvas-vs-export verification. Captures canvas frames at specified timestamps, exports the project, extracts matching frames from the exported video, and returns side-by-side image pairs plus comparison metrics for each timestamp. The AI can then visually inspect any differences. Use existingExportPath to skip re-exporting when iterating on comparisons. Returns image content blocks for visual inspection.

| param | type | notes |
| --- | --- | --- |
| timesSec | array | Timestamps in seconds to compare. Default [1, 3, 5]. |
| maxWidth | number | Max frame width. Default 512. |
| existingExportPath | string | Skip export, use this video path instead. |
