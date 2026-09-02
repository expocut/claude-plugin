# Tool signatures used by expocut-templates-brand

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

## apply_brand_profile_to_project

Substitute the brand profile's fields into the active project's layers. Text layers whose `name` is one of [Brand Name, Slogan, Website, Phone, Email, Address] get their content replaced. Image layers named "Logo" or "Brand Logo" get their content replaced with the profile logo URI.

| param | type | notes |
| --- | --- | --- |
| profileId\* | string |  |

## apply_reel

Create a new project from a bundled Reel + optional theme. Loads into the editor and auto-navigates.

| param | type | notes |
| --- | --- | --- |
| reelId\* | string |  |
| themeId | string |  |
| name | string |  |
| bindings | object |  |

## apply_template

Create a new project from a bundled template, load it into the editor, and auto-navigate. bindings is an optional { slotId: value } map — use list_templates first to discover slots. themeId optionally picks a colour palette the template ships (the project stays re-themeable later via set_template_theme). Returns the new project id and any unfilled required slot ids.

| param | type | notes |
| --- | --- | --- |
| templateId\* | string |  |
| name | string |  |
| bindings | object |  |
| themeId | string |  |

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

## create_brand_profile

Create a new brand profile. Returns the new id. First profile is auto-default. logo is a file:// URI; socials is an array of { platform, handle } objects.

| param | type | notes |
| --- | --- | --- |
| name\* | string |  |
| logo | string |  |
| slogan | string |  |
| address | string |  |
| phone | string |  |
| email | string |  |
| socials | array |  |
| isDefault | boolean |  |

## delete_brand_profile

Delete a brand profile. If the deleted profile was default, the first remaining profile becomes default.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

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

## get_active_project

Return the currently-open project id, layer count, and export settings.

No parameters.

## get_brand_profile

Read the full brand profile by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## import_template_json

Create a new project from a raw Template JSON document (the same shape produced by save_project_as_template, the "Templates → + Import" UI path, or a hand-authored My-Templates file). Treats the input as UNTRUSTED — runs validateTemplate with BOTH strictOneLayerPerTrack (rejects two layers on one trackIndex) AND enforceSecurity (URL-scheme whitelist on every remoteSource: https / asset / bundled / data only — http, file, blob are rejected; size caps on layers/slots/tracks/strings/duration). After validation, runs the same inflate→brand→theme→persist→load→navigate pipeline as apply_template. Use this when you want to drop a JSON authored offline straight into the editor without going through the file-picker. Returns the new projectId, layer count, any unfilled required slots, and validation warnings (non-blocking).

| param | type | notes |
| --- | --- | --- |
| template\* | object | Full Template document. Must declare schemaVersion "1.0", id, name, category, aspectRatio, durationMs, and non-empty slots/tracks/layers arrays. |
| name | string | Project display name. Defaults to template.name. |
| bindings | object | Optional { slotId: SlotValue } map to pre-fill slots at import time. |
| themeId | string | Optional palette id from the template — applied immediately. |

## list_brand_profiles

List every saved brand profile (id, name, isDefault, socialCount, updatedAt).

No parameters.

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_my_submissions

Return the local registry of Community template submissions owned by this device — every entry carries a binaryId, publicUrl, retention preset, expiry, and computed time-left. Use as the input to `delete_my_submission`. Snapshots the store synchronously; no network.

No parameters.

## list_reels

List bundled Reels (short-form templates with themed variants).

| param | type | notes |
| --- | --- | --- |
| aspectRatio | string |  |

## list_templates

List bundled templates with id, name, category, aspectRatio, durationMs, slotCount. Optionally filter by category or aspectRatio.

| param | type | notes |
| --- | --- | --- |
| category | string |  |
| aspectRatio | string |  |

## reorder_layer

Change a layer's z-order. "front" pulls it to trackIndex 0 (top); "back" pushes it past every other layer (bottom). Pass an explicit number for fine control. Other layers are shifted to keep the trackIndex sequence dense.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| position\* | any |  |

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

## set_template_theme

Re-theme the currently-open palette-based template project with a different palette (e.g. "sapphire", "emerald", "my-brand"). Remaps from the currently-active palette, so colours stay consistent. Requires a project created from a template that ships palettes.

| param | type | notes |
| --- | --- | --- |
| themeId\* | string |  |

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

## swap_reel_theme

Re-skin the currently-open Reel project with a different theme. Requires originTemplateId on the project (set by apply_reel).

| param | type | notes |
| --- | --- | --- |
| themeId\* | string |  |

## update_brand_profile

Merge a partial patch into a brand profile. Pass isDefault=true to make this profile the default (clears it on others).

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name | string |  |
| logo | string |  |
| slogan | string |  |
| address | string |  |
| phone | string |  |
| email | string |  |
| socials | array |  |
| isDefault | boolean |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
