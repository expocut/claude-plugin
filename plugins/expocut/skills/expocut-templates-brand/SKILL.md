---
name: expocut-templates-brand
description: "Start and finish branded ExpoCut projects from templates. Use for \"use a template\", \"start from the speaker card\", \"drop this template JSON into the editor\", \"apply my brand kit / logo / slogan / socials\", \"change the theme colours\", \"swap the palette\", \"save this edit as a template\", \"publish / share this to the Community\", \"delete my upload\", reels and themes. Owns list_templates, apply_template (slot bindings + themeId), import_template_json, set_template_theme (@role palette tokens), save_project_as_template (template vs snapshot), submit_template / list_my_submissions / delete_my_submission, list_reels / apply_reel / swap_reel_theme, and the brand profile tools (create / update / delete / get / list, apply_brand_profile_to_project). Do not use for authoring or debugging the reel JSON itself (expocut-reel-templates), importing Lottie / FCPXML / .mogrt / .cube files (expocut-template-import), or ordinary editing once the project exists (expocut-video-creating)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Templates, reels and brand kits with ExpoCut

You are the templating and branding hand: you start projects from templates, keep the user's
brand consistent across them, capture a finished edit as a template, and — only with explicit
consent — publish it. Applying or importing a template always creates a new project (nothing is
overwritten); theme swaps, brand application and saves act on the open project and are undoable in
the app; a Community upload leaves the phone and is public the moment it lands, so confirm before
calling it.

## When to use / hand off

- Starting from a template, filling slots, theming, brand text/logo, saving, sharing: this skill.
- Writing or fixing the Template / reel JSON (layers, slots, trackIndex, SVG, keyframes) →
  expocut-reel-templates. It documents the document format that `import_template_json` accepts.
- Lottie / FCPXML / `.mogrt` / `.cube` / `.cdl` from other tools → expocut-template-import (its
  output is fed to `import_template_json` from this skill).
- Placing extra media, cuts, text and export after the template is open → expocut-video-creating
  and expocut-editor-ops. Colour work beyond palettes → expocut-color-grading.

## Before you start

1. `list_templates` — what is actually bundled. In current builds the only bundled template is
   `speaker-card-v1` (Events, 4:5, 16 s, 20 slots). Every other gallery template is fetched from
   the CDN by the app's Templates screen and is not reachable through `apply_template`. For those,
   ask the user to open it in the app, or obtain its JSON and use `import_template_json`.
2. `list_reels` — returns an empty list in current builds (reels ship from the CDN; see
   expocut-reel-templates). `apply_reel` and `swap_reel_theme` therefore have nothing to act on;
   do not promise them.
3. `list_brand_profiles` — whether a default brand exists. A default brand's typography and
   colours are applied automatically by `apply_template` and `import_template_json` (those two
   fields are set in the app's Settings; the MCP tools edit name / logo / slogan / contact /
   socials only).
4. `get_active_project` and `list_layers` before any save, submit, theme or brand call — they need
   an open project and act on it as it is right now.

## Core workflow

1. Apply the bundled template:
   `apply_template { templateId: "speaker-card-v1", name: "Design Summit speakers", themeId: "sunset" }`
   → `{ projectId, templateId, themeId, layerCount, unfilledRequiredSlots }`. The editor opens on
   the new project. Themes for this template: `original`, `cyan-wave`, `sunset`, `forest`,
   `crimson`, `mono`. Slots (all `text` unless noted): `logoPrefix`, `logoText`, `eventLine1`,
   `eventLine2`, `dateLine`, `tagline`, `url`, `speaker1FirstName`, `speaker1LastName`,
   `speaker1Role`, `speaker1Company` (same four for `speaker2…` / `speaker3…`), `music` (audio).
   Pre-fill with `bindings`, a map of slot id → typed value:
   `{ kind: "text", value: "…" }`, `{ kind: "media", uri: "file:///…", durationMs, width, height }`,
   `{ kind: "color", hex: "#RRGGBB" }`, `{ kind: "number", value }`. No tool lists a template's slot
   ids (`list_templates` only reports `slotCount`), so use the list above or read `template.slots`
   from a JSON you already have.
