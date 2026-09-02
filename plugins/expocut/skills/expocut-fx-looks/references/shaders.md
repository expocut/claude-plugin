# ExpoCut shaders (list_shaders, 110 entries)

Generated from the live `list_shaders` output, cross-referenced with `list_effects` so you can tell a generative background from a shader transition. Columns: id, name, gallery bucket (the `category` filter of `list_shaders`), preset count (names come from `get_effect_schema { id }`), and whether the shader samples a picked image/video (`acceptsSource`).

How to use each kind:

- Generative background (list_effects category `generative`, 51 ids): `add_generative_bg_layer { effectId, preset, fxParams, startTime, duration }`. It lands at trackIndex 0 (front); add it first or send it back with `reorder_layer { layerId, position: "back" }`. Every background shader has a `transparentBg` param so it can sit over footage instead of replacing it.
- Shader transition (list_effects category `transition`, scope `background`, 58 ids): cover-and-reveal GPU transitions. Use the id with `set_layer_transition { layerId, in: { id, durationSec, preset, shaderParams } }` or on a cut with `set_junction_transition`. Placed as a layer, most of them (see the acceptsSource column) can sample a picked image/video through `set_shader_source`.
- `lightleak` (category `light-leak`): a background-scope shader that plays a CDN leak preset; the simpler route is `add_light_leak_overlay`.


## generative background (51)

| id | name | bucket | presets | acceptsSource |
| --- | --- | --- | --- | --- |
| `aurora` | Aurora | cosmic | 11 | no |
| `plasma` | Plasma | abstract | 10 | no |
| `silk` | Silk | fluid | 10 | no |
| `wavesGen` | Waves | abstract | 10 | no |
| `lightningBg` | Lightning | abstract | 8 | no |
| `galaxy` | Galaxy | cosmic | 8 | no |
| `iridescence` | Iridescence | abstract | 8 | no |
| `liquidchrome` | Liquid Chrome | fluid | 8 | no |
| `prismaticburst` | Prism Burst | light | 8 | no |
| `threads` | Threads | abstract | 8 | no |
| `dither` | Dither | geometric | 7 | no |
| `grainient` | Grainient | abstract | 8 | no |
| `faultyterminal` | Faulty Term | retro | 8 | no |
| `beams` | Beams | light | 8 | no |
| `ripplegrid` | Ripple Grid | geometric | 7 | no |
| `hyperspeed` | Hyperspeed | retro | 8 | no |
| `orb` | Orb | abstract | 8 | no |
| `rainglass` | Rain on Glass | abstract | 4 | no |
| `nebulafield` | Nebula Field | abstract | 4 | no |
| `auroragradient` | Aurora Gradient | abstract | 4 | no |
| `nova` | Nova | abstract | 4 | no |
| `earth` | Earth | abstract | 4 | no |
| `driftsmoke` | Drifting Smoke | abstract | 4 | no |
| `softclouds` | Soft Clouds | abstract | 4 | no |
| `bokehdrift` | Bokeh Drift | abstract | 4 | no |
| `meshgradient` | Mesh Gradient | abstract | 4 | no |
| `liquidflow` | Liquid Flow | abstract | 4 | no |
| `starfield` | Twinkling Stars | abstract | 4 | no |
| `halftonedots` | Halftone Dots | abstract | 4 | no |
| `neonpulse` | Neon Pulse | abstract | 4 | no |
| `squircleflow` | Squircle Flow | abstract | 4 | no |
| `cellveins` | Cell Veins | abstract | 3 | no |
| `flowfield` | Flow Field | abstract | 3 | no |
| `kaleidobloom` | Kaleido Bloom | abstract | 3 | no |
| `glassorb` | Glass Orb | abstract | 4 | no |
| `crystal` | Crystal | abstract | 3 | no |
| `volumetric` | Volumetric Cloud | abstract | 4 | no |
| `godrays` | God Rays | light | 3 | no |
| `atmosphere` | Atmosphere | abstract | 3 | no |
| `waterwave` | Water Waves | fluid | 3 | no |
| `kaleidoscopix` | Kaleidoscope | geometric | 3 | no |
| `lightrays` | Light Rays | light | 3 | no |
| `noxfire` | Nox Fire | fire | 4 | no |
| `truchetkaleido` | Truchet Kaleidoscope | geometric | 4 | no |
| `dunelogo` | Dune Logo | abstract | 4 | no |
| `lensflare` | Lens Flare | light | 5 | no |
| `spotlight` | Spotlight | light | 6 | no |
| `disco` | Disco | retro | 4 | no |
| `emerging` | Emerging | light | 4 | no |
| `blasting` | Blasting | light | 4 | no |
| `tapindicator` | Tap Indicator | abstract | 6 | no |

## shader transition (58)

