---
name: expocut-template-import
description: "Bring outside project files into ExpoCut and send ExpoCut templates back out. Use when the user has a Lottie / Bodymovin JSON, a Final Cut Pro FCPXML (or FCP7 / Premiere xmeml), an Adobe .mogrt, an ASC CDL .cdl/.ccc, an Adobe .cube LUT or an ExpoCut .ectpl file and says \"import this\", \"open my After Effects / Final Cut export on the phone\", \"convert this template\", \"which fonts will it swap\", \"will HEVC / ProRes / alpha work on that Android phone\", or wants \"export to Lottie / FCPXML\". Also covers detect_format, migrate_template for old layer JSON, font fallback (resolve_font_fallback, audit_font_coverage, list_font_aliases) and codec / device-class queries. Do not use for hand-authoring a reel JSON (expocut-reel-templates), applying templates, brand kits or Community submissions (expocut-templates-brand), LUT / CDL grading in the editor (expocut-color-grading), or loudness (expocut-audio-post). CapCut .draft, .aep, .prproj, .drp and OTIO are detected but cannot be imported."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Template import and interchange with ExpoCut

You are the interchange specialist: you turn a foreign project file into an ExpoCut Template
JSON, load it onto the timeline, read out what the importer could not reproduce, fix the rest by
hand, and round-trip finished templates back out to Lottie or FCPXML. The importer tools are pure
functions — nothing on the phone changes until you call `import_template_json`, and every edit
after that is undoable in the app.

## When to use / hand off

- A file from another tool: this skill. Formats that import today: Lottie / Bodymovin `.json`
  (plain JSON, not the dotLottie zip), FCPXML `.fcpxml`, FCP7 / Premiere legacy XML (`<xmeml>`
  root), Adobe `.mogrt`, ASC CDL `.cdl` / `.ccc`, Adobe `.cube`, ExpoCut `.ectpl` as JSON text.
- Detected but refused (the reason comes back from `detect_format`): `.otio` (recognised, not
  importable), `.aep`, `.prproj`, `.drp`, `.fcpbundle`, CapCut `.draft`, VN `.vn`. Tell the user
  which export to make instead: Bodymovin / Lottie from After Effects, FCPXML from Premiere,
  Resolve or Final Cut.
- Hand-authoring or debugging an `.ectpl` reel JSON → expocut-reel-templates.
- Applying the bundled template, brand profiles, saving or submitting templates →
  expocut-templates-brand (`import_template_json` lives there; you call it in step 5 below).
- Registering a `.cube` and applying LUTs / CDL grades on layers → expocut-color-grading.
- `measure_loudness`, `gain_to_loudness_target`, `build_loudness_plan`, `list_loudness_targets` are
  registered in this family but belong to the audio workflow → expocut-audio-post.
- Fonts and text styling after import → expocut-kinetic-captions. Inspection and export →
  expocut-editor-ops.

## Before you start

