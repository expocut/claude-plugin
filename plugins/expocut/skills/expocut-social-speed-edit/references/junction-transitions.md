# Junction transition catalog

Read this when you need an `effectId` for `set_junction_transition`. These ids
come from the app's transition catalog (`src/effects/transitionCatalog.ts`), not
from `list_transitions`, and there is no `list_*` tool that returns them. A junction
is the cut between two clips that touch on the same timeline row; find them with
`list_junctions {}` and address one by `fromLayerId` + `toLayerId`.

## How a junction is drawn

| Render mode | Meaning |
| --- | --- |
| cut | Draws nothing. `cut.straight`, `cut.j-cut`, `cut.l-cut` - the J/L audio offset is not retimed by the joiner yet. |
| shader | Two-source GPU program: dissolve, wipe, slide, distort, light families and `cut.flash`. Needs both clips to be sampleable media (video/image). |
| alpha | Per-clip opacity fallback used when a clip is not media (text, shape). Looks like a cross dissolve. |
| shade | Cover-and-reveal single-source shader reused from the Intro/Outro library: covers the outgoing clip, swaps at the midpoint, reveals the incoming clip. |

## Duration rules

- `durationSec` defaults to 1.0 s; the in-app picker defaults per effect are in
  the tables (0.15-1.1 s). Social cuts read best at 0.15-0.5 s.
- Clamp: center alignment = the shorter of the two clips; start = half the
  incoming clip; end = half the outgoing clip; floor 0.1 s. The result reports
  `durationClamped: true` when shortened.
- `alignment` center straddles the cut (Premiere "Center at Cut"), start runs
  into the incoming clip, end runs back through the outgoing clip.
- `ease`: none | in | out | inOut | custom. `reverse: true` plays backwards.
  `endRatio` below 1 leaves the incoming clip partly unresolved on the last frame.

## Family params (`params` object)

Unknown keys are ignored; out-of-range values are clamped. The result's
`resolvedOptions` echoes the clamped values.

| Param | Range / unit | Default | Read by |
| --- | --- | --- | --- |
| `angle` | degrees | 0 (directional effects seed their own direction) | wipe.linear, wipe.clock, wipe.barn-doors, slide.push-*, distort.warp |
| `softness` | 0..1 | 0.06 | wipes (edge feather) |
| `borderWidth` | >= 0 | 0 | wipes |
| `intensity` | 0..2 | 1 | all shader families |
| `blur` | 0..1 | 0 | distort family |
| `blurAniso` | 0..1 (0 even blur, 1 pure streak) | 0 | distort family |
| `blurAngle` | degrees | 0 | distort family |
| `blurStreak` | 0..1 | 0 | distort family (no UI control - MCP only) |
| `gamma` | 0.2..3 | 2.2 | dissolve.film |
| `originX`, `originY` | 0..1 (0.5/0.5 = centre) | 0.5 | wipe.iris |
| `bulge` | 0..1 rim refraction | 0 | wipe.iris |

## Ids by family

### cut

| effectId | Label | Picker default | Notes |
| --- | --- | --- | --- |
| `cut.straight` | Straight Cut | 0 s | draws nothing |
| `cut.flash` | Flash Cut | 0.15 s | hard cut with a white burst (dissolve program) |
| `cut.j-cut` | J-Cut | 0.3 s | draws nothing |
| `cut.l-cut` | L-Cut | 0.3 s | draws nothing |

### dissolve

| effectId | Label | Picker default |
| --- | --- | --- |
| `dissolve.cross` | Cross Dissolve | 0.5 s |
| `dissolve.dip-to-black` | Dip to Black | 0.5 s |
| `dissolve.dip-to-white` | Dip to White | 0.5 s |
| `dissolve.additive` | Additive Dissolve | 0.5 s |
| `dissolve.film` | Film Dissolve (`gamma`) | 0.5 s |

### wipe