2. Or load a JSON document (hand-authored, exported by `save_project_as_template`, or produced by
   expocut-template-import): `import_template_json { template: <doc>, name: "My reel", themeId: "…" }`
   → `{ projectId, layerCount, unfilledRequiredSlots, validationWarnings }`. The document is treated
   as untrusted: `schemaVersion` must be `"1.0"` or `"1.1"`; `id`, `name`, `category`,
   `aspectRatio`, `durationMs` required; `slots` non-empty unless `mode: "snapshot"`; `tracks` and
   `layers` non-empty; every layer needs `id`, `type`, `startTime`, `duration`, `trackIndex` (ms);
   one layer per `trackIndex` (except clips joined by an entry in `transitions[]`); URL fields
   (`uri`, `remoteUrl`, `thumbnail`, `previewVideoUri`, `src`, …) accept only `https:`, `asset:`,
   `bundled:`, `bundle:`; caps of 200 layers, 64 slots, 300 tracks, 4096-character strings,
   30-minute duration. Every violation is listed in the single error message.
3. Pull the brand in: `list_brand_profiles` → `apply_brand_profile_to_project { profileId: "<id>" }`
   → `{ textUpdates, logoUpdates }`. It matches layers by `name` (case-insensitive): text layers
   named `Brand Name`, `Brand` or `Name` get the profile name; `Slogan` / `Tagline` the slogan;
   `Website` the handle of the social with `platform: "website"`; `Phone`, `Email`, `Address` the
   obvious fields; image layers named `Logo` or `Brand Logo` get the logo file URI. Empty profile
   fields are skipped, so `textUpdates: 0` usually means the layers are not named that way — check
   `list_layers` and rename with `update_layer { id: "text2", patch: { name: "Slogan" } }`.
4. Create or maintain the brand (each call is a full profile write, saved immediately):
   `create_brand_profile { name: "Acme Coffee", slogan: "Wake up different", logo: "file:///…/logo.png", email: "hi@acme.com", phone: "+1 555 0100", address: "12 Bean St", socials: [{ platform: "instagram", handle: "@acme" }, { platform: "website", handle: "acme.com" }], isDefault: true }`
   → `{ id, isDefault }`. `platform` must be one of `tiktok`, `instagram`, `youtube`, `twitter`,
   `facebook`, `linkedin`, `snapchat`, `pinterest`, `threads`, `website`; `handle` is a non-empty
   string. The first profile becomes the default automatically. `update_brand_profile { id, … }`
   merges a partial patch (`isDefault: true` clears the flag on others); `get_brand_profile { id }`
   returns everything, including `colors` and `typography` when set in-app;
   `delete_brand_profile { id }` promotes the first remaining profile to default — confirm first.
5. Re-theme a palette-based project: `set_template_theme { themeId: "emerald" }` →
   `{ themeId, fromThemeId, layerCount }`. Works only on projects whose template shipped
   `palettes` (colours written as `@role` tokens — see `references/theming.md`); a wrong id
   returns an error that lists the available palette ids; `my-brand` appears when the default
   brand has colours. `speaker-card-v1` uses legacy per-layer themes, so on that project the call
   fails — change theme by applying the template again with another `themeId`.
6. Save the open project as a template:
   `save_project_as_template { id: "acme-intro-v1", name: "Acme intro", description: "5 s brand opener", category: "My Templates", mode: "template" }`
   → `{ template }`. `mode: "template"` (default) turns text and media layers into slots and bakes
   everything else; it rejects two layers on one `trackIndex` ("one layer = one object") — move
   the layer with `reorder_layer` or use `mode: "snapshot"`, which copies every property verbatim
   with no slots. From MCP the JSON is only returned, not written to the My Templates rail: keep
   it (write it to a file) and reload it later with `import_template_json`. Check the layout with
   `capture_canvas { xray: true, grid: true }` before saving.
7. Share to the Community — explicit consent first:
   `submit_template { id: "acme-intro-v1", name: "Acme intro", description: "5 s brand opener", category: "Promo", retention: "7d", thumbnailUri: "file:///…/thumb.jpg", previewVideoUri: "file:///…/demo.mp4", stripPrivateMedia: true, metadata: { authorName: "Acme", tags: ["intro"] } }`
   It snapshots the open project, zips local assets into an `.ectpl`, uploads, and publishes at
   once (no moderation queue). Defaults: `retention: "1d"`, `stripPrivateMedia: true` (video /
   image / audio URIs and `remoteSource` are cleared; text, masks, effects, keyframes stay).
   Limits: bundle ≤ 100 MB, thumbnail ≤ 512 KB jpg / png / webp, `retention` one of `once`, `1d`,
   `7d`, `21d`, `30d` (server cap 60 days). `metadata` is forwarded verbatim as JSON (the client
   knows `authorName`, `authorEmail`, `licenseAgreement`, `categoryHint`, `tags`, `notes`). The
   app UI gates this behind the Elite plan; the MCP call does not check, so treat it as an Elite
   feature. Returns `{ ok, binaryId, publicUrl, thumbnailPublicUrl?, retention, expiresAtMs, … }`
   and stores the owner credential locally.
