# Reel recipes — known-good, export-verified blocks

Copy-paste JSON that has been **built on a simulator and exported to MP4**. Each
block is the shape that survived; the "why" notes are the version that didn't.

Run `node validate-reel.mjs your-reel.json` before every publish.

---

## 0. Units cheat-sheet (the #1 time sink)

| Where | Unit |
|---|---|
| MCP `add_*_layer` / `update_layer` patch — `startTime`, `duration` | **seconds** |
| `get_layer` response — `startTime`, `duration` | **milliseconds** (asymmetric!) |
| Template JSON — `durationMs`, `startTime`, `duration`, `fadeInMs` | **milliseconds** |
| `keyframes.tracks[].keyframes[].t` | **microseconds**, absolute on the project timeline |

> Passing `9000` to an MCP `add_*_layer` meaning "9000 ms" makes a **9000-second**
> layer. The export then tries to render 2.5 hours, appears to hang, and there is
> **no cancel-export tool** — the queue stays wedged.

---

## 1. Z-stack — assign trackIndex by ROLE, never by authoring order

**Lower trackIndex = in front.** Every layer needs a unique index.

```
front → back:  text · flash overlays · light leaks · stickers/SVG · photo cards · full-canvas media · background · audio
```

```js
// The helper that fixed an invisible on-screen hook: full-canvas video had been
// re-numbered in FRONT of the text, so the caption never appeared in the export.
function zrank(l) {
  const n = l.name || '';
  if (l.type === 'audio') return 9;
  if (n === 'Background') return 8;
  if (['video','image'].includes(l.type) && l.stretchToCanvas && l.slotRef) return 7; // full-screen media
  if (l.type === 'shape') return 6;        // photo cards
  if (n === 'Light leak') return 3;
  if (n === 'Flash') return 2;
  if (l.svgContent) return 4;              // stickers
  if (l.type === 'text') return 0;         // always front
  return 5;
}
layers.sort((a,b) => zrank(a)-zrank(b) || (a.startTime||0)-(b.startTime||0));
layers.forEach((l,i) => { l.trackIndex = i; });   // now unique AND correctly stacked
```

`tracks[]` must then be rebuilt and non-empty (empty `tracks[]` is a hard import error):

```js
const tt = t => ({text:'overlay',image:'image',shape:'image',video:'video',audio:'audio'}[t] || 'image');
doc.tracks = layers.map(l => ({ id:`t_${l.trackIndex}`, type:tt(l.type), name:l.name||'', trackIndex:l.trackIndex }));
```

---

## 2. Positioned / grid photo → **media-fill SHAPE** (never a scaled image layer)

The one that works. Sized by canvas fraction, so canvas and export agree exactly.

```json
{
  "id": "L_ph1", "type": "shape", "name": "Photo 1", "slotRef": "s_photo1",
  "trackIndex": 12, "startTime": 0, "duration": 22000,
  "position": { "x": 8, "y": 7 },
  "canvasRelativeWidth": 42, "canvasRelativeHeight": 33,
  "scale": 1, "rotation": -8, "fadeInMs": 420, "fadeOutMs": 320,
  "shapeConfig": {
    "type": "rounded_rect", "fillStyle": "image", "fillColor": "#EFE9E2",
    "fillMediaUri": "https://…/photo1.jpg",
    "fillMediaRemoteUrl": "https://…/photo1.jpg",
    "fillMediaFit": "cover", "cornerRadius": 20,
    "strokeColor": "#FFFFFF", "strokeWidth": 14, "opacity": 1
  },
  "remoteSource": { "url": "https://…/photo1.jpg", "kind": "cdn", "sourceId": "L_ph1" }
}
```

**Never add to this layer:** `colorAdjust`, `videoEffects`, `keyframes`, `scale ≠ 1`.
Any of them exports the card as a **blank rounded rectangle** (canvas still looks fine).
To "grade" shape photos, lay a light-leak overlay over them instead (§5).