| id | name | bucket | presets | acceptsSource |
| --- | --- | --- | --- | --- |
| `liquidwipe` | Liquid Wipe | abstract | 5 | yes |
| `inkdissolve` | Ink Dissolve | abstract | 4 | yes |
| `slicewipe` | Slice Wipe | abstract | 4 | yes |
| `tileflip` | Tile Flip | abstract | 4 | yes |
| `mosaicshatter` | Mosaic Shatter | abstract | 4 | yes |
| `radialripple` | Radial Ripple | abstract | 5 | no |
| `barwash` | Bar Wash | abstract | 4 | no |
| `swirlsmoke` | Swirl Smoke | abstract | 4 | no |
| `panelstack` | Panel Stack | abstract | 5 | no |
| `hexcells` | Hex Cells | abstract | 2 | yes |
| `diamondgrid` | Diamond Grid | abstract | 2 | yes |
| `starburstwipe` | Starburst Wipe | abstract | 2 | yes |
| `venetianblinds` | Venetian Blinds | abstract | 2 | yes |
| `spiralwipe` | Spiral Wipe | abstract | 2 | yes |
| `irisbloom` | Iris Bloom | abstract | 2 | yes |
| `rgbsplitstatic` | RGB Split Static | abstract | 2 | yes |
| `scanrollover` | Scan Rollover | abstract | 2 | yes |
| `blockdisplace` | Block Displace | abstract | 2 | yes |
| `dataglitchbars` | Data Glitch Bars | abstract | 2 | yes |
| `pixelsortwipe` | Pixel Sort Wipe | abstract | 2 | yes |
| `noiseburst` | Noise Burst | abstract | 2 | yes |
| `inkbloom` | Ink Bloom | abstract | 2 | yes |
| `paintdrip` | Paint Drip | abstract | 2 | yes |
| `dropletsplash` | Droplet Splash | abstract | 2 | yes |
| `lavamelt` | Lava Melt | abstract | 2 | yes |
| `marbleswirl` | Marble Swirl | abstract | 2 | yes |
| `fogcreep` | Fog Creep | abstract | 2 | yes |
| `glassshatter` | Glass Shatter | abstract | 2 | yes |
| `confettiburst` | Confetti Burst | abstract | 2 | yes |
| `sandscatter` | Sand Scatter | abstract | 2 | yes |
| `sparkdissolve` | Spark Dissolve | abstract | 2 | yes |
| `shardburst` | Shard Burst | abstract | 2 | yes |
| `starfieldwarp` | Starfield Warp | abstract | 2 | yes |
| `lensflarewipe` | Lens Flare Wipe | abstract | 2 | yes |
| `prismsplit` | Prism Split | abstract | 2 | yes |
| `sunrayburst` | Sun Ray Burst | abstract | 2 | yes |
| `lightstreak` | Light Streak | abstract | 2 | yes |
| `bokehblurwipe` | Bokeh Blur Wipe | abstract | 2 | yes |
| `godraywipe` | God Ray Wipe | abstract | 2 | yes |
| `paperfold` | Paper Fold | abstract | 2 | yes |
| `fabricripple` | Fabric Ripple | abstract | 2 | yes |
| `leafscatter` | Leaf Scatter | abstract | 2 | yes |
| `frostbloom` | Frost Bloom | abstract | 2 | yes |
| `firesweep` | Fire Sweep | abstract | 2 | yes |
| `cloudwash` | Cloud Wash | abstract | 2 | yes |
| `whippan` | Whip Pan | abstract | 0 | yes |
| `crosszoom` | Cross Zoom | abstract | 0 | yes |
| `spinblur` | Spin Blur | abstract | 0 | yes |
| `chromaflash` | Chroma Flash | abstract | 0 | yes |
| `filmburn` | Film Burn | abstract | 0 | yes |
| `glowfade` | Glow Fade | abstract | 0 | yes |
| `rackfocus` | Rack Defocus | abstract | 0 | yes |
| `anamorphic` | Anamorphic Sweep | abstract | 0 | yes |
| `heartmask` | Heart Wipe | abstract | 0 | yes |
| `starmask` | Star Wipe | abstract | 0 | yes |
| `clocksweep` | Clock Sweep | abstract | 0 | yes |
| `polkadots` | Polka Dots | abstract | 0 | yes |
| `barndoors` | Barn Doors | abstract | 0 | yes |

## light-leak (1)

| id | name | bucket | presets | acceptsSource |
| --- | --- | --- | --- | --- |
| `lightleak` | Light Leak | abstract | 0 | no |


## Bucket counts

- abstract: 89
- light: 8
- geometric: 4
- fluid: 3
- retro: 3
- cosmic: 2
- fire: 1

Most shaders fall into the `abstract` bucket, so `list_shaders { category }` is only a useful filter for the handful tagged fluid / fire / light / cosmic / geometric / retro. Real preset names you can quote: aurora has Northern Lights, Cyberpunk Sunset, Soft Pastel, Vaporwave Dream, Forest Mist, Lava Glow, Arctic Veil, Sakura Bloom, Cosmic Berry, Toxic Spill, Midnight Reef; liquidchrome has Mercury, Acid, Liquid Gold, Rose Foil, Obsidian, Aqua Slick, Lavender Pour, Burnt Copper; galaxy has Milky Way, Andromeda, Sombrero, Pinwheel, Whirlpool, Cigar, Pillars, Cartwheel; iridescence has Default, Subtle, Bubblegum, Petrol, Holo Foil, Lime Glaze, Honey Drop, Cosmic Indigo.

