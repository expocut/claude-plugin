# FxSpec v1.0 reference (for fx_dry_run, fx_register_spec, fx_compose_from_template)

Read this when you are writing a spec object by hand. The shapes below are taken from the app's FxSpec type definitions and validator; anything not listed is rejected with `InvalidSpec`.

## Top-level fields

| field | required | values |
| --- | --- | --- |
| `FXVSN` | yes | the string `"1.0"` |
| `id` | yes | `^(ai|user)\.[a-z0-9-]{1,48}$` for anything you register |
| `name` | yes | display name, max 64 chars |
| `category` | yes | Animation, Distortion, Stylize, Glitch, Light, Color, Transition, Generator, Custom |
| `kind` | yes | filter, layer-fx, transition, generator |
| `renderer` | yes | declarative or shader |
| `author` | no | ai is set for you on register; builtin is reserved |
| `subcategory`, `tags`, `icon`, `description`, `license`, `credits` | no | free text |
| `INPUTS` | no | array of typed inputs (below) |
| `timeline` | declarative only | `{ duration: "auto" | seconds, tracks: [...] }`; `duration: "auto"` binds to the layer's duration |
| `shader` | shader only | `{ fragment: "<SkSL>", vertex?, passes? }`; fragment max 32 KB; Full tier only |

## Timeline tracks

Each track: `{ param, keyframes?, expr?, easing?, additive?, loop?, loopPeriodSec? }`.

- `param` is one of translateX, translateY (percent of frame width / height), scale, scaleX, scaleY (multipliers), rotation (degrees), opacity (0..1, multiplied with layer opacity), hueShift (degrees), saturation, brightness, contrast (multipliers, 1 = neutral), blur (px at output resolution).
- `keyframes` is `[[t, value], ...]` with `t` normalised 0..1; interpolated with `easing`.
- `expr` is a string evaluated every frame; when both are present `expr` wins. Max 1024 characters.
- `easing`: linear, easeIn, easeOut, easeInOut, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInExpo, easeOutExpo, spring, bounce. Default linear.
- `additive: true` adds the track value to the layer's own transform instead of replacing it (use it for translate offsets and wobble; leave it off for opacity).
- `loop: true` wraps time every `loopPeriodSec` (default 2 s divided by the animation speed); `loop: false` normalises time to the layer duration.

## Expression vocabulary

Variables: `t` (0..1 over the duration, or over the loop period), `progress` (t after easing), `timeSec`, `durationSec`, `intensity` (the user's 0..1 slider), `speed`, `loop`, `frame`, and every `INPUTS` NAME. Constants: `PI`, `TAU`, `E`. Functions: sin, cos, tan, asin, acos, atan, atan2, abs, sign, floor, ceil, round, sqrt, exp, log, pow, min, max, clamp(x, lo, hi), mix(a, b, t), lerp, smoothstep, mod, fract.

Examples from the built-in library: `fade-in` is `{ param: "opacity", expr: "progress" }`; `slide-l` is `{ param: "translateX", expr: "(1 - progress) * 100 * intensity", additive: true }`; `bounce` is `{ param: "translateY", expr: "-abs(sin(progress * PI * 3)) * 20 * intensity", additive: true }`.

## INPUTS

Each input: `{ NAME, LABEL?, TYPE, ... }` with TYPE one of event, bool (`DEFAULT`), long (`VALUES`, `LABELS`, `DEFAULT`), float (`MIN`, `MAX`, `DEFAULT`), point2D (`MIN`, `MAX`, `DEFAULT` as `[x, y]`), color (`DEFAULT` as `[r, g, b, a]` in 0..1), image, audio, audioFFT. `NAME` must be a valid identifier; it becomes a variable in `expr`.

## Dry-run result

`fx_dry_run` returns `samples: [{ t, params }]` for each `sampleTimes` entry (default `[0, 0.25, 0.5, 0.75, 1]`, max 33 values in 0..1). `params` starts from the identity `{ translateX: 0, translateY: 0, scale: 1, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, hueShift: 0, saturation: 1, brightness: 1, contrast: 1, blur: 0 }` and applies every track with `intensity: 1`, `speed: 1`, `loop: false`, `durationSec: 1`.

## fx_compose_from_template ids

- `transition.distortion.warp`, `transition.distortion.ripple`, `transition.distortion.melt`, `transition.distortion.inkBleed`, `transition.distortion.liquid`, `transition.distortion.twirl`, `transition.distortion.pinch`, `transition.distortion.displace` - the `params` keys are the family's own (read the `warnings` for clamps); the generated spec is category Distortion, kind transition, with an opacity envelope 0 to 1 to 0 and a `templateRef` block naming the preset and resolved params.
- `transition.lightLeak.warm-sunset`, `transition.lightLeak.cool-window`, `transition.lightLeak.prism-rainbow`, `transition.lightLeak.vintage-orange`, `transition.lightLeak.neon-magenta`, `transition.lightLeak.soft-anamorphic` - only `params.intensity` (0..1) is read; the spec is category Light, kind transition, default 700 ms.

## What renders

Registered specs live in the FxSpec registry (in memory, or on disk when persisted) and show up in `fx_list_custom` and the AI Operations screen. The timeline setters (`set_layer_effect`, `set_layer_transition`, `set_junction_transition`) validate ids against the built-in effect and transition catalogs, so an `ai.` id is rejected there. Use the dry-run samples to design a curve, then express it with `keyframe_add` on the layer if it must render now.
