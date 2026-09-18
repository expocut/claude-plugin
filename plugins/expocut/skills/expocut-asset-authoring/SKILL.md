---
name: expocut-asset-authoring
description: "Register custom assets in ExpoCut through the MCP asset-authoring tools - declarative FxSpec effects (fx_dry_run, fx_register_spec, fx_compose_from_template), custom 3D LUTs from .cube text (lut_register_custom, lut_list_custom, lut_delete_custom), reusable border presets (border_register_preset), custom mask shapes (mask_register_shape), plus the light-leak overlay and fade-on-edge setters in the same families. Covers the guard rails: the Settings tier (Off / Safe / Standard / Full), quotas and rate limits, the ai.<slug> id rule, persist versus in-memory, the audit log, and which registered assets render today. Use for \"register this LUT\", \"save this .cube\", \"reusable border\", \"custom mask shape\", \"author a new effect\", \"dry-run this FxSpec\", \"why does authoring say PermissionDenied\", \"clean up the assets you made\". Do not use for applying looks (expocut-fx-looks), grading (expocut-color-grading), or mask animation (expocut-compositing, expocut-motion-graphics)."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# Custom asset authoring with ExpoCut

You are the asset registrar. These tools never touch the timeline; they add named assets (an effect spec, a LUT, a border preset, a mask shape) to the user's phone so other tools can reference them. Registration is cheap but rate-limited and quota'd, `persist: true` writes files to the phone, and every call is logged to an audit trail the user can read. Register only what the catalog cannot give you, and delete what you no longer need.

## When to author versus use the catalog

Use the catalog first; it is larger than most requests need:

- Effects: `list_effects {}` has 224 ids and every engine has named presets (`expocut-fx-looks`).
- LUTs: six built-ins (`warm`, `cool`, `cinematic`, `vintage`, `bw`, `noir`), the user's imported and CDN-downloaded LUTs via `lut_list_custom { author: "any" }`, and 134 preset filters (`expocut-color-grading`).
- Borders: `list_border_presets {}` has 12, and `set_layer_border` takes any config inline.
- Masks: `set_layer_mask` ships 14 shapes including `path`.

Author when: the user hands you a `.cube` file or wants a brand look baked from a CDL; you will reuse one border config on many layers across sessions; a silhouette is not among the 14 mask shapes; or you are prototyping a declarative animation curve and want the runtime's samples back. Ask before `persist: true`; in-memory registrations vanish on the next app launch, which is often what a one-off session wants.

## Guard rails (read before the first call)

Every register call runs the same ladder: feature flag, Settings tier, validator, quota and rate limit, then admit and audit. Results are objects, not exceptions: check `ok`, then `error` and `message`.

Tier matrix (Settings, "AI may author assets"; default Off):

| Surface | Off | Safe | Standard | Full |
| --- | --- | --- | --- | --- |
| FX, `renderer: "declarative"` (`fx-declarative`) | no | yes | yes | yes |
| FX, `renderer: "shader"` (`fx-shader`) | no | no | no | yes |
| LUT from `cubeText` (`lut-cube`) | no | no | yes | yes |
| LUT from `grade` (`lut-grade`) | no | yes | yes | yes |
| Border preset (`border`) | no | yes | yes | yes |
| Mask `rect` / `ellipse` (`mask-simple`) | no | yes | yes | yes |
| Mask `polygon` / `path` (`mask-path`) | no | no | yes | yes |

Quotas: 50 register calls per app session, 10 per rolling minute, and per install at most 256 FX, 64 LUTs, 128 borders, 32 masks. Listing and `fx_dry_run` do not consume quota.

Ids: every asset id must match `^(ai|user)\.[a-z0-9-]{1,48}$`; use `ai.` for ids you mint (`ai.brand-teal`, `ai.soft-pulse`). Uppercase, spaces, underscores and dots after the prefix are rejected with `InvalidId`.

Error codes you will see in `error`: `Disabled` (compile flag), `PermissionDenied` (tier too low), `InvalidId`, `InvalidSpec`, `AlreadyExists` (FX only; pass `overwriteIfExists: true`), `NotFound`, `EvalFailed` (dry-run expression), `ProbeFailed` (shader compile, NaN LUT, empty mask), `PersistFailed`, `DeleteFailed`, `OverQuota`, `RateLimited`.

Persistence: `persist: false` (default) keeps the asset in memory for this app run; `persist: true` writes a JSON file under the app's Documents folder (`customFx/`, `customLuts/`, and the border and mask stores). Delete tools remove the in-memory copy; add `alsoFromDisk: true` to remove the file as well.

Audit: each admit, reject, delete and disabled call appends to an in-memory audit log (last 1024 rows) that the app's AI Operations screen shows, newest first. Tell the user what you registered so the log makes sense to them.

## Before you start

