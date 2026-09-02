# ExpoCut effects catalog (list_effects, 224 entries)

Generated from the live `list_effects` output. Columns: id (pass as `effectId`), name, scope, param keys (ranges and defaults come from `get_effect_schema { id }`), preset count. Read this when you need an effect id without calling `list_effects`; still call `get_effect_schema { id }` before writing `fxParams` or `params`.

Which setter takes the id depends on `scope`:

- scope `layer` (entrance / exit / motion / style / glitch / text / sticker): `set_layer_effect { layerId, effectId, params }` on an existing layer. Params are usually `speed` and `intensity` (0..100).
- scope `filter`: `set_layer_shader_filter { layerId, effectId, preset, fxParams, append }` on an image or video layer. `add_procedural_filter_layer { effectId }` accepts the same ids as a standalone layer, but that layer type does not composite what is beneath it (see SKILL.md pitfalls).
- scope `background`: `add_generative_bg_layer { effectId, preset, fxParams }`; also listed by `list_shaders`. The 58 `transition`-category ids in this scope are shader transitions: use them with `set_layer_transition` or `set_junction_transition`, whose ids come from `list_transitions`.
- scope `transition` (four ids: pixeltransition, lightningflash, lightraysflash, glaresweep): internal transition effects. They are not in `list_transitions` and no MCP setter targets them; leave them alone.


## entrance (17) — scope: layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `typewriter` | Typewriter | layer | speed, intensity | 0 |
| `fadeIn` | Fade In | layer | speed, intensity | 0 |
| `blurIn` | Blur In | layer | speed, intensity | 0 |
| `popIn` | Pop In | layer | speed, intensity | 0 |
| `slideL` | Slide L | layer | speed, intensity | 0 |
| `slideR` | Slide R | layer | speed, intensity | 0 |
| `slideUp` | Slide Up | layer | speed, intensity | 0 |
| `slideDn` | Slide Dn | layer | speed, intensity | 0 |
| `zoomIn` | Zoom In | layer | speed, intensity | 0 |
| `rise` | Rise | layer | speed, intensity | 0 |
| `drop` | Drop | layer | speed, intensity | 0 |
| `backInUp` | Back In Up | layer | speed, intensity | 0 |
| `rollIn` | Roll In | layer | speed, intensity | 0 |
| `swirlIn` | Swirl In | layer | speed, intensity | 0 |
| `puffIn` | Puff In | layer | speed, intensity | 0 |
| `bounceIn` | Bounce In | layer | speed, intensity | 0 |
| `springEntrance` | Spring | layer | preset, x1, y1, x2, y2, easeReadout, stiffness, damping, mass, buttonSize, borderRadius | 4 |

## exit (9) — scope: layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `fadeOut` | Fade Out | layer | speed, intensity | 0 |
| `zoomOut` | Zoom Out | layer | speed, intensity | 0 |
| `slowOut` | Slow Out | layer | speed, intensity | 0 |
| `fall` | Fall | layer | speed, intensity | 0 |
| `rollOut` | Roll Out | layer | speed, intensity | 0 |
| `puffOut` | Puff Out | layer | speed, intensity | 0 |
| `swirlOut` | Swirl Out | layer | speed, intensity | 0 |
| `sinkDown` | Sink Down | layer | speed, intensity | 0 |
| `shrinkOut` | Shrink Out | layer | speed, intensity | 0 |