| effectId | Label | Picker default |
| --- | --- | --- |
| `wipe.linear` | Linear Wipe (`angle`, `softness`, `borderWidth`) | 0.4 s |
| `wipe.clock` | Clock Wipe | 0.5 s |
| `wipe.iris` | Iris (`originX`, `originY`, `bulge`) | 0.5 s |
| `wipe.barn-doors` | Barn Doors | 0.5 s |
| `wipe.checkerboard` | Checkerboard | 0.6 s |
| `wipe.matrix` | Gradient Wipe | 0.5 s |

### slide

| effectId | Label | Picker default |
| --- | --- | --- |
| `slide.push-left` | Push Left | 0.5 s |
| `slide.push-right` | Push Right | 0.5 s |
| `slide.push-up` | Push Up | 0.5 s |
| `slide.push-down` | Push Down | 0.5 s |
| `slide.zoom` | Zoom Push | 0.5 s |
| `slide.spin` | Spin | 0.5 s |
| `slide.flip` | 3D Flip | 0.6 s |

### distort

| effectId | Label | Picker default |
| --- | --- | --- |
| `distort.warp` | Warp Distort (`blur`, `blurAniso`, `blurAngle`, `blurStreak`) | 0.6 s |
| `distort.ripple` | Ripple Distort | 0.7 s |
| `distort.melt` | Melt | 0.9 s |
| `distort.ink-bleed` | Ink Bleed | 0.8 s |
| `distort.liquid` | Liquid Flow | 1.0 s |
| `distort.twirl` | Twirl | 0.6 s |
| `distort.pinch` | Pinch | 0.5 s |

### light

| effectId | Label | Picker default |
| --- | --- | --- |
| `light.warm-sunset` | Warm Sunset Leak | 0.7 s |
| `light.cool-window` | Cool Window Leak | 0.8 s |
| `light.prism` | Prism Rainbow | 0.9 s |
| `light.film-burn` | Vintage Film Burn | 0.6 s |
| `light.neon` | Neon Magenta | 0.5 s |
| `light.anamorphic` | Anamorphic Streak | 1.1 s |

### shade (cover-and-reveal shaders, picker default 0.8 s)

Prefix any Shader-category id from `list_transitions` with `shade.`; the 58 ids
at the time of writing:

liquidwipe, inkdissolve, slicewipe, tileflip, radialripple, barwash, swirlsmoke,
panelstack, mosaicshatter, hexcells, diamondgrid, starburstwipe, venetianblinds,
spiralwipe, irisbloom, rgbsplitstatic, scanrollover, blockdisplace, dataglitchbars,
pixelsortwipe, noiseburst, inkbloom, paintdrip, dropletsplash, lavamelt,
marbleswirl, fogcreep, glassshatter, confettiburst, sandscatter, sparkdissolve,
shardburst, starfieldwarp, lensflarewipe, prismsplit, sunrayburst, lightstreak,
bokehblurwipe, godraywipe, paperfold, fabricripple, leafscatter, frostbloom,
firesweep, cloudwash, whippan, crosszoom, spinblur, chromaflash, filmburn,
glowfade, rackfocus, anamorphic, heartmask, starmask, clocksweep, polkadots,
barndoors.

So a whip pan on a cut is effectId shade.whippan, while the same look as a clip's
own outro is `set_layer_transition { layerId, out: { id: "whippan", durationSec: 0.4 } }`.

## Social picks

- Momentum between scenes: `slide.push-left` / `slide.push-up` at 0.25 s.
- On a beat drop: `cut.flash` at 0.1 s, or shade.whippan at 0.3 s.
- Punchline smear: `distort.warp` 0.18 s with `{ blur: 0.6, blurAniso: 1, blurAngle: 45 }`.
- Reveal from the action: `wipe.iris` 0.5 s with `{ originX, originY, bulge: 0.5 }`.
- Nostalgia: `light.film-burn` 0.6 s; `dissolve.film` with `gamma: 1.6` for a softer mix.