1. Probe the tier without spending quota: `lut_list_custom { author: "any" }` and `fx_list_custom { author: "ai" }`. Both return `ok: false` with an empty list when their surface is off, and `ok: true` with the assets already registered when it is on. Reuse an existing id rather than registering a duplicate.
2. If a register call returns `PermissionDenied`, stop and tell the user which tier the surface needs (table above); the tier is a phone setting you cannot change from MCP. If their build has no such setting, authoring is unavailable there; fall back to applying the same values inline (`set_layer_border`, `set_layer_cdl`, `set_layer_mask`).
3. Have the consumer call ready before registering (which layer, which setter), so you can verify the asset does something and delete it if it does not.

## Families and exact shapes

### FX specs (fx_*)

An FxSpec is a JSON object: `FXVSN: "1.0"`, `id`, `name`, `category` (Animation, Distortion, Stylize, Glitch, Light, Color, Transition, Generator, Custom), `kind` (filter, layer-fx, transition, generator), `renderer` (declarative or shader), optional `author`, `description`, `tags`, `INPUTS`. A declarative spec needs `timeline: { duration: "auto" | seconds, tracks: [...] }`; each track drives one `param` from translateX, translateY (percent of frame), scale, scaleX, scaleY, rotation (degrees), opacity (0..1), hueShift (degrees), saturation, brightness, contrast (multipliers), blur (px), using either `keyframes: [[t, value], ...]` with `t` in 0..1 and an `easing`, or an `expr` string (max 1024 chars). A shader spec needs `shader: { fragment }` (SkSL, max 32 KB) and the Full tier. Full field and expression reference: `references/fxspec.md`.

Minimal declarative example, dry-run first:

```
fx_dry_run { spec: { FXVSN: "1.0", id: "ai.soft-pulse", name: "Soft Pulse", category: "Animation", kind: "layer-fx", renderer: "declarative", timeline: { duration: "auto", tracks: [ { param: "scale", expr: "1 + 0.04 * sin(t * TAU * 2) * intensity", loop: true, loopPeriodSec: 2 }, { param: "opacity", keyframes: [[0, 0], [0.15, 1], [1, 1]], easing: "easeOut" } ] } }, sampleTimes: [0, 0.25, 0.5, 0.75, 1] }
```

The result carries `samples: [{ t, params }]` where `params` is the evaluated result (translateX, translateY, scale, scaleX, scaleY, rotation, opacity, hueShift, saturation, brightness, contrast, blur). Check the curve shape, then register the identical object:

```
fx_register_spec { spec: { ...same spec... }, persist: false }
```

`fx_compose_from_template { templateId, name, id, params, durationMs, persist }` builds a transition spec from a curated family without any shader text. `templateId` is `transition.distortion.<warp|ripple|melt|inkBleed|liquid|twirl|pinch|displace>` or `transition.lightLeak.<warm-sunset|cool-window|prism-rainbow|vintage-orange|neon-magenta|soft-anamorphic>`; `params` are clamped to the family's ranges and each clamp is reported in `warnings`; `durationMs` is 100..8000; `id` is auto-generated (`ai.distortion-warp-xxxxxx`) when omitted.

`fx_list_custom { author, kind, category }` returns up to 50 non-builtin specs. `fx_delete_custom { id, alsoFromDisk }` refuses built-ins.

Status you must tell the user: as of this build, a registered FxSpec is stored, listed and audited, but no timeline setter accepts an `ai.` effect id. `set_layer_effect` validates against the built-in effects registry, and the canvas and encoders render from that registry, so passing an `ai.` id such as `ai.soft-pulse` as the `effectId` of `set_layer_effect` returns Unknown effectId. Treat FX authoring as a staging and validation surface (the dry-run samples are still useful for designing a curve you then express with `keyframe_add`), and prefer catalog effects for anything that has to render today.

### LUTs (lut_*)

`lut_register_custom { id, name, cubeText, persist }` accepts raw Adobe `.cube` text (max 1 MB; `LUT_3D_SIZE` 33 or smaller; 1D LUTs are accepted with a warning and render as a per-channel curve; any NaN rejects with `ProbeFailed`). Needs Standard or Full. The alternative `grade` form (`{ whiteBalance: { temperature, tint }, toneCurve: [[x, y], ...], lift: { lift, gamma, gain } }`) is accepted at Safe, but no canvas or encoder path reads `grade` records, so it will not draw; use `cubeText`. Apply with `set_layer_lut { layerId, id, intensity }` or `apply_global_color_grade { lutId }`; both canvas and export resolve `ai.` cube LUTs.

`lut_list_custom { author }` returns `{ id, name, author, kind }`; user-imported files and CDN downloads appear as `author: "user"`. `lut_delete_custom { id, alsoFromDisk }`.

### Border presets (border_*)

`border_register_preset { id, name, config, persist }` stores a full BorderConfig. Required: `enabled` boolean, `width` 0..200 (px at 1080p), `color` `#RGB`, `#RRGGBB`, `#RRGGBBAA` or `rgba()`, `pattern` solid/dashed/dotted/double, `cornerRadius` 0..1000, `sides: { top, right, bottom, left }` each `{ visible: boolean, width?: number }`. Optional `position` inside/outside/center and `glow: { enabled, mode, color, radius, intensity 0..100, speed, layers, colorStops }`.