> The version that failed: an `image` layer at `scale:0.917` + `fitMode:"contain"`.
> The canvas drew a neat 2×4 grid; the export drew huge blurry overlapping tiles,
> because the encoder sizes non-stretch images from `baseWidth × scale` using an
> editor-canvas-dependent base size.

---

## 3. Full-screen photo with Ken-Burns push

`image` layers **do** take the full effect stack + keyframes.

```json
{
  "id": "L_ph1", "type": "image", "name": "Photo 1", "slotRef": "s_photo1",
  "trackIndex": 8, "startTime": 3400, "duration": 1550,
  "content": "https://…/photo1.jpg",
  "position": { "x": 0, "y": 0 }, "scale": 1,
  "fitMode": "fill", "stretchToCanvas": true,
  "canvasRelativeWidth": 100, "canvasRelativeHeight": 100,
  "naturalWidth": 1080, "naturalHeight": 1350,
  "fadeInMs": 140, "transitionIn": "cut.flash", "transitionInDuration": 300,
  "videoEffects": [
    { "effectId": "amber-glow", "intensity": 0.28 },
    { "effectId": "vignette",   "intensity": 0.38 }
  ],
  "colorAdjust": { "saturation": 1.06, "brightness": 1.02, "contrast": 1.05, "temperature": 0.18 },
  "keyframes": { "tracks": [ { "property": "transform.scale", "keyframes": [
    { "t": 3400000, "v": 1.05, "interp": { "type": "preset", "name": "linear" } },
    { "t": 4950000, "v": 1.16, "interp": { "type": "preset", "name": "easeInOut" } }
  ] } ] }
}
```

A remote `https` **image** URL *is* downloaded by the export pipeline.

---

## 3b. Whip cuts + iris reveals → **junction transitions** (`transitions[]`)

Per-layer `transitionIn` is a one-clip intro. A cut that composites BOTH clips
(smear, iris, push, melt) is a **junction transition**: a top-level
`transitions[]` entry on the reel document, next to `layers`.

**The two structural rules — get these wrong and it silently becomes a hard cut:**

1. **Both clips must share one `trackIndex` and touch in time.** `findJunctions`
   only pairs clips adjacent on the same track (±2 frames). So a montage gets
   ONE track with clips back-to-back — this is the one legitimate exception to
   "every layer gets its own trackIndex", and the strict import path
   (`import_template_json`) only allows it because a transition declares it.
2. **`fromLayerId` / `toLayerId` reference the AUTHORED layer ids.** The
   inflater re-stamps them together with the layers.

```jsonc
"transitions": [
  { "id": "j1", "trackId": "t_montage",
    "fromLayerId": "L_shot1", "toLayerId": "L_shot2",
    "effectId": "distort.warp", "durationMs": 220,
    "alignment": "center", "ease": "inOut",
    "params": { "angle": 90, "intensity": 0.30,
                "blur": 0.85, "blurAngle": 90, "blurAniso": 0.92 } }
]
```

**Which family reads which param — they do NOT overlap:**

| params | family that reads them | ids |
| --- | --- | --- |
| `blur`, `blurAngle`, `blurAniso` | **distort** only | `distort.warp` `.ripple` `.melt` `.ink-bleed` `.liquid` `.twirl` `.pinch` |
| `originX`, `originY`, `bulge` | **wipe** only | `wipe.linear` `.clock` `.iris` `.barn-doors` `.checkerboard` `.matrix` |
| `angle`, `softness`, `borderWidth`, `intensity` | all | — |

**Three traps that cost real time:**

- **`blur` defaults to 0.** Setting `blurAngle`/`blurAniso` without `blur` is a
  no-op: a 0-radius kernel is a plain sample. Always set `blur` (0..1).