## motion (31) — scope: layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `shake` | Shake | layer | speed, intensity | 0 |
| `pulse` | Pulse | layer | speed, intensity | 0 |
| `wave` | Wave | layer | speed, intensity | 0 |
| `bounce` | Bounce | layer | speed, intensity | 0 |
| `spin` | Spin | layer | speed, intensity | 0 |
| `flip` | Flip | layer | speed, intensity | 0 |
| `heartbeat` | Heartbeat | layer | speed, intensity | 0 |
| `breathe` | Breathe | layer | speed, intensity | 0 |
| `hover` | Hover | layer | speed, intensity | 0 |
| `float` | Float | layer | speed, intensity | 0 |
| `drift` | Drift | layer | speed, intensity | 0 |
| `tilt` | Tilt | layer | speed, intensity | 0 |
| `wobble` | Wobble | layer | speed, intensity | 0 |
| `jelly` | Jelly | layer | speed, intensity | 0 |
| `rubber` | Rubber | layer | speed, intensity | 0 |
| `slowZoom` | Slow Zoom | layer | speed, intensity | 0 |
| `orbit` | Orbit | layer | speed, intensity | 0 |
| `sway` | Sway | layer | speed, intensity | 0 |
| `bob` | Bob | layer | speed, intensity | 0 |
| `pendulum` | Pendulum | layer | speed, intensity | 0 |
| `panZoom` | Pan Zoom | layer | speed, intensity | 0 |
| `pushIn` | Push In | layer | speed, intensity | 0 |
| `pullOut` | Pull Out | layer | speed, intensity | 0 |
| `tada` | Tada | layer | speed, intensity | 0 |
| `wiggle` | Wiggle | layer | speed, intensity | 0 |
| `headShake` | Head Shake | layer | speed, intensity | 0 |
| `rock` | Rock | layer | speed, intensity | 0 |
| `buzz` | Buzz | layer | speed, intensity | 0 |
| `metronome` | Metronome | layer | speed, intensity | 0 |
| `ping` | Ping | layer | speed, intensity | 0 |
| `tickTock` | Tick Tock | layer | speed, intensity | 0 |

## style (3) — scope: filter, layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `neonGlow` | Neon Glow | layer | speed, intensity | 0 |
| `twinkle` | Twinkle | layer | speed, intensity | 0 |
| `cinematicbars` | Cinematic Bars | filter | edgeDirection, speed, coverage, barColor, reverse, loop | 6 |

## glitch (3) — scope: layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `glitch` | Glitch | layer | speed, intensity | 0 |
| `rgbSplit` | RGB Split | layer | speed, intensity | 0 |
| `flicker` | Flicker | layer | speed, intensity | 0 |

## text (8) — scope: filter, layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `splitText` | Split Text | layer | splitBy, direction, distance, opacity, stagger, x1, y1, x2, y2 | 9 |
| `fallingText` | Falling | layer | distance, gravity, bounce, stagger | 7 |
| `rotatingText` | Rotating | layer | startAngle, endAngle, pivot, stagger | 7 |
| `circularText` | Circular | layer | radius, startAngle, arc, direction, rotateSpeed | 7 |
| `countUp` | Count Up | layer | from, to, decimals, separator | 2 |
| `shinyText` | Shiny | filter | baseColor, shineColor, speed, width, angle | 2 |
| `glitchText` | Glitch | filter | speed, amount, rgbSplit, rows | 2 |
| `gradientText` | Gradient | filter | color1, color2, angle, animate | 2 |

## sticker (8) — scope: layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `stickerPeel` | Peel | layer | corner, angle, lift, stiffness, damping, mass | 2 |
| `logoLoop` | Logo Loop | layer | scaleAmplitude, rotateAmplitude, frequency, shape | 2 |
| `orbitImages` | Orbit | layer | radius, speed, startAngle, direction, faceCenter | 2 |
| `fadeContent` | Fade Content | layer | startOpacity, endOpacity | 2 |
| `gradualBlur` | Gradual Blur | layer | startBlur, endBlur, startOpacity | 2 |
| `tiltedCard` | Tilted | layer | tiltX, tiltY, shineIntensity, animate, idleSpeed | 2 |
| `bounceCards` | Bounce Cards | layer | distance, direction, stagger, stiffness, damping, mass | 2 |
| `spotlightCard` | Spotlight | layer | spotColor, spotSize, softness, speed, path | 2 |

