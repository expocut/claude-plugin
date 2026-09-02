# Reel template schema — field reference (schemaVersion 1.1)

## Top level
| field | type | notes |
|---|---|---|
| `schemaVersion` | string | `"1.1"` |
| `mode` | string | `"template"` (slots to fill) or `"snapshot"` (embedded project) |
| `id` | string | unique, kebab-case, versioned e.g. `travel-cinematic-v1` |
| `name`, `description`, `category` | string | gallery copy; category e.g. `Real Estate`, `Travel`, `For You` |
| `aspectRatio` | string | `9:16` / `4:5` / `1:1` / `16:9` |
| `durationMs` | number | total length |
| `slotCounts` | object | `{ video, image, text, audio }` tallies |
| `slots` | array | see below |
| `tracks` | array | see below |
| `layers` | array | see below |
| `transitions` | array | usually `[]` (transitions live on video layers) |
| `previewVideoUri`, `thumbnail` | string | CDN URLs (required for the gallery) |

## slots[]
| field | type | notes |
|---|---|---|
| `id` | string | referenced by a layer's `slotRef` |
| `label` | string | shown to the user |
| `kind` | string | `text` / `image` / `video` / `audio` |
| `default` | string | text slots only — the default copy |
| `defaultBinding` | object | media slots — `{ kind:"media", uri, remoteUrl, width, height, durationMs }` |
| `required` | bool | force the user to supply media |
| `preferredDurationMs` | number | ideal trim length for a clip |

## tracks[]
- **template mode:** `{ id, type, name, trackIndex }`
- **snapshot mode:** `{ id, type, name, layers:[layerIds], isVisible }`
- `type`: `overlay` (=text) / `image` / `video` / `audio`
- `trackIndex`: z-order + timeline row. **LOWER = ON TOP (front).**

## layers[] — shared
`id`, `type` (`text|image|video|audio|generativeBg`), `name`, `startTime` (ms), `duration` (ms),
`position{x,y}` (percent 0–100), `scale`, `rotation`, `trackIndex`, `fitMode`, `overlayColor`, `slotRef?`.

### text
`content`, `textAlign` (`center|left|right`), `textFullWidth` (bool — true ⇒ set `x:0`),
`fontFamily`, `fontWeight` (`"400"`–`"800"`), `fontSize` (canvas pts ≈ px×0.366), `fontItalic`,
`textColor` (#RRGGBB), `letterSpacing`, `lineHeight`, `textTransform`,
`textAnimInId`, `textAnimOutId`, `textAnimLoopId`, `textAnimInDuration`, `textAnimOutDuration`,
`textShadowColor`, `textShadowBlur`, `textShadowOffsetX`, `textShadowOffsetY`.

### image (raster **or** vector)
Raster: `content` (URL), `naturalWidth/Height`, `remoteSource{url,kind,sourceId}`, `cropRect{x,y,width,height}` (0–1), `border{enabled,width,color,pattern,cornerRadius,sides}`.
Vector: `svgContent` (inline SVG string), `naturalWidth/Height` = viewBox size.
Common: `scale`, `scaleX`, `scaleY`, `fitMode` (`contain|cover|fill`), `stretchToCanvas`, `fullWidth`, `fadeInMs`, `fadeOutMs`, `animation`/`animationPreset`.
**Every `<linearGradient id>` must be globally unique.**

### video
`content:""`, `mediaOffset` (ms into source), `fitMode:"fill"`, `stretchToCanvas:true`,
`canvasRelativeWidth/Height:100`, `filterId`, `filterIntensity` (0–1),
`transitionIn` (`dissolve.cross|cut.flash|light.warm-sunset|slide.zoom|dissolve.dip-to-black`), `transitionInDuration`,
`videoEffects:[{effectId,intensity}]` (`bloom`,`vignette`,…), `colorGradeDelta:{brightness,contrast}`,
`keyframes:{tracks:[{property,keyframes:[{t,v,interp}]}]}`  ← **t in MICROSECONDS**.

### audio
`content` (URL), `volume` (0–1), `fadeInMs`, `fadeOutMs`, `remoteSource{url,kind:"freesound",sourceId}`.

### generativeBg
`effectId` (`lightrays`,`bokehdrift`), `fxParams{...}`, `canvasRelativeWidth/Height`, `opacity`.

## Gotchas (the ones that break a template)
1. Shared gradient `id` → shape vanishes in export. Unique ids only.
2. `file://` asset path → empty slots on other devices. CDN URLs only.
3. Wide raster shape → stretches tall. Use SVG for bars/plates/boxes.
4. Keyframe `t` in ms instead of µs → 1000× wrong timing.
5. Centered text without `textFullWidth:true`/`x:0` → won't center.
6. Plate on top of its text → set the plate's `trackIndex` higher (behind).