- **`intensity` is not a "strength" dial you can max out.** `distort.warp`
  displaces by `intensity * 0.22 * max(iResolution)` — at `1.25` each frame
  moves ~235px on an 854px canvas, so you get a slide with a black hole, not a
  whip. Keep it ~0.3 and let `blur` carry the effect.
- **`blurAngle` is DEGREES here, radians in the shader.** Alternating 90 / 0
  between consecutive cuts is what reads as a real whip-pan montage.

`wipe.iris` renormalises its radius to the farthest corner from
`originX`/`originY`, so an off-centre iris still finishes exactly at
progress 1. `bulge` adds a refracting rim riding the advancing edge.

---

## 3c. Full-height slanted band → over-tall rotated rectangle mask

A parallelogram "panel" of video (the slanted-band montage look) is a
full-bleed video layer with a rectangle `layerMask` that is TALLER than the
frame, tilted:

```jsonc
"layerMask": { "enabled": true, "shape": "rectangle",
               "rect": { "x": 0.52, "y": -0.9, "width": 0.34, "height": 2.8 },
               "rotation": 17, "feather": 0, "invert": false }
```

The rect's short edges fall outside the frame, so only the tilted long sides
are visible — a true full-height parallelogram, no skew/corner-pin needed.

- **Rotation sign = lean direction.** Positive rotation leans the band
  top-right → bottom-left (the `/` direction). If you draw SVG separator
  lines alongside (`x_bottom = x_top - run`), positive rotation is the one
  that runs PARALLEL to them.
- **Authored degrees ARE visual degrees** (pixel-space rotation — measured
  17 → 17.1° on a 1080p export, sub-pixel fit). To parallel separators whose
  run is `SLANT × width` over the full height, the band rotation must be
  `atan(SLANT × W/H)` — e.g. SLANT 0.30 on 16:9 → **28.07°**, not 17.
- **Put the lines ON the band edges — derive both from one pair of numbers.**
  In the reference look, separators are the panels' borders, not free-floating
  décor. For lines drawn at top-x fractions `s1`,`s2`, the band that lands its
  edges exactly on them (rect pivot = centre, which sits at mid-height for a
  vertically-centred over-tall rect):

  ```
  rotation = atan(SLANT * W/H)                    # 28.07° for SLANT .30, 16:9
  width    = (s2 - s1) * cos(rotation)
  x        = (s1 + s2)/2 - SLANT/2 - width/2
  ```

  Placing band and lines independently leaves the lines cutting across the
  panel — visible instantly on any straight-edged content.
- **Keep the rect over-tall, not clamped.** `y: -0.9, height: 2.8` is the
  point of the trick. (App builds before 2026-08-10 clamped the mask rect to
  the unit square AT EXPORT ONLY — the band previewed correctly and exported
  as a floating card with visible corners. If a band looks like a card in an
  MP4 but not on canvas, the app is too old.)

---

## 4. Beat-synced video segment (single-clip velocity)

One clip on N segments, each with its own `mediaOffset` + grade.

```json
{
  "id": "L_v3", "type": "video", "name": "Clip beat 3", "slotRef": "s_clip",
  "trackIndex": 10, "startTime": 5400, "duration": 2700,
  "content": "https://…/clip.mp4", "mediaOffset": 2800,
  "fitMode": "fill", "stretchToCanvas": true,
  "canvasRelativeWidth": 100, "canvasRelativeHeight": 100,
  "transitionIn": "cut.flash", "transitionInDuration": 180,
  "filterId": "light.cool-window",
  "colorAdjust": { "saturation": 1.1, "contrast": 1.08, "temperature": 0.14 },
  "videoEffects": [ { "effectId": "vignette", "intensity": 0.35 } ],
  "keyframes": { "tracks": [
    { "property": "transform.scale", "keyframes": [
      { "t": 5400000, "v": 1.08, "interp": { "type": "preset", "name": "linear" } },
      { "t": 8100000, "v": 1.22, "interp": { "type": "preset", "name": "easeOut" } } ] },
    { "property": "fx.blur", "keyframes": [
      { "t": 5400000, "v": 7, "interp": { "type": "preset", "name": "linear" } },
      { "t": 5740000, "v": 0, "interp": { "type": "preset", "name": "easeOut" } } ] }
  ] }
}
```