## filter (30) — scope: filter

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `griddistortion` | Grid Distort | filter | speed, strength, scale | 8 |
| `noisefilter` | Noise | filter | intensity | 8 |
| `ditherfilter` | Dither | filter | levels, scale | 7 |
| `grainientfilter` | Grainient | filter | tint1, tint2, strength, grain | 8 |
| `shapeblur` | Shape Blur | filter | radius, center | 7 |
| `metallicpaint` | Metallic | filter | highlightColor, shadowColor, speed, strength | 8 |
| `gaussianblur` | Gaussian Blur | filter | sigma | 3 |
| `phonemockup` | Phone Mockup Reveal | filter | bgTop, bgBottom, phoneColor, revealDuration, phoneHeight, tiltY, tiltX, entrance, glareIntensity, glowIntensity, notch, clay | 12 |
| `vcrdistortion` | VCR Distortion | filter | intensity, aberration, scanlines, grain, jitter, speed | 4 |
| `halftone` | Halftone Print | filter | inkColor, paperColor, dotSize, angle, contrast, intensity | 5 |
| `vignette` | Vignette | filter | tint, amount, radius, softness, roundness | 5 |
| `oldfilm` | Old Film | filter | toneColor, tone, grain, scratches, flicker, speed | 5 |
| `colorgrade` | Color Grade | filter | temperature, tintMagenta, exposure, contrast, saturation, lift, gamma, gain | 24 |
| `cinematicgrade` | Cinematic Grade | filter | temperature, exposure, contrast, saturation, vibrance, shadowColor, highlightColor, splitStrength, skinProtect, halation, grain, intensity | 12 |
| `warp` | Warp | filter | mode, amount, speed, intensity | 14 |
| `retrodisplay` | Retro Display | filter | mode, amount, speed, intensity | 11 |
| `edgesketch` | Edge & Sketch | filter | mode, amount, intensity | 10 |
| `lightfx` | Light FX | filter | mode, amount, speed, intensity | 11 |
| `cartoon` | Cartoon | filter | mode, amount, intensity | 10 |
| `lightflicker` | Light Flicker | filter | mode, amount, speed, intensity | 11 |
| `pixelate` | Pixelate | filter | cellSize, levels, intensity | 6 |
| `edgedetect` | Edge Detect | filter | lineColor, bgColor, thickness, threshold, intensity | 5 |
| `duotone` | Duotone | filter | shadowColor, highlightColor, contrast, intensity | 6 |
| `chromaticaberration` | Chromatic Aberration | filter | amount, falloff, rotation | 5 |
| `glitchrgb` | Glitch RGB | filter | amount, rate, density, speed | 5 |
| `noir` | Noir | filter | toneTint, blacks, midContrast, whites, tone | 5 |
| `bloomglow` | Bloom Glow | filter | threshold, radius, intensity, softness | 5 |
| `crosshatch` | Cross-hatch | filter | inkColor, paperColor, density, thickness, intensity | 5 |
| `halation` | Halation | filter | threshold, radius, intensity, softness, haloTint | 5 |
| `gateweave` | Gate Weave | filter | amount, speed, rotation, flicker | 5 |

