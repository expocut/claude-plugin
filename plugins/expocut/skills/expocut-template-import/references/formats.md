# Import / export formats — what maps, what degrades, what the warnings mean

Read this when a warning from `import_foreign_file` / `import_from_file_system` needs explaining,
when the user asks "what will I lose", or when you need the exact codec / device-class / font
alias tables.

## Detection (`detect_format`)

First match wins: extension → leading content (`<?xml` roots, JSON keys, `.cube` header tokens)
→ zip flag. Returns `{ format, confidence 0..1, reason }`.

| Result `format` | Recognised by | Importable |
| --- | --- | --- |
| `lottie` | `.json` with `"v"` + `"layers"`; `.lottie` zip (confidence 0.9) | yes as JSON text; a `.lottie` zip must be unzipped first |
| `fcpxml` | `<fcpxml>` root or `.fcpxml` extension | yes |
| `xmeml` | `<xmeml>` root (FCP7 / Premiere legacy XML) | yes — parsed into the same timeline model as FCPXML |
| `mogrt` | `.mogrt` extension + zip | yes, pass `bytesBase64` (or a path) |
| `cdl` | `<ColorDecisionList>`, `<ColorCorrectionCollection>`, standalone `<ColorCorrection>` with `<SOPNode>`, or `.cdl` / `.ccc` extension | yes |
| `cube` | `TITLE` / `LUT_3D_SIZE` / `DOMAIN_MIN` / `DOMAIN_MAX` header, or `.cube` extension | yes |
| `ectpl` | JSON with `"schemaVersion": "1.0"|"1.1"` plus `slots` or `mode`; `.ectpl` extension; `.ectpl` zip | JSON text yes; zip bundle only through the app's Import button (assets are not extracted by the MCP path) |
| `otio` | `"OTIO_SCHEMA"` key | no — "OpenTimelineIO import is not yet supported" |
| `unknown` + `reason: "rejected: …"` | `.aep`, `.prproj`, `.drp`, `.draft` (CapCut), `.vn`, `.fcpbundle` | no — recommend a Lottie / FCPXML export instead |