White flash on the cut — a full-canvas SVG rect, brief:

```json
{ "id": "L_fl3", "type": "image", "name": "Flash", "trackIndex": 3,
  "startTime": 5330, "duration": 270, "content": "",
  "svgContent": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><rect width='10' height='10' fill='#FFFFFF'/></svg>",
  "naturalWidth": 10, "naturalHeight": 10, "position": { "x": 0, "y": 0 },
  "scale": 1, "fitMode": "fill", "stretchToCanvas": true,
  "canvasRelativeWidth": 100, "canvasRelativeHeight": 100,
  "fadeInMs": 60, "fadeOutMs": 210, "opacity": 0.85 }
```

---

## 5. "Lights" → real-footage light-leak overlay (NOT a generative shader)

The parity-safe way to add flares/glow. Screen-blended video from the ExpoCut CDN.
Tile it in ~3s chunks to cover the span.

```json
{ "id": "L_leak0", "type": "video", "name": "Light leak",
  "trackIndex": 4, "startTime": 3000, "duration": 3000,
  "content": "", "mediaOffset": 0,
  "remoteSource": { "url": "https://expocut.b-cdn.net/light-leak/v1/warm-sunset/warm-sunset-01.mp4",
                    "kind": "http", "sourceId": "warm-sunset-01" },
  "position": { "x": 50, "y": 50 }, "scale": 1,
  "blendMode": "screen", "fitMode": "fill", "stretchToCanvas": true,
  "canvasRelativeWidth": 100, "canvasRelativeHeight": 100, "opacity": 0.5 }
```

Categories: `warm-sunset` · `cool-window` · `cool-bokeh` · `prism-rainbow` · `prism-edge` ·
`soft-anamorphic` · `sun-flare` · `neon` · `vintage-filmburn` (presets `-01` … `-11`).

**Do not use `generativeBg`** (`lightrays`, `bokehdrift`, `light-leak`) in a shipped
template: `lightrays` is subtle on canvas but a heavy wash in export, and `light-leak`
has **no canvas shader at all** — it prints a `No SkSL preview for …` watermark on the
preview while rendering thick fog in the MP4.

> If you call the `add_light_leak_overlay` MCP tool it emits ~6 layers **sharing one
> trackIndex**, which then fails `save_project_as_template` with "One layer = one
> object". Re-number (§1) after calling it.

---

## 6. Text — typewriter, centered title, gold caption

```json
{ "id": "L_lyr1", "type": "text", "name": "Lyric 1", "slotRef": "s_lyric",
  "trackIndex": 0, "startTime": 600, "duration": 5600,
  "content": "you will be my girl,",
  "position": { "x": 4, "y": 4.5 }, "textAlign": "left", "textFullWidth": false,
  "fontFamily": "arial", "fontWeight": "800", "fontSize": 21, "textColor": "#151515",
  "textAnimInId": "in-tw-classic", "textAnimInDuration": 1500,
  "textAnimOutId": "out-fade", "textAnimOutDuration": 380 }
```

- Centered headline → `textFullWidth: true` **and** `position.x: 0` (x is ignored; `textAlign` centers).
- Free/column text → `textFullWidth: false` with a real `x`.
- `fontSize` is canvas points ≈ `design_px × 0.366`.
- Gold caption look: `"textEffectId": "fx-outline-gold", "textStrokeColor": "#FFD700", "textStrokeWidth": 3, "textShadowColor": "#B8860B", "textShadowBlur": 4`.
- Verified anim ids: in — `in-tw-classic`, `in-apple-title`, `in-blur-slide`, `in-fade-up`, `in-fade`;
  out — `out-fade`, `out-cinema-fade`, `out-fade-blur`; loop — `loop-breathe`, `loop-float`.
  (Get the full list from `list_text_animations`; ids must match exactly.)