## generative (51) — scope: background

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `aurora` | Aurora | background | colorStops, amplitude, blend, speed | 11 |
| `plasma` | Plasma | background | color, speed, scale, opacity | 10 |
| `silk` | Silk | background | color, speed, scale | 10 |
| `wavesGen` | Waves | background | color1, color2, speed, frequency, amplitude | 10 |
| `lightningBg` | Lightning | background | color, speed, intensity, branches | 8 |
| `galaxy` | Galaxy | background | coreColor, armColor, density, rotationSpeed, twinkleIntensity | 8 |
| `iridescence` | Iridescence | background | color, speed, amplitude | 8 |
| `liquidchrome` | Liquid Chrome | background | color, speed, scale | 8 |
| `prismaticburst` | Prism Burst | background | color, speed, intensity, rays | 8 |
| `threads` | Threads | background | color, speed, density, thickness | 8 |
| `dither` | Dither | background | color1, color2, speed, scale | 7 |
| `grainient` | Grainient | background | color1, color2, grain, speed | 8 |
| `faultyterminal` | Faulty Term | background | color, speed, scanlines, glitch | 8 |
| `beams` | Beams | background | color, speed, count, angle | 8 |
| `ripplegrid` | Ripple Grid | background | color, speed, gridSize, rippleAmplitude | 7 |
| `hyperspeed` | Hyperspeed | background | color, speed, density | 8 |
| `orb` | Orb | background | color, speed, radius, glow | 8 |
| `rainglass` | Rain on Glass | background | transparentBg, tint, density, speed, fog, opacity | 4 |
| `nebulafield` | Nebula Field | background | transparentBg, tint, speed, zoom, brightness, saturation, opacity | 4 |
| `auroragradient` | Aurora Gradient | background | transparentBg, lightMode, speed, colorAmount, colorSpeed, opacity | 4 |
| `nova` | Nova | background | transparentBg, coreColor, surfaceColor, haloColor, bgColor, speed, scale, turbulence, brightness, contrast, saturation, opacity | 4 |
| `earth` | Earth | background | transparentBg, oceanColor, landColor, atmoColor, speed, tilt, glow, opacity | 4 |
| `driftsmoke` | Drifting Smoke | background | transparentBg, color1, color2, speed, scale, opacity | 4 |
| `softclouds` | Soft Clouds | background | transparentBg, skyTop, skyBottom, cloudColor, speed, coverage, opacity | 4 |
| `bokehdrift` | Bokeh Drift | background | transparentBg, tint, speed, density, opacity | 4 |
| `meshgradient` | Mesh Gradient | background | transparentBg, c1, c2, c3, c4, speed, opacity | 4 |
| `liquidflow` | Liquid Flow | background | transparentBg, speed, scale, hueShift, saturation, opacity | 4 |
| `starfield` | Twinkling Stars | background | transparentBg, tint, speed, density, opacity | 4 |
| `halftonedots` | Halftone Dots | background | transparentBg, dotColor, bgColor, speed, scale, opacity | 4 |
| `neonpulse` | Neon Pulse | background | transparentBg, tint, speed, barCount, opacity | 4 |
| `squircleflow` | Squircle Flow | background | transparentBg, color1, color2, speed, opacity | 4 |
| `cellveins` | Cell Veins | background | transparentBg, color1, color2, speed, scale, opacity | 3 |
| `flowfield` | Flow Field | background | transparentBg, color1, color2, speed, scale, opacity | 3 |
| `kaleidobloom` | Kaleido Bloom | background | transparentBg, speed, reps, hueShift, opacity | 3 |
| `glassorb` | Glass Orb | background | transparentBg, colorA, colorB, speed, zoom, opacity | 4 |
| `crystal` | Crystal | background | transparentBg, colorA, colorB, bgColor, speed, zoom, opacity | 3 |
| `volumetric` | Volumetric Cloud | background | transparentBg, sunColor, cloudColor, skyColor, speed, density, opacity | 4 |
| `godrays` | God Rays | background | transparentBg, lightColor, bgColor, speed, scale, brightness, opacity | 3 |
| `atmosphere` | Atmosphere | background | transparentBg, skyTop, skyHorizon, sunColor, sunY, haze, opacity | 3 |
| `waterwave` | Water Waves | background | transparentBg, deepColor, shallowColor, lightColor, speed, scale, brightness, opacity | 3 |
| `kaleidoscopix` | Kaleidoscope | background | transparentBg, reps, zoom, speed, hueShift, opacity | 3 |
| `lightrays` | Light Rays | background | transparentBg, lightColor, bgColor, speed, scale, brightness, opacity | 3 |
| `noxfire` | Nox Fire | background | transparentBg, tint, speed, turbulence, detail, density, brightness, opacity | 4 |
| `truchetkaleido` | Truchet Kaleidoscope | background | transparentBg, tint, speed, intensity, opacity | 4 |
| `dunelogo` | Dune Logo | background | transparentBg, tint, intensity, opacity | 4 |
| `lensflare` | Lens Flare | background | transparentBg, flareColor, streakColor, positionX, positionY, size, streak, starBurst, speed, intensity, opacity | 5 |
| `spotlight` | Spotlight | background | transparentBg, beamColor, positionX, beamWidth, poolSize, intensity, speed, opacity | 6 |
| `disco` | Disco | background | transparentBg, beamCount, colorSpeed, strobeSpeed, intensity, speed, opacity | 4 |
| `emerging` | Emerging | background | transparentBg, hue, ringCount, speed, intensity, opacity | 4 |
| `blasting` | Blasting | background | transparentBg, hue, rayCount, burstSpeed, speed, intensity, opacity | 4 |
| `tapindicator` | Tap Indicator | background | transparentBg, ringColor, speed, maxRadius, dotSize, opacity | 6 |

## transition (62) — scope: background, transition