Every import also caps input at 16 MB and, for `.mogrt`, refuses non-zip bytes ("Expected zip
container for .mogrt, got png").

## Per-format mapping

### Lottie / Bodymovin

- Comp `w × h` → nearest `aspectRatio` preset (9:16, 1:1, 16:9, 4:5, 4:3); `op / fr` → `durationMs`.
- Text layers → `text` prototypes with a `text` slot (default = the Lottie text); image layers →
  `image` prototypes with an `image` slot; shape / solid layers → `shape` prototypes baked in
  (no slot); null / unknown layers dropped with a warning.
- Position / scale / rotation / opacity keyframes → keyframe tracks (bezier handles, hold
  interpolation, frames → µs). Each layer gets its own `trackIndex`.
- Dropped with warnings: precomp nesting (flattened), shape path data, repeaters, trim paths,
  gradient fills, expressions, blend modes, parenting.
- Zero-slot result (only shapes / solids): set `mode: "snapshot"` on the document before
  `import_template_json`, or the validator rejects it for having no slots.

### FCPXML / xmeml

- Each `<sequence>` → one Template; the first is `template`, the rest `extraTemplates`.
- `asset-clip` / `video` → `video` prototype with a `video|image` slot labelled after the asset
  filename (the path itself is not carried — the user binds media). `title` → `text` prototype
  with a `text` slot whose default is the title text. `audio` → `audio` prototype with an `audio`
  slot. `gap` → dropped.
- One clip per `trackIndex`; timing in ms from the rational FCPXML times.
- Dropped with warnings: `<filter>` effects (route grades through `.cdl` instead),
  `<adjust-color>`, compound clips, alternate-lane audio, speed ramps.

### Adobe `.mogrt`

The zip carries `definition.json` (the editable parameter "capsule") and an `.aep` body. The
importer reads the capsule fully and decodes what it can of the `.aep`.

- Parameters → slots bound by `slotRef`; text, position, scale, colour and opacity controls map
  directly. Unknown parameter types are routed as text with a warning.
- Comp aspect snapped to the nearest preset (warning names the substitute ratio).
- Warnings you will see, and what they mean:
  - `Font "…" isn't embedded in the .mogrt — substituted with "…" (closest match, NN% confidence)` —
    licensed fonts never travel; glyph shapes and metrics differ. Confirm with
    `resolve_font_fallback` and re-check line breaks on the canvas.
  - `Text reveal approximated: the AE per-character range-selector animation maps to a fade-up
    entrance on each word` — AE text animators become a word-level `in-fade-up`; per-character
    type-on and exact easing are not reproduced.
  - `After Effects keyframed motion is not imported — layers use approximate timing` — transform
    keyframes in the `.aep` are not decoded; layer in/out timing is approximate.
  - `3D camera / Classic-3D layers detected — the editor has no 3D camera, so any perspective moves
    are flattened.`
  - `N nested compositions flattened on import.`
  - `AEP: added N background color block(s) …, aligned to the word reveals` — solid colour blocks
    are recovered and synced to the words, not to the original per-block timing.
  - `Any background footage in the Premiere preview is demo media … Add your own clip behind the
    title.` — always true; add a video layer and move it to the back.
- Known residual gaps (documented in the app's plan): fonts, 3D camera and motion blur, AE
  rasteriser anti-aliasing, external footage, expressions and unsupported effects.

### ASC CDL `.cdl` / `.ccc`

- Each `<ColorCorrection>` → one `video` prototype with a `video|image` slot and the grade in
  `layer.ascCdl` (`slope`, `offset`, `power`, `saturation`). A `.ccc` with N corrections yields
  N slots in one template.
- On the timeline the same grade is set with `set_layer_cdl { layerId, slope, offset, power, saturation }`
  (expocut-color-grading). `write_cdl` and `bake_cdl_to_cube` go the other way.

### Adobe `.cube`

- One `video|image` slot + one `video` prototype carrying `lut: { id, intensity: 1 }`; `id` comes
  from the `TITLE` header or the filename.
- The LUT data itself is not registered by the MCP path. Register it under the same id with
  `lut_register_custom { id, name, cubeText }` (max 1 MB of text) before the layer can render the
  grade; `parse_cube_lut` only reports `size`, `domainMin` / `domainMax`, `title`, `dataLength`.

### ExpoCut `.ectpl`

- JSON text: validated and returned as-is (`schemaVersion` 1.0 / 1.1; 1.0 documents read as
  `mode: "template"`).
- Zip bundle (`template.json` + `assets/…`, produced by `submit_template`): media is rewritten to
  `bundle://assets/<hash>.<ext>`; the MCP wrapper does not hand back the extracted bytes, so use
  the app's Templates → Import for bundles.

## Exporters

| Tool | Keeps | Drops (with a warning each) | Extras |
| --- | --- | --- | --- |
| `export_template_to_lottie` | text (ty 5), image (ty 2 + asset), shape (ty 1); `transform.x/y`, `transform.scale` (uniform / X / Y), `transform.rotation`, `opacity` keyframe tracks → Lottie keyframes with bezier tangents; `trackIndex` order → Lottie z-order; `durationMs` → frames at `fr` (default 30) | video layers ("Lottie cannot embed timeline video"), unknown types | a layer's `cdl` is embedded as opaque metadata (players ignore it; ExpoCut re-import restores it) |
| `export_template_to_fcpxml` | text → `<title>`, image / video → `<asset-clip>` + `<asset>`, shape → `<video>` generator with a Color param; frame-aligned rational times at `fps`; 9:16, 16:9, 1:1, 4:5, 4:3 formats; `wrapInLibrary` (default true) | audio layers, widgets / unknown types | a layer's `cdl` is written as `<note>cdl:{…}</note>` on the clip |

## Codec capability tables

`query_codec_support { kind, codec, platform, deviceClass? }` → `{ supported, reason? }`.
`resolve_codec_fallback` → `{ effectiveProfile, warnings[{ severity: info|lossy|reject, dimension, message }], rejected, maxSeverity }`.

| Codec | iOS | Android | Notes |
| --- | --- | --- | --- |
| `h264` | yes | yes | the universal fallback |
| `hevc-8bit` | Apple A10+ | class-dependent | |
| `hevc-10bit` | Apple A12+ | class-dependent | Main10 |
| `hevc-422` | class-dependent | class-dependent | |
| `hevc-alpha` | iOS 13 + Apple A10+ | no | alpha exports fall back to no-alpha with a `lossy` warning |
| `prores-422`, `prores-422-hq`, `prores-4444` | iOS only | no | |
| `dnxhr`, `dnxhd` | no | no | MXF workflows are rejected |
| `vp9`, `av1` | class-dependent | class-dependent | |
| `aac-lc` | yes | yes | the only audio encoder |
| `opus`, `flac`, `alac`, `pcm-24` | no | no | "export is AAC-only" |

Device classes, in capability order: `apple-a10-plus` < `apple-a12-plus` < `apple-a13-plus`;
`android-baseline` < `android-mid` < `android-high` < `android-pixel-6-plus`.
`default_device_class` returns `apple-a10-plus` / `android-baseline`. Containers: `mp4`, `mov`,
`webm`, `mxf`, `mkv`.

## Font fallback

`resolve_font_fallback` scores in four tiers: exact id / label / native name (confidence 1.0,
`exactMatch: true`) → curated alias (0.95) → category + weight heuristic with name similarity
(0.5–0.85, `reason` names the inferred category) → system font (0.25). `weight` accepts
`ultralight`, `thin`, `light`, `regular`, `medium`, `semibold`, `bold`, `heavy`, `black` or
100–900 (quantised). `category` pre-narrows to `sans-serif`, `serif`, `display`, `handwriting`,
`monospace`, `rounded`, `condensed`, `arabic`, `urdu`.

Bundled font ids (`list_fonts`, 44): system, helvetica-neue, avenir-next, futura, gill-sans,
verdana, arial, optima, din-alternate, georgia, baskerville, palatino, didot, hoefler, rockwell,
superclarendon, times, bodoni72, impact, copperplate, papyrus, chalkduster, chalkboard, phosphate,
snell-roundhand, bradley-hand, marker-felt, noteworthy, signpainter, courier-new, menlo,
american-typewriter, monaco, arial-rounded, avenir-next-condensed, din-condensed,
helvetica-condensed, geeza, al-nile, damascus, noto-naskh, nadeem, noto-nastaliq, jameel-noori.

### The 62 curated aliases (`list_font_aliases`)

Keys are normalised: lowercase, punctuation and spaces stripped ("Bebas Neue" → `bebasneue`).

| foreign name (normalised) | bundled id |
| --- | --- |
| `helvetica` | `helvetica-neue` |
| `helveticaneue` | `helvetica-neue` |
| `arial` | `arial` |
| `arialmt` | `arial` |
| `arialblack` | `arial` |
| `bebasneue` | `din-alternate` |
| `bebas` | `din-alternate` |
| `oswald` | `din-alternate` |
| `anton` | `din-alternate` |
| `impact` | `impact` |
| `haettenschweiler` | `impact` |
| `avenir` | `avenir-next` |
| `avenirnext` | `avenir-next` |
| `proximanova` | `avenir-next` |
| `proxima` | `avenir-next` |
| `montserrat` | `avenir-next` |
| `lato` | `avenir-next` |
| `objektiv` | `avenir-next` |
| `objektivmk2` | `avenir-next` |
| `opensans` | `helvetica-neue` |
| `roboto` | `helvetica-neue` |
| `inter` | `helvetica-neue` |
| `futura` | `futura` |
| `geometric` | `futura` |
| `georgia` | `georgia` |
| `times` | `times` |
| `timesnewroman` | `times` |
| `baskerville` | `baskerville` |
| `palatino` | `palatino` |
| `didot` | `didot` |
| `bodoni` | `bodoni72` |
| `bodoni72` | `bodoni72` |
| `garamond` | `baskerville` |
| `cambria` | `georgia` |
| `merriweather` | `georgia` |
| `playfair` | `didot` |
| `playfairdisplay` | `didot` |
| `rockwell` | `rockwell` |
| `robotoslab` | `rockwell` |
| `clarendon` | `superclarendon` |
| `superclarendon` | `superclarendon` |
| `courier` | `courier-new` |
| `couriernew` | `courier-new` |
| `menlo` | `menlo` |
| `monaco` | `menlo` |
| `consolas` | `menlo` |
| `jetbrainsmono` | `menlo` |
| `firacode` | `menlo` |
| `sourcecodepro` | `menlo` |
| `bradleyhand` | `bradley-hand` |
| `markerfelt` | `marker-felt` |
| `papyrus` | `papyrus` |
| `chalkduster` | `chalkduster` |
| `chalkboard` | `chalkboard` |
| `snellroundhand` | `snell-roundhand` |
| `pacifico` | `snell-roundhand` |
| `caveat` | `bradley-hand` |
| `permanentmarker` | `marker-felt` |
| `system` | `system` |
| `default` | `system` |
| `sansserif` | `system` |
| `serif` | `georgia` |
