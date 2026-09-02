---
name: expocut-reel-templates
description: "Author, fix or review the .ectpl reel / template JSON that ExpoCut loads through import_template_json (schemaVersion 1.1, template and snapshot modes): the canvas and aspect model, percent placement, font sizing, inline SVG vector graphics with unique gradient ids, slots and slotRef, text animation ids, microsecond keyframes, junction transitions, trackIndex z-order, and the export-safe rules that make the MP4 match the canvas on any device. Use for \"write a reel template\", \"turn this design / CapCut / Figma / poster into an ExpoCut template JSON\", \"why is the slot empty, the logo missing, the gradient gone or the text off-centre in the export\", \"validate / lint my reel JSON\". Do not use for applying bundled templates, brand profiles, palette theming or Community submissions (expocut-templates-brand), for importing Lottie / FCPXML / .mogrt files (expocut-template-import), or for animating layers on a live project (expocut-motion-graphics)."
license: MIT
compatibility: Works standalone as guidance for hand-authoring the JSON; becomes hands-on when paired with the ExpoCut in-app MCP server (build in the editor, then export the reel).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Perfect reel templates with ExpoCut

A **reel template** is a single JSON file (served from the CDN) that the app turns into an editable project. This skill is the field guide to authoring one that (a) looks exactly like the design, (b) **renders correctly in the exported MP4**, and (c) **reuses on any device** without empty slots.

Everything here is the distilled result of building real templates. Follow the rules — most were learned by watching a template break.

## When to use / hand off

- You are writing or debugging the JSON document itself. To load it into the editor call
  `import_template_json { template: <doc>, name: "Test import" }` — it validates (strict one layer
  per `trackIndex`, https-only URLs, size caps), creates a new project and opens it. To get a
  starting document from a project built in the editor call
  `save_project_as_template { id: "my-reel-v1", name: "My reel", mode: "snapshot" }` — the JSON is
  returned, not stored, so keep it.
- Applying the bundled template, brand profiles, `set_template_theme` palettes, Community
  `submit_template` / `delete_my_submission` → **expocut-templates-brand**.
- Lottie / FCPXML / `.mogrt` / `.cube` / `.cdl` files from other tools → **expocut-template-import**
  (it produces this same document shape, which you then fix with the rules below).
- Keyframes on a live project (`keyframe_add`, motion paths) → **expocut-motion-graphics**;
  junction transitions on a live cut (`set_junction_transition`) → **expocut-social-speed-edit**;
  looking at the result (`describe_canvas`, `capture_canvas`, `preview_filmstrip`,
  `export_project`) → **expocut-editor-ops**.

---

## 1. The two modes — decide first

Every file declares `"schemaVersion": "1.1"` and a `mode`:

| mode | What it is | Media layers | When to use |
|------|-----------|--------------|-------------|
| **`template`** | A blank frame with **slots** to fill. | `content: ""`, filled from `slots[].defaultBinding`. | The reusable, gallery-facing product. User drops in their clips/photos. |
| **`snapshot`** | A **saved project** with everything embedded. | Real URLs / inline SVG baked in. `slotRef` still exposes the editable ones. | A finished, branded piece (e.g. an agency's own reel) that others tweak text/photos on. |

Rule of thumb: a montage users re-shoot (Travel Cinematic, Velocity) → **template**. A branded, opinionated piece (Agent Intro) → **snapshot** with slots on the text and photos.

---

## 2. Mental model

- **Canvas** — fixed by `aspectRatio` + `durationMs`. Everything is placed in **percent of canvas** (0–100), never pixels. So the same numbers work at any export resolution.
- **Layers** — the actual content (text, image/SVG, video, audio, generativeBg). Each has a `trackIndex`, `startTime`, `duration`, `position`, `scale`.
- **Tracks** — one lane per layer; `trackIndex` sets **z-order and timeline row**. Templates carry a light `tracks[]` (id/type/name/trackIndex); snapshots carry richer tracks with a `layers:[ids]` list.
- **Slots** — the editable holes. A `slots[]` entry defines the hole + its default; a layer opts in with `slotRef: "<slotId>"`. Many layers can share one slot.

```
aspectRatio + durationMs  →  the stage
slots[]                   →  what the user can change
tracks[] (trackIndex)     →  z-order + timeline rows
layers[]                  →  the content itself
```

### Canvas presets
| aspectRatio | Export px | Use |
|---|---|---|
| `9:16` | 1080×1920 | TikTok / Reels / Shorts |
| `4:5`  | 1080×1350 | Feed video (max feed real estate) |
| `1:1`  | 1080×1080 | Square |
| `16:9` | 1920×1080 | YouTube / landscape |

---

## 3. Coordinates & placement — the rules that bite

Positions are **percent**. `{x:50, y:50}` is dead center. But *how* x behaves depends on the layer:

**Text — two placement modes:**
- `textFullWidth: true` → the text box spans the **whole canvas width**; `textAlign` (`center`/`left`/`right`) places the glyphs. **Set `position.x: 0`** — x is effectively ignored; only `y` matters. This is how you center a headline. (Every centered line in these templates has `x≈0, textFullWidth:true, textAlign:"center"`.)
- `textFullWidth: false` → a **free box** anchored by `x` (its left-ish edge). Use for left-aligned column text or a label that sits beside something (e.g. an agent's "YOUR AGENT" at `x:43.7, textAlign:"left"`).

**Images / SVG — center-scale drift:** a layer renders **scaled about its own center**, so at `scale ≠ 1` the visual creeps toward (scale<1) or away from (scale>1) the canvas center. That's why logos sit at **negative y** (e.g. `y:-3`) — you push the anchor up to counter the downward drift. Don't fight the math in your head:

> **Place → screenshot → measure → correct.** Nudge `position`/`scale` until the element lands where the design says. (If driving the editor via MCP: `capture_canvas`, read the frame, adjust, repeat. A closed measure-and-correct loop is how every element here was aligned — never eyeballed.)

**Matching a source design (poster, Figma, screenshot):** convert its pixels directly.
- `x% = px_x / designWidth * 100`   ·   `y% = px_y / designHeight * 100`
- `fontSize = px_fontsize × 0.37`  (see §4)
This maps a 1080-wide comp onto the canvas almost 1:1.

---

## 4. Font sizing

`fontSize` is in **canvas points**, not pixels — the numbers look small (8–42). Convert from a pixel design on a 1080-wide reference:

> **fontSize ≈ design_px × 0.366**  (≈ px ÷ 2.73)

Worked examples (all real): 106px hero → **38.8** · 74px CTA → **27** · 60px name → **22** · 42px → **15.4** · 22px badge → **8** · 20px eyebrow → **7.3**.

Other type fields: `fontFamily` (`arial`, `georgia`, `din-alternate`, `snell-roundhand`, …), `fontWeight` (`"400"`–`"800"`), `fontItalic`, `textColor` (`#RRGGBB`), `letterSpacing` (pt; 2–3 for luxe caps labels), `lineHeight`, `textTransform`, and shadow (`textShadowColor/Blur/OffsetX/OffsetY` — a 12px black blur keeps captions legible over video).

**Two-font discipline:** pick one display face + one utility face and stay on them. Mirror the source system exactly (e.g. Georgia serif for headlines/quote, Arial for every label).

---

## 5. SVG vector graphics — build shapes here, not as images

Any non-photo graphic (bars, pills, plates, bordered boxes, dividers, diamonds, icon grids, badges) is an **`image` layer with inline `svgContent`** plus `naturalWidth`/`naturalHeight` = the viewBox size. Pure vector = crisp at any res, self-contained (no external asset to go missing), and it renders reliably in export.

```json
{ "type":"image", "name":"cta pill",
  "svgContent":"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 92'><defs><linearGradient id='pillG2' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='#F8D374'/><stop offset='50%' stop-color='#F2B739'/><stop offset='100%' stop-color='#D99A28'/></linearGradient></defs><rect x='2' y='2' width='596' height='88' rx='9' fill='url(#pillG2)'/></svg>",
  "naturalWidth":600, "naturalHeight":92, "scale":1.55, "fitMode":"contain" }
```

Four rules, each learned the hard way:

1. **Every `<linearGradient>` id must be UNIQUE across the whole file.** The native export renderer treats gradient ids **globally** — two shapes both using `id="g"` collide and one silently renders with **no fill** (it vanishes in the MP4 while looking fine on the editor canvas). Name them `pillG2`, `plateG`, `box1G`, `box2G`, …
2. **Use SVG for wide shapes; raster only for ~square media.** A wide raster (a gradient PNG bar) gets forced into a near-square render box and stretches tall. SVG honors its `viewBox` aspect, so bars/plates/boxes stay correct.
3. **Solid fills always render; gradients need rule #1.** If a gradient shape keeps dropping out, either give it a unique id or fall back to a solid `fill="#F2B739"`.
4. **`<text>` inside SVG renders** (bare `font-family="Arial"`), good for baked labels — but text baked into SVG is **not editable and can't be a slot**. If the user needs to change it, make it a real `text` layer instead. (Breaking a baked block into a plate SVG + separate text layers is the editable pattern.)

---

## 6. Layers & z-order

`trackIndex` controls **stacking**: **lower index = ON TOP (front)**. So the base/background sits at the *highest* index and hero text at a low one. When you place a plate behind its label, the plate needs a **higher** trackIndex than the text.

Common fields on every layer: `id`, `type`, `name`, `startTime` (ms), `duration` (ms), `position{x,y}`, `scale`, `rotation`, `trackIndex`, `fitMode`.

Layer types & their signature fields:

| type | Key fields |
|---|---|
| **text** | `content`, `textAlign`, `textFullWidth`, `fontFamily/Weight/Size`, `textColor`, `letterSpacing`, `textAnimInId/OutId/LoopId`, `textAnim*Duration`, shadow, `slotRef` |
| **image** | `content` (URL) **or** `svgContent`, `naturalWidth/Height`, `scale`/`scaleX`/`scaleY`, `fitMode`, `stretchToCanvas`, `fadeInMs/OutMs`, `cropRect`, `border{}`, `remoteSource{}`, `slotRef` |
| **video** | `content:""`, `mediaOffset` (trim into source, ms), `fitMode:"fill"`, `stretchToCanvas:true`, `canvasRelativeWidth/Height:100`, `filterId`, `filterIntensity`, `transitionIn`, `transitionInDuration`, `videoEffects[]`, `keyframes`, `colorGradeDelta`, `slotRef` |
| **audio** | `content`, `volume` (0–1), `fadeInMs/OutMs`, `remoteSource{url,kind:"freesound",sourceId}`, `slotRef` |
| **generativeBg** | `effectId` (`lightrays`, `bokehdrift`, …), `fxParams{}`, `canvasRelativeWidth/Height`, `opacity` — full-canvas atmosphere (light bursts, drifting bokeh) |

**One clip, many looks:** a video slot can appear on several segments with different `mediaOffset` + `filterId` per segment (the Velocity reel plays one portrait across 5 beat-synced grades). Great for "single-clip" trending templates.

---

## 7. Animation & timing

- **Text:** `textAnimInId` / `textAnimOutId` / `textAnimLoopId` + matching `*Duration` (ms). Ids come from `list_text_animations` (197 presets) and must match exactly. Vocabulary you'll reach for: in — `in-fade-up`, `in-mask-reveal`, `in-fade-zoom`, `in-slide-left-fade`, `in-apple-title`, `in-wow`, `in-tw-classic` (typewriter); out — `out-fade`, `out-fade-up`, `out-cinema-fade`; loop — `loop-float`, `loop-breathe`. (These carry most reels.) The blur-named presets (`in-blur-slide`, `out-fade-blur`, `out-blur-slide`, `in-tw-blur`) still work but do NOT blur — that keyframe channel rendered on no surface and was removed in 5.7.0, so reach for them only for their motion.
- **Video transitions:** dotted namespaces on `transitionIn` — `dissolve.cross`, `cut.flash`, `light.warm-sunset`, `light.cool-window`, `slide.zoom`, `dissolve.dip-to-black` — plus `transitionInDuration`.
- **Keyframes** (`keyframes.tracks[{property, keyframes:[{t, v, interp}]}]`): animate `transform.scale`, `fx.blur`, `transform.x/y`, `opacity`, etc. **`t` is in MICROSECONDS** — `12000000` = 12,000 ms = 12 s. A subtle `scale 1.12 → 1.0` over 0.7 s is the classic Ken-Burns push; blur `20 → 0` is a motion-blur reveal. `interp`: `{type:"preset",name:"easeOut"}` or `{type:"linear"}`.

**Sequencing:** overlap `startTime`/`duration` so each element fades out as the next fades in — no hard gaps. Give the whole reel a rhythm (hook → build → payoff → CTA).

---

## 8. Slots — make it reusable

A slot is a labeled, typed hole with a default. A layer joins a slot via `slotRef`.

```json
"slots": [
  { "id":"headline", "label":"Headline", "kind":"text", "default":"CINEMATIC" },
  { "id":"clip1", "label":"Clip 1", "kind":"video", "required":true, "preferredDurationMs":1500,
    "defaultBinding": { "kind":"media",
      "uri":"https://…/clip.mp4", "remoteUrl":"https://…/clip.mp4",
      "width":360, "height":640, "durationMs":6000 } },
  { "id":"music", "label":"Music", "kind":"audio",
    "defaultBinding": { "kind":"media", "uri":"https://…/song.mp3", "remoteUrl":"https://…/song.mp3" } }
]
```
- `kind`: `text` | `image` | `video` | `audio`. Text slots use `default`; media slots use `defaultBinding` (always give `width`/`height` and, for video, `durationMs`).
- `required:true` forces the user to supply media; `preferredDurationMs` hints the ideal trim.
- **Reuse a slot across layers:** the three "BUY. SELL. INVEST." lines in the Agent Intro all point to one `s_headline` — edit once, updates everywhere.
- Keep `slotCounts` (tallies per kind) in sync with the actual slots.

---

## 9. Assets & the "empty slots / missing logo" trap

This is the #1 way a template fails on someone else's device:

- **Every media asset must live at a stable, public URL the app can fetch** — host on the ExpoCut CDN (`https://expocut.b-cdn.net/reels/assets/<template-id>/…`) or a reliable source (Pexels/Freesound previews). Set `remoteSource {url, kind, sourceId}` on video/audio so it re-resolves.
- **Never reference a local device/simulator file path** (`file:///…`). It exists only on the machine that built it; everywhere else the slot is **empty** ("Required slots are empty: …"). If you built in the editor with a local image, re-import it through the app's picker or upload to the CDN before exporting the template.
- **Remote raster in the export:** a not-yet-cached remote image can render missing or glitched in the MP4 (a download race). Host it on the trusted CDN and it renders. SVG graphics have no such issue (they're inline).
- Ship a **`previewVideoUri`** and **`thumbnail`** — the gallery needs both.

---

## 10. Export-safe checklist (paste this before you publish)

- [ ] `schemaVersion:"1.1"`, correct `mode`, unique `id`, `name`, `description`, `category`, `aspectRatio`, `durationMs`.
- [ ] `slotCounts` matches `slots[]`; every `slotRef` points to a real slot.
- [ ] **Every gradient `id` is unique** across the whole file (no two `id="g"`).
- [ ] All shapes are **SVG** (not stretched raster); raster reserved for photos/logos.
- [ ] Every media asset is a **public CDN/URL** — zero `file://` paths.
- [ ] Centered text: `textFullWidth:true`, `position.x:0`. Column text: `textFullWidth:false` with a real `x`.
- [ ] `fontSize` set via `design_px × 0.37`; two-font system held.
- [ ] Plates/pills sit **behind** their text (higher `trackIndex`).
- [ ] Keyframe `t` values are in **microseconds**.
- [ ] `previewVideoUri` + `thumbnail` present.
- [ ] `tracks[]` is **non-empty** and every layer has a **unique `trackIndex`**.
- [ ] No `colorAdjust` / `videoEffects` / `keyframes` / `scale≠1` on a **media-fill shape** (§12).
- [ ] Ran `node reference/validate-reel.mjs my-reel.json` — zero ERRORs.
- [ ] Rendered the MP4 and eyeballed **every scene** — logos present, gradients filled, nothing clipped, text on-plate and centered.

---

## 12. The four rules that cost the most (read before authoring)

Each was found by exporting an MP4 and finding the layer wrong while the editor
canvas looked perfect. Full detail + copy-paste blocks in `reference/recipes.md`;
machine-readable in `reference/layer-capability-matrix.json`; enforced offline by
`reference/validate-reel.mjs`.

1. **Positioned photos must be media-fill SHAPES sized by `canvasRelativeWidth/Height`.**
   A positioned `image` layer sized with `scale` + `fitMode:"contain"` matches on
   canvas and comes out huge/blurry in the export (the encoder sizes it from
   `baseWidth × scale`). Full-screen photos are fine as `image` + `stretchToCanvas`.
2. **Never put `colorAdjust`, `videoEffects`, `keyframes` or `scale≠1` on a media-fill
   shape** — the fill exports as a **blank rectangle**. Grade shape photos with a
   light-leak overlay on top instead. `image`/`video` layers *do* take the full stack.
3. **Three time units.** MCP `add_*_layer` takes **seconds**; the JSON uses **ms**;
   keyframe `t` is **microseconds**. Passing `9000` "ms" to MCP builds a 9000-*second*
   project — the export then renders for hours and there is no cancel tool.
4. **Assign `trackIndex` by role, not authoring order** (lower = front):
   `text · flashes · light leaks · stickers · photo cards · full-canvas media · background · audio`.
   Re-numbering by sort order silently buried an on-screen hook behind the video.

Bonus: use **real-footage light-leak overlays** (`blendMode:"screen"`, CDN clips) for
"lights". `generativeBg` shaders diverge canvas↔export — `light-leak` has no canvas
shader at all and prints a `No SkSL preview` watermark while rendering fog in the MP4.

---

## 11. Build workflow

1. **Design first** — pick aspect, duration, the scene beats, palette, two fonts. If matching a comp, note each element's px → convert (§3/§4).
2. **Lay the base** — background/video, then work forward; remember lower `trackIndex` = front.
3. **Place & measure** — position each layer, screenshot, correct. Don't eyeball.
4. **Vectorize graphics** — every shape as unique-id SVG.
5. **Animate & sequence** — anim ids + keyframes; stagger timings for smooth hand-offs.
6. **Slot it** — add `slots[]`, wire `slotRef`, host defaults on the CDN.
7. **Preview render** — export the MP4, walk every scene against the checklist.
8. **Publish** — attach `previewVideoUri` + `thumbnail`, drop the JSON on the CDN.

### Driving the loop through MCP

```
import_template_json { template: <doc>, name: "Reel test" }        // validate + create + open
describe_canvas { timeSec: 1.2 }                                  // cheap text check of what is visible
capture_canvas { timeSec: 1.2, maxWidth: 512, xray: true, grid: true }
preview_filmstrip { fromSec: 0, toSec: 9, frames: 6 }             // pacing and hand-offs
export_project                                                    // the MP4 is the ground truth (40–60 s, phone awake)
```

A validation failure lists every violation in one error — fix the JSON, call again. Layer edits
made in the editor afterwards (`update_layer` patches take **seconds**) can be captured back with
`save_project_as_template { id: "my-reel-v1", name: "My reel", mode: "snapshot" }`.

### Reference files

| File | Use it for |
|---|---|
| `reference/recipes.md` | **Start here.** Export-verified copy-paste blocks: grid photo card, full-screen Ken-Burns photo, beat-synced video segment, light-leak overlay, typewriter text, SVG background, the z-stack helper, units cheat-sheet, and the sim test loop. |
| `reference/layer-capability-matrix.json` | Which fields are safe on which layer type (`ok` / `canvasOnly` / `breaks`), plus units, validator rules, tool quirks and Wizard behaviour. Machine-readable. |
| `reference/validate-reel.mjs` | Offline linter — `node validate-reel.mjs my-reel.json`. Catches unit mix-ups, duplicate/empty tracks, orphan slotRefs, `file://` paths, gradient-id collisions, illegal field/type combos and text hidden behind full-canvas media, in <1s instead of a 60s export round-trip. |
| `reference/schema.md` | Compact field reference. |
| `reference/starter-4x5.json` | Minimal valid skeleton to copy. |
| `reference/examples/` | One complete worked template, `droplet-lens-montage-v1.json` (junction transitions). |

## Style of advice
Be concrete and measured. When a template looks wrong, name the rule it broke (gradient-id collision, local-file slot, fullWidth vs free-box text, microsecond keyframes, trackIndex z-order). Verify by rendering and looking, not by assuming.