| id | name | scope | params | presets | in list_transitions |
| --- | --- | --- | --- | --- | --- |
| `pixeltransition` | Pixel | transition | gridSize | 7 | no |
| `lightningflash` | Lightning | transition | flashColor | 5 | no |
| `lightraysflash` | Light Rays | transition | flashColor, rays | 6 | no |
| `glaresweep` | Glare Sweep | transition | glareColor, angle, softness | 7 | no |
| `liquidwipe` | Liquid Wipe | background | transparentBg, revealOnly, useTexture, fillColors, rimColors, duration, angle, waviness, rimWidth, opacity | 5 | yes |
| `inkdissolve` | Ink Dissolve | background | transparentBg, revealOnly, useTexture, inkColors, duration, scale, softness, edgeDark, opacity | 4 | yes |
| `slicewipe` | Slice Wipe | background | transparentBg, revealOnly, useTexture, fillColors, duration, angle, bands, stagger, streaks, opacity | 4 | yes |
| `tileflip` | Tile Flip | background | transparentBg, revealOnly, useTexture, fillColors, duration, cols, stagger, shading, opacity | 4 | yes |
| `mosaicshatter` | Mosaic Shatter | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, tiles, opacity | 4 | yes |
| `radialripple` | Radial Ripple | background | transparentBg, fillColors, rimColors, duration, bands, rimWidth, centerX, centerY, opacity | 5 | yes |
| `barwash` | Bar Wash | background | transparentBg, barColors, washColors, duration, bars, angle, marble, opacity | 4 | yes |
| `swirlsmoke` | Swirl Smoke | background | transparentBg, smokeColors, duration, swirl, scale, softness, opacity | 4 | yes |
| `panelstack` | Panel Stack | background | transparentBg, fillColors, duration, panels, stagger, shadowDark, angle, opacity | 5 | yes |
| `hexcells` | Hex Cells | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, hexCount, opacity | 2 | yes |
| `diamondgrid` | Diamond Grid | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, gridCount, opacity | 2 | yes |
| `starburstwipe` | Starburst Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, points, opacity | 2 | yes |
| `venetianblinds` | Venetian Blinds | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, bladeCount, stagger, opacity | 2 | yes |
| `spiralwipe` | Spiral Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, turns, opacity | 2 | yes |
| `irisbloom` | Iris Bloom | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, petals, petalAmt, opacity | 2 | yes |
| `rgbsplitstatic` | RGB Split Static | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, rows, opacity | 2 | yes |
| `scanrollover` | Scan Rollover | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, jitterAmt, opacity | 2 | yes |
| `blockdisplace` | Block Displace | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, blocks, opacity | 2 | yes |
| `dataglitchbars` | Data Glitch Bars | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, bars, barFreq, opacity | 2 | yes |
| `pixelsortwipe` | Pixel Sort Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, sortFreq, opacity | 2 | yes |
| `noiseburst` | Noise Burst | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, opacity | 2 | yes |
| `inkbloom` | Ink Bloom | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, bloomFreq, opacity | 2 | yes |
| `paintdrip` | Paint Drip | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, columns, opacity | 2 | yes |
| `dropletsplash` | Droplet Splash | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, opacity | 2 | yes |
| `lavamelt` | Lava Melt | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, meltFreq, opacity | 2 | yes |
| `marbleswirl` | Marble Swirl | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, twist, veinFreq, opacity | 2 | yes |
| `fogcreep` | Fog Creep | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, fogFreq, opacity | 2 | yes |
| `glassshatter` | Glass Shatter | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, shards, opacity | 2 | yes |
| `confettiburst` | Confetti Burst | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, pieces, opacity | 2 | yes |
| `sandscatter` | Sand Scatter | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, grainScale, opacity | 2 | yes |
| `sparkdissolve` | Spark Dissolve | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, opacity | 2 | yes |
| `shardburst` | Shard Burst | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, wedges, opacity | 2 | yes |
| `starfieldwarp` | Starfield Warp | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, streaks, opacity | 2 | yes |
| `lensflarewipe` | Lens Flare Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, flareAngle, opacity | 2 | yes |
| `prismsplit` | Prism Split | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, prismAngle, opacity | 2 | yes |
| `sunrayburst` | Sun Ray Burst | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, rayCount, opacity | 2 | yes |
| `lightstreak` | Light Streak | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, streakRows, opacity | 2 | yes |
| `bokehblurwipe` | Bokeh Blur Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, bokehDensity, opacity | 2 | yes |
| `godraywipe` | God Ray Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, shaftSpread, opacity | 2 | yes |
| `paperfold` | Paper Fold | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, folds, opacity | 2 | yes |
| `fabricripple` | Fabric Ripple | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, weave, opacity | 2 | yes |
| `leafscatter` | Leaf Scatter | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, leaves, opacity | 2 | yes |
| `frostbloom` | Frost Bloom | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, frostScale, opacity | 2 | yes |
| `firesweep` | Fire Sweep | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, fireFreq, opacity | 2 | yes |
| `cloudwash` | Cloud Wash | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, cloudFreq, opacity | 2 | yes |
| `whippan` | Whip Pan | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, streakFreq, startAlpha, opacity | 0 | yes |
| `crosszoom` | Cross Zoom | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, rayFreq, flash, startAlpha, opacity | 0 | yes |
| `spinblur` | Spin Blur | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, streakFreq, spin, startAlpha, opacity | 0 | yes |
| `chromaflash` | Chroma Flash | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, rayFreq, split, startAlpha, opacity | 0 | yes |
| `filmburn` | Film Burn | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, burnFreq, startAlpha, opacity | 0 | yes |
| `glowfade` | Glow Fade | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, glowFreq, startAlpha, opacity | 0 | yes |
| `rackfocus` | Rack Defocus | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, bokehCount, startAlpha, opacity | 0 | yes |
| `anamorphic` | Anamorphic Sweep | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, flareBoost, startAlpha, opacity | 0 | yes |
| `heartmask` | Heart Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, startAlpha, opacity | 0 | yes |
| `starmask` | Star Wipe | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, points, startAlpha, opacity | 0 | yes |
| `clocksweep` | Clock Sweep | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, startAlpha, opacity | 0 | yes |
| `polkadots` | Polka Dots | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, dotCount, startAlpha, opacity | 0 | yes |
| `barndoors` | Barn Doors | background | transparentBg, revealOnly, useTexture, colorA, colorB, duration, startAlpha, opacity | 0 | yes |