> `set_typewriter` alone writes `typewriterCharDelay` but **no animation** — a
> round-trip through `save_project_as_template` came back with `content: ""` and no
> anim ids at all. Set `textAnimInId: "in-tw-classic"` explicitly in the JSON.

---

## 7. Background — inline SVG gradient (unique id!)

```json
{ "id": "bg", "type": "image", "name": "Background", "trackIndex": 22,
  "startTime": 0, "duration": 22000, "content": "",
  "svgContent": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640'><defs><linearGradient id='bgG' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='#FFFFFF'/><stop offset='100%' stop-color='#FFF3F8'/></linearGradient></defs><rect width='360' height='640' fill='url(#bgG)'/></svg>",
  "naturalWidth": 360, "naturalHeight": 640,
  "position": { "x": 0, "y": 0 }, "scale": 1, "fitMode": "fill",
  "stretchToCanvas": true, "canvasRelativeWidth": 100, "canvasRelativeHeight": 100 }
```

Every gradient `id` must be unique across the **whole file** — ids are resolved
globally in the native renderer and a collision makes one shape render with **no fill**.

---

## 8. Structure that fills 22s without feeling stretched

Padding a short reel by slowing it down reads as dead air. Add *content* instead:

| Pattern | Example |
|---|---|
| **Accumulate** | photo cards that appear one by one and stay (6 cards over 18s) |
| **Two waves** | build a grid, then refresh every cell with a second set (6 → 12 slots) |
| **Text progression** | 4 typewriter beats instead of 1 static line |
| **Outro card** | a final gold line after the montage ("make a wish ✨") |
| **More beats** | 5 → 8 video segments with alternating warm/cool grades |

More slots = more of the user's own content = a better reel. 12 photo slots over
22s is comfortable; ~1.5s per full-screen photo is the montage rhythm that reads well.

---

## 9. Sim test loop (what actually verifies a template)

```bash
# 1. offline lint first — catches ~everything in <1s
node validate-reel.mjs my-reel.json

# 2. import + export on the simulator (MCP)
#    import_template_json  → export_project  → returns {uri}
#    For a media-fill SHAPE, point fillMediaUri at a LOCAL file:// for this test —
#    a raw export does not download a shape's remote fill (the app's
#    prefetchTemplateAssets does, on the real "use Reel" path).

# 3. pull frames and eyeball the export (it is the ground truth)
ffmpeg -y -i export.mp4 -vf "fps=0.5,scale=150:267,tile=6x2" sheet.jpg
```

`export_project` is **synchronous** (~40–60s). Do **not** wrap it in a retry loop —
retries double-fire and create phantom "another export is already in progress" locks.
A 504 on the HTTP call usually means the export **succeeded anyway**; look for the
newest `…/Library/Caches/VideoExport_*.mp4`.

`verify_export_parity` is currently unusable: it diffs canvas (512×910) against
export (480×854) **without resizing**, so it reports `meanAbsDiff: -1` /
`MAJOR_DIFFERENCES` on frames that are pixel-identical. Diff manually until it
normalizes dimensions.

---

## 10. Wizard behaviour you cannot fix from the template

- `autoFillFromStock` runs **automatically** when the Wizard opens and replaces every
  unbound slot with **random stock photos**. It ignores `slot.defaultBinding`, so your
  curated defaults only ever show in the pre-rendered `previewVideoUri`.
- `mode: "snapshot"` with zero slots stops that — but **breaks the Wizard opening
  entirely**. Keep `mode: "template"` + slots so "Use this Reel" opens the Wizard.
- Fixing it properly is an app change (make auto-fill and the demo canvas respect
  `defaultBinding`), not a template change.