`border_list_presets { author }` and `border_delete_preset { id, alsoFromDisk }` manage them. Note that `set_layer_border { presetId }` only knows the 12 built-in presets, so to apply a registered preset you replay its fields: `set_layer_border { layerId, width, color, pattern, cornerRadius, position, sides }` followed by `set_layer_border_glow` for the glow block.

### Mask shapes (mask_*)

`mask_register_shape { id, name, geometry, feather 0..100, invert, persist }` with `geometry` one of `{ kind: "rect" }`, `{ kind: "ellipse", rx, ry }` (each in (0, 1]), `{ kind: "polygon", points: [[x, y], ...] }` (3..256 points in 0..1), or `{ kind: "path", d }` (SVG path data using only M, L, Q, C and Z, max 2048 chars; arcs are rejected). A 64 by 64 bake probe rejects geometry with empty coverage or, for anything but `rect`, fully opaque coverage. `mask_list_custom { author }` and `mask_delete_custom { id, alsoFromDisk }`.

`set_layer_mask` and `create_mask_animation` take only the 14 built-in shape names, so a registered shape is not yet applicable from MCP; for a one-off silhouette use `set_layer_mask { layerId, shape: "path" }` with the same path data through `update_layer` if the built-in path shape covers it, or hand off to `expocut-compositing`.

### Light-leak overlays and fade masks (same families, no registration)

`list_light_leaks { category }` and `add_light_leak_overlay { presetId, startTime, duration, intensity }` place CDN footage on a new track (details in `expocut-fx-looks`). `set_layer_fade_mask { layerId, mode, angle, position, softness, floor, invert, curve }` is the spatial fade-on-edge (`linear` with `angle` 0 = left, 90 = top, 180 = right, 270 = bottom; `radial`; `inset`), and `clear_layer_fade_mask { layerId }` removes it; both are covered in `expocut-compositing`.

## Recipes

Brand LUT from a CDL, applied and verified.

```
bake_cdl_to_cube { cdl: { slope: [1.05, 1.0, 0.95], offset: [-0.01, 0, 0.02], power: [1, 1, 1.02], saturation: 1.1 }, size: 33, title: "Brand Teal" }
lut_register_custom { id: "ai.brand-teal", name: "Brand Teal", cubeText: "<cube text from the previous result>", persist: true }
set_layer_lut { layerId: "video0", id: "ai.brand-teal", intensity: 0.7 }
capture_canvas { timeSec: 2 }
```

Register a user's `.cube` after validating it.

```
parse_cube_lut { text: "<file contents>" }                       // expect kind 3d, size 33 or smaller
lut_register_custom { id: "ai.client-kodak-look", name: "Client Kodak look", cubeText: "<file contents>", persist: true }
lut_list_custom { author: "ai" }
```

Reusable border preset, applied by replaying its fields.

```
border_register_preset { id: "ai.thin-white-frame", name: "Thin white frame", config: { enabled: true, width: 6, color: "#FFFFFF", pattern: "solid", cornerRadius: 12, sides: { top: { visible: true }, right: { visible: true }, bottom: { visible: true }, left: { visible: true } } }, persist: true }
set_layer_border { layerId: "image0", width: 6, color: "#FFFFFF", pattern: "solid", cornerRadius: 12 }
```

Clean up at the end of a session.

```
fx_list_custom { author: "ai" }
fx_delete_custom { id: "ai.soft-pulse", alsoFromDisk: true }
lut_delete_custom { id: "ai.brand-teal", alsoFromDisk: true }    // only if the user does not want to keep it
```

## Pitfalls

- Results are `{ ok, id, error, message, warnings }`; a failed register does not throw, so a later `set_layer_lut` with the intended id renders nothing. Always branch on `ok`.
- Id format is strict; the message echoes the regex. `ai.` is for you, `user.` is for ids the user typed.
- `fx_register_spec` without `overwriteIfExists: true` fails with `AlreadyExists` for an id you registered earlier in the session; delete or overwrite deliberately.
- `fx_dry_run` only evaluates declarative specs; a shader spec returns `ok: true` with a warning and is compiled only at register time (64 by 64 probe, 250 ms budget).
- `fx_compose_from_template` needs only the Safe tier but its output is a transition spec; nothing on the timeline accepts it yet (see the FX status above).
- The LUT `grade` form and the FX and mask registries are ahead of the render path; only `cubeText` LUTs are consumed by canvas and export today. Say so instead of promising a result.
- `persist: true` writes to the phone; ask first, and use `alsoFromDisk: true` when the user asks you to remove what you made.
- Rate limit is 10 register calls per minute across all families; batch validation with the list and dry-run tools, which are free.

## Reference

- `references/fxspec.md` - FxSpec fields, categories, kinds, track params, easings, expression variables and functions, INPUT types, template ids and their families.
- https://expocut.com/mcp.html - the full tool list.
- Siblings: `expocut-color-grading` (CDL and LUT usage), `expocut-fx-looks` (catalog effects and presets), `expocut-compositing` (masks, fade masks), `expocut-motion-graphics` (keyframes when a custom curve must render today).