## light-leak (1) — scope: background

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `lightleak` | Light Leak | background | presetId, intensity, blendHint | 0 |

## none (1) — scope: layer

| id | name | scope | params | presets |
| --- | --- | --- | --- | --- |
| `none` | None | layer | — | 0 |


# Video effects (list_video_effects, 77 entries)

Apply with `set_layer_video_effects { layerId, effects: [{ effectId, intensity }] }`. `intensity` is 0..100 here (not 0..1). The array replaces the whole chain; pass `[]` to clear. Unknown ids throw.


## Film (12)

| id | name | description |
| --- | --- | --- |
| `vintage` | Vintage | Warm, faded retro look with reduced contrast and gentle vignette |
| `noir` | Noir | Classic black and white with high contrast for a timeless look |
| `cinematic` | Cinematic | Film-like color grading with teal & orange split-tone and soft vignette |
| `sepia` | Sepia | Classic sepia tone for an aged, antique photograph look |
| `chrome` | Chrome | High-contrast chrome effect with saturated highlights |
| `instant` | Instant | Polaroid-style instant film with warm tones and soft contrast |
| `process` | Process | Cross-processed film look with shifted colours and high saturation |
| `transfer` | Transfer | Warm transfer print effect with muted highlights |
| `fade` | Fade | Lifted blacks for a soft, faded film look with gentle exposure boost |
| `super8` | Super 8 | 1960s home movie look with grain feel, warm cast and vignette |
| `kodak` | Kodak Warm | Kodak Portra-inspired warm skin tones with soft contrast |
| `fuji` | Fuji Cool | Fujifilm-inspired cool greens and blues with crisp contrast |

## Color (17)