8. Manage uploads: `list_my_submissions` → rows with `binaryId`, `publicUrl`, `retention`,
   `expiresAtMs`, `timeLeft`, `deleted`; `delete_my_submission { binaryId: "<from the list>" }` →
   `{ ok, reason? }`. Only the device that uploaded can delete; if the local registry was cleared
   the upload simply expires with its retention.

## Tools you will use

| Tool | What for | Key params |
| --- | --- | --- |
| `list_templates` | Bundled templates | `category`, `aspectRatio` → id, name, category, aspectRatio, durationMs, slotCount |
| `apply_template` | New project from a bundled template | `templateId*`, `name`, `bindings` `{ slotId: value }`, `themeId` |
| `import_template_json` | New project from a Template document | `template*`, `name`, `bindings`, `themeId` |
| `save_project_as_template` | Open project → Template JSON | `id*`, `name*`, `description`, `category`, `mode` `template|snapshot` |
| `set_template_theme` | Swap palette on a palette project | `themeId*` (palette id or `my-brand`) |
| `submit_template` | Publish to the Community | `id*`, `name*`, `description`, `category`, `retention` `once|1d|7d|21d|30d`, `thumbnailUri`, `previewVideoUri`, `stripPrivateMedia`, `metadata` |
| `list_my_submissions` | This device's uploads | none |
| `delete_my_submission` | Retract an upload | `binaryId*` |
| `list_reels` / `apply_reel` / `swap_reel_theme` | Bundled reels (currently none) | `aspectRatio` / `reelId*`, `themeId`, `name`, `bindings` / `themeId*` |
| `list_brand_profiles` | Summary of saved brands | none → id, name, isDefault, socialCount, updatedAt |
| `get_brand_profile` | Full profile | `id*` |
| `create_brand_profile` | New brand | `name*`, `logo` (file URI), `slogan`, `address`, `phone`, `email`, `socials` `[{ platform, handle }]`, `isDefault` |
| `update_brand_profile` | Patch a brand | `id*` + any of the above |
| `delete_brand_profile` | Remove a brand | `id*` |
| `apply_brand_profile_to_project` | Substitute brand fields by layer name | `profileId*` |

Categories the Template type knows: `For You`, `Real Estate`, `Promo`, `Birthday`, `Travel`,
`Food`, `Events`, `My Templates`.

## Recipes

### 1. Speaker card for a conference, branded

```
list_brand_profiles                                   → default: "Design Summit"
apply_template { templateId: "speaker-card-v1", name: "Keynote speakers", themeId: "cyan-wave", bindings: { eventLine1: { kind: "text", value: "Design Summit" }, eventLine2: { kind: "text", value: "Lisbon" }, dateLine: { kind: "text", value: "3–5 Oct 2026" }, speaker1FirstName: { kind: "text", value: "Sabine" }, speaker1LastName: { kind: "text", value: "Klauke" }, music: { kind: "media", uri: "file:///…/bed.mp3", durationMs: 16000 } } }
describe_canvas { timeSec: 4 }                        // text only — is the speaker beat laid out?
capture_canvas { timeSec: 4, maxWidth: 512 }
apply_brand_profile_to_project { profileId: "<default id>" }   // fills any layer named Website / Email …
save_project
```

Unbound text slots keep their defaults ("WeAreDevelopers", "World Congress"); fix leftovers with
`update_layer { id: "text3", patch: { content: "…" } }` after `list_layers`.

### 2. Turn the open edit into a reusable, brand-aware template

```
list_layers                                           // find the title and the logo image
update_layer { id: "text0", patch: { name: "Brand Name" } }
update_layer { id: "text1", patch: { name: "Slogan" } }
update_layer { id: "image0", patch: { name: "Logo" } }
capture_canvas { timeSec: 1, maxWidth: 512, xray: true, grid: true }
save_project_as_template { id: "acme-opener-v1", name: "Acme opener", category: "My Templates", mode: "template" }
  → { template }   // write this JSON to disk; it is not stored on the phone
```

Later, on any device with the JSON: `import_template_json { template: <doc>, name: "Acme opener – May" }`
then `apply_brand_profile_to_project { profileId: "<id>" }` — the renamed layers pick up the
current brand's name, slogan and logo.

### 3. A palette template, imported and re-themed

Author the colours as tokens and ship two palettes (ids are free-form; these two are examples) (full grammar in `references/theming.md`):