1. Ask where the file is. On the phone (Files app, the app's document directory) →
   `import_from_file_system { path }`. Pasted or attached in the conversation →
   `import_foreign_file { filename, text }` for JSON / XML / `.cube` / `.cdl`, or
   `{ filename, bytesBase64 }` for `.mogrt`. Inputs over 16 MB are refused before parsing.
2. If the extension is missing or suspicious, sniff first:
   `detect_format { filename: "clip.xml", textHead: "<first 4 KB of the file>" }`.
   For a zip pass `isZipContainer: true`.
3. Know what comes back: a Template document (`schemaVersion`, `id`, `name`, `category`,
   `aspectRatio`, `durationMs`, `slots`, `tracks`, `layers`) plus `warnings[]` with
   `severity: "info" | "warn"` and a `message`. Media never travels with Lottie / FCPXML /
   `.mogrt` imports — every clip, photo and audio file becomes an empty slot the user fills.
4. No importer tool needs an open project. `import_template_json` creates and opens one;
   `describe_canvas`, `capture_canvas`, `update_layer` then act on it.

## Core workflow

1. Detect (optional): `detect_format { filename: "title.mogrt", isZipContainer: true }` →
   `{ format: "mogrt", confidence: 1, reason }`. A refused type returns `format: "unknown"` with
   a reason such as `rejected: draft — CapCut draft — no schema, not importable`. Stop there and
   explain; do not try the importer.
2. Import — one of:
   `import_from_file_system { path: "file:///…/Documents/anim.json" }`
   `import_foreign_file { filename: "anim.json", text: "<file contents>" }`
   `import_foreign_file { filename: "title.mogrt", bytesBase64: "<base64 of the file>" }`
   Success: `{ ok: true, format, template, extraTemplates, warnings }`. Failure:
   `{ ok: false, format, reason, warnings }` — `reason` is readable ("Expected zip container for
   .mogrt, got png", "FCPXML contained zero sequences", "OpenTimelineIO import is not yet
   supported").
3. Read every warning to the user before touching anything: they list each dropped or
   approximated feature (per-format list in `references/formats.md`). An FCPXML with several
   `<sequence>` elements returns the first as `template` and the rest in `extraTemplates` — ask
   which one to open.
4. Fonts. Collect the `fontFamily` values from `template.layers`, then
   `audit_font_coverage { fontNames: ["Bebas Neue", "Proxima Nova", "Georgia"] }` →
   `{ totalRequested, exact, aliased, fuzzy, histogram }`. For each fuzzy name confirm with
   `resolve_font_fallback { name: "Proxima Nova", weight: 700, category: "sans-serif" }` →
   `{ font: { id, label, … }, confidence, reason, exactMatch, requestedWeight }`. Confidence 1 is
   an exact bundled match, 0.95 the alias table, 0.5–0.85 a category guess, 0.25 the system
   font. Say the substitution in words ("Proxima Nova → Avenir Next") before applying it.
5. Load it: `import_template_json { template: <result.template>, name: "Imported title" }`.
   It validates the document, inflates it, saves a new project and navigates the editor there;
   returns `{ projectId, layerCount, unfilledRequiredSlots, validationWarnings }`. Add
   `bindings` to pre-fill slots (recipe 2). Validation failures come back as one error listing
   every violation — fix the JSON and call again.
6. Review cheaply, then look: `describe_canvas { timeSec: 0 }` (text only: visible layers with
   bounding boxes in canvas %), then `capture_canvas { timeSec: 0, maxWidth: 512 }`, then a
   mid-timeline frame with `capture_canvas { timeSec: 2.5, maxWidth: 512, xray: true, grid: true }`
   for labelled boxes over a 10 % grid. `preview_filmstrip { fromSec: 0, toSec: 5, frames: 6 }`
   shows motion and pacing in one call.
7. Fix up: `list_layers` for ids, then `update_layer { id: "text0", patch: { fontSize: 42,
   textColor: "#FFFFFF" } }`, `set_text_font { layerId: "text0", fontFamily: "din-alternate" }`,
   `remove_layer { id: "shape3" }` for placeholder boxes (ask first), `reorder_layer { layerId:
   "video0", position: 5 }` when z-order came in wrong. Finish with `save_project`.
8. Out again: get a document with `save_project_as_template { id: "my-title-v1", name: "My title",
   mode: "snapshot" }` and pass it to `export_template_to_lottie { template: <template>, fr: 30 }`
   or `export_template_to_fcpxml { template: <template>, fps: 30, wrapInLibrary: true }`. Both
   return text (`{ lottie, warnings }` / `{ xml, warnings }`); you write the file.

## Tools you will use

| Tool | What for | Key params (units, enums) |
| --- | --- | --- |
| `detect_format` | Classify before importing | `filename*`, `textHead` (first ~4 KB), `isZipContainer` → `{ format, confidence 0..1, reason }` |
| `import_foreign_file` | Import inline payload | `filename*`, `text` (JSON / XML / cube / cdl) or `bytesBase64` (.mogrt) |
| `import_from_file_system` | Import from the phone | `path*` (`file://` URI or path under the document dir), `filename` override |
| `migrate_template` | Back-fill old layer JSON | `layers*` array → `{ layers, report: { alreadyMigrated, fills, perLayer } }` |
| `export_template_to_lottie` | Template → Bodymovin v5 | `template*`, `fr` (default 30), `width`, `height` |
| `export_template_to_fcpxml` | Template → FCPXML 1.10 | `template*`, `fps`, `width`, `height`, `wrapInLibrary` (default true) |
| `resolve_font_fallback` | One font → bundled id | `name*`, `weight` (`ultralight…black` or 100..900), `italic`, `category` (`sans-serif|serif|display|handwriting|monospace|rounded|condensed|arabic|urdu`) |
| `audit_font_coverage` | Many fonts at once | `fontNames*` array |
| `list_font_aliases` | The 62 curated aliases | none → `{ aliases: [{ from, to }], count }` |
| `query_codec_support` | Can this device encode it | `kind*` `video|audio`, `codec*`, `platform*` `ios|android`, `deviceClass` |
| `resolve_codec_fallback` | Degrade-and-warn profile | `videoCodec*`, `audioCodec*`, `container*` `mp4|mov|webm|mxf|mkv`, `alpha*`, `bitDepth*` `8|10`, `platform*`, `deviceClass` |
| `default_device_class` | Conservative class | `platform*` → `apple-a10-plus` or `android-baseline` |
| `parse_cube_lut` | Inspect a `.cube` | `text*` → `{ kind "3d"/"1d", size, dataLength, domainMin, domainMax, title }` (data not returned) |
| `bake_cdl_to_cube` | CDL → `.cube` text | `cdl*` `{ slope, offset, power, saturation }`, `size` `17|33|65` (default 33), `title`, `allowNegative`, `clipOutput` |
| `write_cdl` | CDL → XML | `entries*` array, `kind` `cdl|ccc|cdl-list` |

Codec ids the capability tables know: video `h264`, `hevc-8bit`, `hevc-10bit`, `hevc-422`,
`hevc-alpha`, `prores-422`, `prores-422-hq`, `prores-4444`, `dnxhr`, `dnxhd`, `vp9`, `av1`;
audio `aac-lc`, `opus`, `flac`, `alac`, `pcm-24` (only `aac-lc` encodes on either platform).
Device classes: `apple-a10-plus`, `apple-a12-plus`, `apple-a13-plus`, `android-baseline`,
`android-mid`, `android-high`, `android-pixel-6-plus`.

## Recipes

### 1. Lottie title from the phone, verified on the canvas

```
import_from_file_system { path: "file:///…/Documents/lower-third.json" }
  → { ok: true, format: "lottie", template, warnings: [ { severity: "warn", message: "Shape layer … repeater dropped" } ] }
audit_font_coverage { fontNames: ["Montserrat", "Roboto"] }
  → aliased: ["Montserrat", "Roboto"]           // Montserrat → avenir-next, Roboto → helvetica-neue
import_template_json { template: <template>, name: "Lower third (Lottie)" }
  → { projectId: "proj_…", layerCount: 4, unfilledRequiredSlots: [] }
describe_canvas { timeSec: 0.5 }
capture_canvas { timeSec: 0.5, maxWidth: 512, xray: true }
list_layers
update_layer { id: "text0", patch: { content: "Sabine Klauke", fontSize: 30 } }   // example ids
save_project
```

Lottie position / scale / rotation / opacity keyframes come through as keyframe tracks; shape
paths, repeaters, trim paths, gradient fills and expressions are dropped with a warning each.
Precomps are flattened.

### 2. A `.mogrt` title with the user's own background clip

```
detect_format { filename: "Title_04.mogrt", isZipContainer: true }
import_foreign_file { filename: "Title_04.mogrt", bytesBase64: "<base64>" }
  → warnings include "Font \"Objektiv Mk2\" isn't embedded … substituted with \"Avenir Next\" (closest match, 85% confidence)"
     and "Any background footage in the Premiere preview is demo media … Add your own clip behind the title."
import_template_json { template: <template>, name: "Bold title" }
add_video_layer { uri: "file:///…/beach.mp4", startTime: 0, duration: 4.7, stretchToCanvas: true }
list_layers                       // the new video landed on top; move it behind the text
reorder_layer { layerId: "video0", position: 8 }   // example: last index = back
preview_filmstrip { fromSec: 0, toSec: 4.7, frames: 6 }
```

`startTime` / `duration` on `add_video_layer` are seconds. What a `.mogrt` import can and cannot
recover is listed in `references/formats.md` (fonts, 3D camera, per-character animators, exact
keyframe timing are the known gaps; each is reported as a warning, never silently wrong).

### 3. FCPXML round trip with a CDL grade

```
import_from_file_system { path: "file:///…/Documents/cut.fcpxml" }
  → template.slots: [ { id: "…-slot-0-video", kind: "video|image" }, { id: "…-slot-1-text", kind: "text", default: "OPENING" } ]
import_template_json { template: <template>, name: "Cut v2", bindings: { "<video slot id>": { kind: "media", uri: "file:///…/clip.mp4", durationMs: 6000, width: 1080, height: 1920 } } }
set_layer_cdl { layerId: "video0", slope: [1.05, 1, 0.95], offset: [0, 0, 0.02], power: [1, 1, 1], saturation: 0.9 }
save_project_as_template { id: "cut-v2", name: "Cut v2", mode: "snapshot" }
export_template_to_fcpxml { template: <template>, fps: 30 }
  → xml with the grade embedded as <note>cdl:{…}</note> on the clip (Final Cut ignores it; ExpoCut re-import restores it)
```

FCPXML asset paths are captured only as slot labels — the user supplies the media. `<filter>`,
`<adjust-color>`, compound clips, alternate-lane audio and speed ramps are dropped with warnings.
`write_cdl { entries: [ { id: "shot1", cdl: { slope: [1.05, 1, 0.95], offset: [0, 0, 0.02], power: [1, 1, 1], saturation: 0.9 } } ], kind: "cdl" }`
produces a standalone `.cdl` for Resolve.

### 4. "Will this play on their phone?" before promising an export

```
default_device_class { platform: "android" }                       → { deviceClass: "android-baseline" }
query_codec_support { kind: "video", codec: "hevc-alpha", platform: "android" }
  → { supported: false, reason: "…" }
resolve_codec_fallback { videoCodec: "prores-4444", audioCodec: "opus", container: "mov", alpha: true, bitDepth: 10, platform: "android" }
  → { effectiveProfile: { videoCodec: "h264", audioCodec: "aac-lc", container: "mp4", alpha: false, bitDepth: 8 }, warnings: [ { severity: "lossy", dimension: "video-codec", message } ], rejected: false, maxSeverity: "lossy" }
```

These answer capability questions; they do not change the project. The actual encoder settings are
`set_export_settings` (expocut-editor-ops).

## Pitfalls

- The importers return a document, not a project. Nothing is on the timeline until
  `import_template_json`. Conversely `import_template_json` creates a new project every time —
  it never merges into the open one.
- `.cube` through the importer: the template's video layer carries `lut: { id, intensity: 1 }` with an
  id derived from the file's `TITLE` (or the filename), but the LUT data is not registered by the MCP
  path. Register it under that same id first: `lut_register_custom { id: "<template.layers[0].lut.id>",
  name: "Film look", cubeText: "<the .cube text>" }`, then use `set_layer_lut` on real layers
  (expocut-color-grading). For a plain "apply this .cube" request skip the importer entirely and go
  straight to `lut_register_custom`.
- `.ectpl` zips (Community bundles with `assets/`) rewrite media to `bundle://…` URIs; the MCP
  wrapper does not extract the assets, so import the zip through the app's Templates → Import
  button instead. Plain `template.json` text works through `import_foreign_file`.
- `.lottie` (dotLottie) is a zip; the router needs the inner JSON as `text`. Unzip first.
- `import_template_json` rejects `file://`, `http://` and `blob:` in URL fields of the document
  (`uri`, `remoteUrl`, `thumbnail`, `previewVideoUri`, `src`, …) — only `https:`, `asset:`,
  `bundled:` and `bundle:` pass. Local media goes in `bindings` (per slot), which are not scanned.
- A Lottie made only of shapes / solids has zero slots; a template-mode document with no slots fails
  validation ("Template must declare at least one slot"). Set `mode: "snapshot"` on the returned
  document before importing — snapshot mode skips the slot requirement.
- `migrate_template` takes a bare `layers` array (not a template) and back-fills `parentId`,
  `position`, `scale`, `rotation`, `trackIndex`, `startTime`, `duration`, `blendMode`, `opacity`
  and drops dangling track-matte references. Use it on hand-written or pre-1.0 layer JSON; the
  importer synths already emit migrated layers.
- Units differ by surface: the Template JSON stores `startTime` / `duration` / `durationMs` in
  milliseconds and keyframe `t` in microseconds; the MCP layer tools take seconds; keyframe tools
  take `timeMs`. Passing `6000` to `add_video_layer` makes a 6000-second layer.
- `list_font_aliases` keys are normalised (lowercase, punctuation stripped): "Bebas Neue" is looked
  up as `bebasneue`. 44 fonts are bundled; anything else resolves to the nearest one, so expect
  metric drift — re-check line breaks with `capture_canvas` after `set_text_font`.
- `export_template_to_lottie` drops video layers (Lottie cannot embed timeline video);
  `export_template_to_fcpxml` drops audio and widget layers. Both say so in `warnings`; both embed
  a layer's CDL as opaque metadata that only ExpoCut reads back.
- `export_project` is slow (seconds to minutes) and needs the phone awake and the editor mounted;
  `capture_canvas` and `preview_filmstrip` need the editor mounted too — `import_template_json`
  and `open_project` do that for you.

## Reference

- `references/formats.md` — per-format matrix (what maps, what degrades, the warning texts),
  the full 62-entry font alias table, codec and device-class tables. Read it when a warning needs
  explaining or when the user asks "what will I lose".
- https://expocut.com/mcp.html — the live tool reference.
- Siblings: expocut-templates-brand (apply / save / submit / theme), expocut-reel-templates
  (author the JSON), expocut-color-grading (LUT / CDL on layers), expocut-audio-post
  (loudness), expocut-kinetic-captions (fonts, text), expocut-editor-ops (inspect, export).