| id | name | description |
| --- | --- | --- |
| `warm` | Warm | Golden hour warmth with enhanced oranges and soft saturation boost |
| `cool` | Cool | Blue-tinted cool tones for a crisp, winter morning look |
| `vivid` | Vivid | Punchy, saturated colours that pop with slight contrast boost |
| `muted` | Muted | Soft, desaturated tones for a subtle, editorial look |
| `monochrome` | Mono | Pure black and white without any colour cast |
| `posterize` | Posterize | Reduced colour palette for a bold poster art style |
| `invert` | Invert | Negative image — inverts all colour channels |
| `tealOrange` | Teal & Orange | Hollywood-standard complementary teal shadows and orange highlights |
| `duotone-blue-pink` | Duotone Blue/Pink | Blue shadows + pink highlights synthwave look. |
| `duotone-orange-teal` | Duotone Orange/Teal | Cinema teal shadows + orange highlights. |
| `cyberpunk` | Cyberpunk | Neon magenta + cyan tone. |
| `synthwave` | Synthwave | Magenta+cyan retrofuturist tone. |
| `infrared` | Infrared | False-colour infrared look (red foliage, dark sky). |
| `thermal` | Thermal | Heat-vision style false-colour gradient. |
| `xray` | X-Ray | Inverted monochrome with high contrast. |
| `deep-purple` | Deep Purple | Purple-tinted monochrome. |
| `amber-glow` | Amber Glow | Warm amber wash. |

## Mood (6)

| id | name | description |
| --- | --- | --- |
| `dramatic` | Dramatic | High contrast with deep, crushed shadows and bright highlights |
| `dreamy` | Dreamy | Soft, ethereal look with reduced contrast and warm glow |
| `melancholy` | Melancholy | Desaturated cool tones with lowered contrast for a somber feel |
| `horror` | Horror | Dark, desaturated look with heavy vignette and green-blue tint |
| `romance` | Romance | Soft warm glow with slightly boosted pinks and gentle bloom |
| `tension` | Tension | High contrast with cold tint — ideal for thriller/action sequences |

## Stylize (14)

| id | name | description |
| --- | --- | --- |
| `comic` | Comic | Bold, posterized look with edge emphasis for a comic book style |
| `sketch` | Sketch | Pencil sketch effect — edges emphasized with reduced fill |
| `pixelate` | Pixelate | Retro pixel mosaic effect |
| `edges` | Edges | Edge detection highlighting outlines and contours |
| `crystallize` | Crystal | Crystallized mosaic breaking the image into geometric shards |
| `pointillize` | Pointillize | Impressionist dot-painting style |
| `dot-screen` | Dot Screen | Halftone dot pattern like newspaper print. |
| `line-screen` | Line Screen | Horizontal line halftone. |
| `hatched-screen` | Hatched | Crosshatch screen pattern. |
| `circular-screen` | Circular Screen | Concentric ring halftone. |
| `hex-pixelate` | Hex Pixelate | Hexagonal pixel grid. |
| `parallel-pixelate` | Parallel Pixelate | Square pixel grid (chunky). |
| `crystallize-fine` | Crystal Fine | Fine crystallization (small cells). |
| `pointillize-coarse` | Pointillize Coarse | Bigger pointillism dots. |

## Light (10)

| id | name | description |
| --- | --- | --- |
| `highKey` | High Key | Bright, overexposed look with minimal shadows — airy and clean |
| `lowKey` | Low Key | Dark, moody look with deep shadows — dramatic and intimate |
| `bloom` | Bloom | Soft highlight glow that bleeds into surrounding areas |
| `gloom` | Gloom | Darkened highlights with a gloomy, overcast atmosphere |
| `vignette` | Vignette | Dark edges drawing attention to the centre of the frame |
| `exposure_up` | Brighten | Increase overall exposure by +0.4 EV |
| `exposure_down` | Darken | Decrease overall exposure by -0.4 EV |
| `vignette-strong` | Vignette Strong | Heavy edge darkening for cinematic focus. |
| `bloom-strong` | Bloom Strong | Pronounced highlight bloom — dreamy glow. |
| `gloom-strong` | Gloom Strong | Dark, moody atmosphere. |

## Blur & Focus (4)

| id | name | description |
| --- | --- | --- |
| `gaussianBlur` | Gaussian Blur | Smooth gaussian blur across the entire image |
| `motionBlur` | Motion Blur | Directional motion blur simulating camera movement |
| `zoomBlur` | Zoom Blur | Radial zoom blur emanating from the centre |
| `sharpen` | Sharpen | Increase sharpness and edge definition |

## Distort (14)