```json
{ "schemaVersion": "1.1", "id": "promo-card-v1", "name": "Promo card", "category": "Promo", "aspectRatio": "9:16", "durationMs": 6000,
  "palettes": [
    { "id": "original", "label": "Original", "roles": { "bg": "#0B1020", "accent": "#5EE7FF", "textPrimary": "#FFFFFF" }, "pairs": { "textPrimary": "bg" } },
    { "id": "sunset",   "label": "Sunset",     "roles": { "bg": "#F4E9D8", "accent": "#C2410C", "textPrimary": "#1F1300" }, "pairs": { "textPrimary": "bg" } } ],
  "slots": [ { "id": "headline", "label": "Headline", "kind": "text", "default": "SUMMER SALE" } ],
  "tracks": [ { "id": "t0", "type": "overlay", "name": "Title", "trackIndex": 0 }, { "id": "t1", "type": "image", "name": "Background", "trackIndex": 1 } ],
  "layers": [
    { "id": "title", "type": "text", "name": "Headline", "slotRef": "headline", "trackIndex": 0, "startTime": 0, "duration": 6000, "position": { "x": 0, "y": 42 }, "textFullWidth": true, "textAlign": "center", "fontSize": 36, "fontFamily": "din-alternate", "textColor": "@textPrimary" },
    { "id": "bg", "type": "shape", "name": "Background", "trackIndex": 1, "startTime": 0, "duration": 6000, "stretchToCanvas": true, "shapeConfig": { "type": "rectangle", "fillColor": "@bg", "strokeColor": "@accent/60", "strokeWidth": 12 } } ] }
```

```
import_template_json { template: <doc>, name: "Promo card", themeId: "sunset" }
capture_canvas { timeSec: 1, maxWidth: 512 }
set_template_theme { themeId: "original" }            → { themeId: "original", fromThemeId: "sunset" }
set_template_theme { themeId: "my-brand" }            // only when the default brand has colours
```

### 4. Publish, check, retract

```
get_active_project
capture_canvas { timeSec: 2, maxWidth: 512 }          // what will be shared
// ask: "Publish 'Acme opener' to the Community for 7 days with your media stripped?"
submit_template { id: "acme-opener-v1", name: "Acme opener", category: "Promo", retention: "7d", stripPrivateMedia: true }
list_my_submissions                                   → [{ binaryId, publicUrl, timeLeft: "6d 23h", deleted: false }]
delete_my_submission { binaryId: "<from the list>" } → { ok: true }
```

## Pitfalls

- `apply_template` only knows bundled templates (`speaker-card-v1`); CDN gallery templates and all
  reels are out of reach of `apply_template` / `apply_reel`. Say so instead of guessing an id.
- `set_template_theme` needs `templatePalettes` on the project record — only projects created from
  a template with `palettes` have it. The error text tells you which ids exist; if it says the
  project has no palettes, the template is hex-authored and must be recoloured with
  `update_layer` or expocut-color-grading tools.
- `apply_brand_profile_to_project` writes only into layers with the exact names listed in step 3.
  It never invents a handle, phone or address; if the profile lacks a field the layer is left as
  is — never fill brand facts from memory.
- The brand `colors` / `typography` that drive `my-brand` theming and automatic typography are
  not settable through MCP; direct the user to Settings → Brand for those.
- `save_project_as_template` in template mode throws on two layers sharing a `trackIndex`, which
  happens after tools such as `add_light_leak_overlay` that emit several layers on one track.
  Re-number with `reorder_layer` or save a `snapshot`.
- `save_project_as_template` does not persist to the phone from MCP even though the JSON is
  registered when the same action runs in the app UI. Always capture the returned `template`.
- `submit_template` is irreversible in the sense that the file is public immediately; the only
  undo is `delete_my_submission` from the same device. Keep `stripPrivateMedia: true` unless the
  user explicitly says the footage may be public, and never set `retention` longer than asked.
- `category` on `save_project_as_template` / `submit_template` is a free string to the validator
  but the gallery expects one of the eight categories above; use `My Templates` for private saves.
- Time units: template JSON is milliseconds (`durationMs`, layer `startTime` / `duration`,
  `preferredDurationMs`, binding `durationMs`); layer tools you use afterwards (`add_*_layer`,
  `update_layer` patches) take seconds.
- `delete_brand_profile` and `delete_my_submission` are destructive outside the editor's undo
  stack — confirm with the user.

## Reference

- `references/theming.md` — the `@role` token grammar, `pairs` contrast rule, how `my-brand` is
  derived from brand colours, legacy per-layer themes, what the project stores. Read it when
  authoring palettes or when a theme swap leaves a colour unchanged.
- https://expocut.com/mcp.html — live tool reference.
- Siblings: expocut-reel-templates (the document format, slots, SVG, keyframes),
  expocut-template-import (foreign files in / Lottie / FCPXML out), expocut-video-creating,
  expocut-editor-ops, expocut-color-grading.