| id | name | description |
| --- | --- | --- |
| `twirl` | Twirl | Swirling distortion from the centre of the frame |
| `bump` | Bump | Convex lens bump distortion at the centre |
| `pinch` | Pinch | Pinch/squeeze distortion pulling inward at the centre |
| `stretch` | Stretch | Horizontal stretch distortion at the centre of frame |
| `kaleidoscope-6` | Kaleidoscope 6 | Six-fold radial mirror — classic kaleidoscope. |
| `kaleidoscope-8` | Kaleidoscope 8 | Eight-fold radial mirror — denser kaleidoscope. |
| `triangle-tile` | Triangle Tile | Triangular tile pattern across the frame. |
| `op-tile` | Op Tile | Orthographic kaleidoscopic tile. |
| `mirror-h` | Mirror H | Horizontal mirror — left half mirrored to right. |
| `mirror-v` | Mirror V | Vertical mirror — top half mirrored down. |
| `circular-wrap` | Circular Wrap | Wraps the image around a circle. |
| `vortex` | Vortex | Spiral distortion centered on frame. |
| `hole-distort` | Hole | Pinches the centre into a hole. |
| `glass-distort` | Glass | Frosted-glass refraction. |


# Light leak overlays (list_light_leaks, popular set of 18)

CDN footage overlays (needs network on first use; cached afterwards). Apply with `add_light_leak_overlay { presetId, startTime, duration, intensity }`. `list_light_leaks { category }` lists a whole category; the ids below are the curated popular set, two per category.

| id | name | category | default blend | default intensity | loop ms |
| --- | --- | --- | --- | --- | --- |
| `warm-sunset-01` | Warm Sunset | warm-sunset | screen | 0.85 | 3000 |
| `warm-sunset-11` | Mango Sun | warm-sunset | add | 0.85 | 3000 |
| `cool-window-01` | Cool Window | cool-window | screen | 0.7 | 3500 |
| `cool-window-11` | Powder Sky | cool-window | overlay | 0.7 | 3500 |
| `neon-01` | Neon Magenta | neon | add | 0.75 | 2500 |
| `neon-11` | Neon Chartreuse | neon | screen | 0.75 | 2500 |
| `prism-rainbow-01` | Prism Rainbow | prism-rainbow | add | 0.6 | 3500 |
| `prism-rainbow-11` | Diamond Spectrum | prism-rainbow | softLight | 0.6 | 3500 |
| `soft-anamorphic-01` | Soft Anamorphic | soft-anamorphic | softLight | 0.55 | 4000 |
| `soft-anamorphic-11` | Sepia Flare | soft-anamorphic | softLight | 0.55 | 4000 |
| `vintage-filmburn-01` | Vintage Filmburn | vintage-filmburn | overlay | 0.9 | 3000 |
| `vintage-filmburn-11` | Autumn Burn | vintage-filmburn | softLight | 0.9 | 3000 |
| `cool-bokeh-01` | Midnight Bokeh | cool-bokeh | screen | 0.7 | 2500 |
| `cool-bokeh-11` | Cyan Spark | cool-bokeh | screen | 0.7 | 2500 |
| `sun-flare-01` | Solar Burst | sun-flare | add | 0.7 | 3200 |
| `sun-flare-11` | Sun Kiss | sun-flare | screen | 0.7 | 3200 |
| `prism-edge-01` | Corner Spectrum | prism-edge | add | 0.65 | 3500 |
| `prism-edge-11` | Quartz Bleed | prism-edge | softLight | 0.65 | 3500 |


# Built-in border presets (list_border_presets, 12 entries)

Apply with `set_layer_border { layerId, presetId }`; any other `set_layer_border` arg overrides the preset. Presets that carry a glow (neon-pink, rainbow-glow, breath-cyan, chase-yellow, ocean-sunset, aurora, vapor-wave, mint-neon) keep it; tune it afterwards with `set_layer_border_glow`.

| id | name |
| --- | --- |
| `polaroid` | Polaroid |
| `film-strip` | Film Strip |
| `neon-pink` | Neon Pink |
| `rainbow-glow` | Rainbow |
| `breath-cyan` | Cyan Breathe |
| `chase-yellow` | Chase |
| `dashed-outline` | Dashed |
| `dotted-outline` | Dotted |
| `ocean-sunset` | Ocean Sunset |
| `aurora` | Aurora |
| `vapor-wave` | Vapor |
| `mint-neon` | Mint Neon |
