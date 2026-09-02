---
name: expocut-motion-graphics
description: "Animate layers in the ExpoCut mobile editor through its MCP server - keyframes on 58 properties (position, scale, rotation, opacity, blur, colour, mask geometry, border, text colour) with hold, linear, bezier and preset easing, 25 motion-path presets (arc, loop, spiral, heart), a project virtual camera with per-layer parallax depth, one-call mask animations, and in/out layer transitions including GPU shader wipes. Use when the user says animate, keyframe, ease, pop in, bounce, overshoot, Ken Burns, push in, parallax, camera move, orbit, follow a path, mask wipe, reveal, spin, wiggle, loop, \"After Effects style\", \"make it move\", logo sting, animated badge, or wants a photo slideshow with motion. Do not use for text animation presets, typewriter or captions (use expocut-kinetic-captions), for cut-to-cut junction transitions, speed ramps or beat cuts (use expocut-social-speed-edit), or for blend modes, track mattes, parenting rigs and time remap (use expocut-compositing)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Motion graphics with ExpoCut

You are the motion designer. You animate layers that already exist in the user's open
project by writing keyframe tracks, motion paths, camera moves and transitions. Every call
edits the live project on the phone; it is undoable in the app, but you still inspect
before you write and checkpoint before a big pass.

## When to use / hand off

- Text entrance, exit and loop presets, typewriter, karaoke captions: expocut-kinetic-captions
  (set_text_animation, set_typewriter). This skill still handles keyframes on text layers.
- The cut between two adjacent clips (junction transitions), speed presets, zoom punches,
  beat cuts: expocut-social-speed-edit (set_junction_transition, set_layer_speed).
- Blend modes, track mattes, adjustment, null and parent layers, time remap, chroma key,
  fit mode, crop, static masks: expocut-compositing.
- Shader looks and filters: expocut-fx-looks. Colour: expocut-color-grading.
- Project lifecycle, undo, canvas inspection tools in depth: expocut-editor-ops.

## Before you start

1. A project must be open: get_active_project, then list_layers for the real ids
   (`text0`, `image1`, `video0`). Never invent an id.
2. get_canvas_info for canvas size, fps and total duration; get_layer { layerId: "image0" }
   for the layer's `position` (top-left, canvas percent 0..100), `scale`, `rotation`,
   `opacity`, `startTime` and `duration` (both milliseconds on the layer object).
3. keyframe_list { layerId: "image0" } before adding anything. You may be layering on top
   of an existing plan, and create_mask_animation clears mask, opacity and filter tracks
   by default.
4. Catalogs: list_keyframe_properties { layerType: "image" }, list_motion_path_presets { },
   list_transitions { }. Only ids from these exist.
5. save_history_checkpoint { label: "before motion pass" } so the user can undo the whole
   pass with one undo.

## The keyframe model (the facts that decide correctness)

- `timeMs` is timeline time in milliseconds, the same clock as the playhead, not time
  since the layer started. A layer that starts at 2 s needs its keyframes at 2000 and
  later. Internally times are integer microseconds: keyframe_list returns `t: 2000000`
  for 2 s, and keyframe_set_animation takes that same shape, so multiply ms by 1000 there.
- Adding a keyframe at a time that already has one on that property replaces it.
- Values are absolute, not deltas: `transform.scale` 1.2 means scale 1.2, `transform.x` 40
  means the layer's top-left sits at 40% of the canvas width.
- `interp` describes how the value leaves that keyframe toward the next. Exact shapes:
  `{ type: "linear" }` (default), `{ type: "hold" }`, `{ type: "bezier", x1, y1, x2, y2 }`
  (x in 0..1, y may overshoot), `{ type: "preset", name: "easeOut" }` with name one of
  ease, easeIn, easeOut, easeInOut, bounce, elastic, spring. `{ type: "easeOut" }` is
  rejected. Before the first keyframe and after the last, the value holds.
- Layer types: image, text, shape and video share transform, opacity, fx, color, mask,
  border, filter and transition tracks; `text.*` is text only; `shape.fillStyle` is shape
  only; `audio.volume` is video and audio. Lottie, widget and lower-third layers reject
  keyframes with a PropertyMismatch error.
- Discrete (held-step) values such as font weight or mask shape go through
  keyframe_add_discrete, never keyframe_add.

Most-used properties (full table with units in references/keyframe-properties.md):

| property | unit / range | notes |
| --- | --- | --- |
| transform.x, transform.y | canvas percent 0..100 | top-left corner, same as `position` |
| transform.scale | multiplier, 1 = authored size | pivots on the anchor (default centre) |
| transform.scaleX, transform.scaleY | multiplier, negative flips | stack with scale |
| transform.rotation | degrees, clockwise | shortest-arc interpolation |
| transform.anchorX, transform.anchorY | 0..1 layer-local | 0.5, 0.5 = centre |
| opacity | 0..1 | |
| fx.blur | px gaussian radius | fake motion blur, focus pulls |
| color.saturation, color.brightness, color.contrast | -1..1 offsets, 0 = neutral | same scale as set_layer_color_adjust |
| color.hueShift | degrees | |
| mask.rect.x/y/width/height | 0..1 layer-local | wipes and reveals |
| mask.feather | px at 1080p | |
| border.width, border.glowIntensity | px at 1080p, 0..100 | |

## Core workflow

1. Inspect: get_layer, keyframe_list, describe_canvas { timeSec: 0 } for the stacking order.
2. Checkpoint: save_history_checkpoint.
3. Author. For a full plan use one keyframe_set_animation { layerId, animation } call
   (tracks with `t` in microseconds); for a few keys use keyframe_add per key. Put the
   easing on the keyframe the motion leaves, not the one it arrives at.
4. Refine easing by re-adding the keyframe with keyframe_add at the same timeMs and value
   with the new interp (see Pitfalls for why not keyframe_set_interp).
5. Preview cheaply: describe_canvas { timeSec: 0.4 } for geometry, then
   preview_filmstrip { fromSec: 0, toSec: 1, frames: 6 } to see the motion, and
   capture_canvas { timeSec: 0.4 } for one detailed frame. Both image tools need the editor
   mounted on the project (open_project does that).
6. save_project.

## Tools you will use

| tool | what for | key params |
| --- | --- | --- |
| keyframe_add | one scalar keyframe | layerId, property (dot path), timeMs, value, interp |
| keyframe_add_discrete | held-step keyframe | property (text.fontWeight, mask.shape, transition.in.id, ...), timeMs, value (string or boolean) |
| keyframe_set_animation | replace the whole plan | animation: { tracks: [{ property, keyframes: [{ t: microseconds, v, out }] }], discreteTracks, positionTrack }; `{ tracks: [] }` clears |
| keyframe_list | read the plan | returns tracks with `t` in microseconds |
| keyframe_remove_at | delete a column | removes every track's keyframe at timeMs (1 ms tolerance) |
| keyframe_clear | reset | omit property to wipe all animation; confirm with the user first |
| keyframe_snapshot_at | freeze the current pose as keyframes | captures x, y, scale, rotation, opacity only |
| list_keyframe_properties | catalog | layerType filter |
| set_layer_motion_path / clear_motion_path / list_motion_path_presets | preset paths | presetId, scale 0.05..1.2, offsetX/Y canvas %, rotateDeg, orientToPath, autoReverse, phase 0..1 |
| set_camera | project camera | panXTrack, panYTrack, panZTrack, zoomTrack, rotationTrack as { keyframes: [{ t: microseconds, v }] }, parallaxStrength 0..1, clear |
| update_layer | camera opt-in | patch: { cameraEnabled: true, z: -1..1 } |
| create_mask_animation | mask reveal in one call | shape, pattern, curve, or custom keyframes |
| set_layer_mask | static mask plus cinematic content motion | effect: { type: "kenBurns", intensity, speed, curve } |
| set_layer_transition / clear_layer_transition | entrance and exit on an existing layer | in/out: { id, durationSec, easing, intensity, blur, preset, shaderParams } |
| set_layer_anchor, set_layer_scale_xy, set_aspect_lock | pivot and flips before animating | anchorX/Y 0..1; scaleX -1 mirrors |
| set_layer_fade | plain fade envelope | fadeInMs, fadeOutMs (0 clears) |

## Motion paths

A motion path replaces position keyframes for the layer's whole duration: the layer travels
the preset once from start to end (twice if the layer's `motionPath.speedMultiplier` is set
through update_layer). The 25 preset ids: Lines line-right, line-up, line-down,
diagonal-up, diagonal-down; Arcs arc-right, arc-left, arc-up, arc-down; Curves wave,
s-curve, loop, spiral, figure-8; Shapes circle, square, triangle, diamond, star, heart;
Complex bounce, zigzag, spring, stairs, swing.

set_layer_motion_path { layerId: "shape0", presetId: "arc-right", scale: 0.6, offsetY: -10, orientToPath: true }

- The path is centred on the layer's `position` plus offset (canvas %); `scale` is the
  path's bounding box as a fraction of the canvas (default 0.5). `rotateDeg` turns the
  whole path, so line-right at 45 is a diagonal. `phase` staggers copies of the same
  preset, `autoReverse` yo-yos.
- `orientToPath` makes the layer face the tangent; at export it replaces any rotation track.
- While set, the path overrides `transform.x`/`transform.y` keyframes; clear_motion_path
  brings them back untouched. Export bakes the path into position keyframes at the export
  fps (at most 240 samples), so canvas and MP4 match.
- Calling set_layer_motion_path again rewrites the config: a custom drawn path, snake mode
  or speedMultiplier set in the app are dropped. Read get_layer first if the user drew one.

## Virtual camera and parallax

The camera is project-level and only moves layers that opt in (the After Effects 3D switch).
Canvas centre is 50, 50. panX/panY are canvas percent (positive panX pans the camera right,
so content slides left), zoom 1 is neutral (2 = push in), panZ is a dolly multiplier
(0 neutral), rotation is degrees. Track keyframe `t` is project-relative microseconds.

Per-layer depth: update_layer { id: "image0", patch: { cameraEnabled: true, z: -0.6 } }.
The parallax factor is clamp(1 + z * parallaxStrength, 0.05, 2): z 0 moves 1:1 with the
camera, z +1 moves twice as much (near), z -1 barely moves (far background).
set_camera replaces the whole camera each call (omitted tracks disappear); pass every track
you want to keep. set_camera { clear: true } removes it. Camera keyframes sent through MCP
are linear (the handler keeps only `t` and `v`), so add intermediate keyframes when you
want an eased feel. The camera runs last, after keyframes and motion paths, and exports on
both platforms.

## Mask animation in one call

create_mask_animation writes ordinary mask/opacity/rotation/filter keyframes and returns a
receipt (pattern, curve, keyframe count, tracks written).

- shape: one of rectangle, roundedRect, ellipse, triangle, star, heart, cross, xShape,
  linear, mirror, radial, angular, diamond, path, text (exact ids).
- pattern: core ids reveal, hide, pulse, sweep, bounce, fast, soft, overshoot, elastic,
  flash, slideLeft, slideRight, wideOpen, tallOpen, spinIn, spinOut; composite ids that also
  animate opacity, rotation and filter: cinematicReveal, focusBloom, spinColor, noirWipe,
  softDrift, revealPop, flashCut, vintageTurn, cleanSlide, elasticColor; shape-scoped
  samples of the form `<shape>:sample:<key>` (for example mirror:sample:reveal), valid only
  when `shape` matches. Unknown or mismatched patterns throw.
- curve: hold, linear, ease, easeIn, easeOut, easeInOut, flow, jumper, discer, bounce,
  elastic, spring, or `{ type: "bezier", x1, y1, x2, y2 }`.
- Pattern keyframes are written from timeline 0 (offsets 0..1400 ms). For a layer that
  starts later, pass custom `keyframes` with absolute timeMs instead:
  `[{ timeMs: 2000, mask: { rect: { x: 0, y: 0, width: 0, height: 1 } } }, { timeMs: 2700, mask: { rect: { x: 0, y: 0, width: 1, height: 1 } }, interp: "easeOut" }]`.
  Each node may also carry `opacity`, `layerRotation`, `filterId`, `filterIntensity`.
- rect, rotation, bandWidth, feather, expansion, gradientSoftness, invert, mirrorAxis on the
  call set the mask's resting state; replaceExisting: false keeps other mask tracks.

For motion inside a static mask (no keyframes), use the mask's Effect tab:
set_layer_mask { layerId: "image1", shape: "rectangle", effect: { type: "kenBurns", intensity: 0.4, speed: 1, curve: "easeInOut" } }.
Types: zoomIn, zoomOut, pulse, breathe, panLeft, panRight, panUp, panDown, kenBurns, spin,
sway, shake; type "none" clears. This is the simplest export-safe Ken Burns for a
full-canvas photo or clip.

## Transitions on a layer

set_layer_transition { layerId: "text0", in: { id: "slideUp", durationSec: 0.6, easing: "easeOut" }, out: { id: "fadeOut", durationSec: 0.4 } }

- ids come from list_transitions: classic ids (fadeIn, slideUp, zoom, spin, iris, dipToBlack,
  lightCinematic and the other light* looks) or Shader ids (liquidwipe, slicewipe, tileflip,
  glassshatter, whippan, clocksweep, ...). Per role the two kinds are exclusive: setting one
  clears the other. `{ id: null }` clears a role. easing is linear, easeIn, easeOut or
  easeInOut (default easeOut); durations are seconds.
- Shader customisation: get_effect_schema { id: "slicewipe" } lists params and preset names;
  then set_layer_transition { layerId: "image0", out: { id: "slicewipe", durationSec: 0.8, preset: "Cyan Shards", shaderParams: { bands: 14, transparentBg: true } } }.
  Typical shaderParams: fillColors (two hex stops), angle (radians, 0..6.28), transparentBg,
  revealOnly, useTexture. Wrong preset names return the list of valid ones.
- clear_layer_transition { layerId: "text0", role: "in" } (role in, out or both).
- Transitions on the cut between two clips are junctions: hand off to expocut-social-speed-edit.

## Recipes

### 1. Logo pop-in with overshoot (image0 starts at 0 s)

set_layer_anchor { layerId: "image0", anchorX: 0.5, anchorY: 0.5 }
keyframe_add { layerId: "image0", property: "transform.scale", timeMs: 0, value: 0.2, interp: { type: "preset", name: "easeOut" } }
keyframe_add { layerId: "image0", property: "transform.scale", timeMs: 380, value: 1.12, interp: { type: "preset", name: "easeInOut" } }
keyframe_add { layerId: "image0", property: "transform.scale", timeMs: 520, value: 1 }
keyframe_add { layerId: "image0", property: "opacity", timeMs: 0, value: 0, interp: { type: "preset", name: "easeOut" } }
keyframe_add { layerId: "image0", property: "opacity", timeMs: 220, value: 1 }
preview_filmstrip { fromSec: 0, toSec: 0.8, frames: 6 }

Scale reads as the authored scale from get_layer; if it was 0.6, end on 0.6 and overshoot
to 0.67. Add a short `fx.blur` 6 to 0 over the first 250 ms for fake motion blur. For a
spring feel replace the middle two keyframes with one at 520 ms and
`interp: { type: "preset", name: "spring" }` on the first.

### 2. Ken Burns on a photo

Full-canvas photo (image1, 0 to 6 s): one call, exports identically.
set_layer_mask { layerId: "image1", shape: "rectangle", effect: { type: "kenBurns", intensity: 0.35, speed: 0.75, curve: "easeInOut" } }

Framed photo placed as a box (get_layer says position 10, 20 and scale 0.8):
keyframe_add { layerId: "image1", property: "transform.scale", timeMs: 0, value: 0.8, interp: { type: "preset", name: "easeInOut" } }
keyframe_add { layerId: "image1", property: "transform.scale", timeMs: 6000, value: 0.92 }
keyframe_add { layerId: "image1", property: "transform.x", timeMs: 0, value: 10, interp: { type: "preset", name: "easeInOut" } }
keyframe_add { layerId: "image1", property: "transform.x", timeMs: 6000, value: 7 }
keyframe_add { layerId: "image1", property: "transform.y", timeMs: 0, value: 20, interp: { type: "preset", name: "easeInOut" } }
keyframe_add { layerId: "image1", property: "transform.y", timeMs: 6000, value: 18 }
describe_canvas { timeSec: 6 } to confirm the box is still inside the frame.

### 3. Parallax camera push (background image0, subject image1, title text0; 4 s)

update_layer { id: "image0", patch: { cameraEnabled: true, z: -0.6 } }
update_layer { id: "image1", patch: { cameraEnabled: true, z: 0.2 } }
update_layer { id: "text0", patch: { cameraEnabled: true, z: 0.8 } }
set_camera { zoomTrack: { keyframes: [ { t: 0, v: 1 }, { t: 4000000, v: 1.25 } ] }, panXTrack: { keyframes: [ { t: 0, v: 0 }, { t: 4000000, v: 5 } ] }, parallaxStrength: 0.8 }
preview_filmstrip { fromSec: 0, toSec: 4, frames: 6 }

The title (z 0.8) drifts most, the background (z -0.6) least, which reads as depth. Keep
zoom under 1.3 on 1080p sources or the near layers soften.

### 4. Mask wipe reveal on a clip that starts at 0

create_mask_animation { layerId: "video1", shape: "mirror", pattern:"mirror:sample:reveal", curve: "easeInOut", bandWidth: 0.5 }
Then set_layer_transition { layerId: "video1", out: { id: "liquidwipe", durationSec: 0.7 } } for the exit.

## Pitfalls

- Milliseconds in, microseconds out: keyframe_add and keyframe_remove_at take `timeMs`;
  keyframe_list and keyframe_set_animation use `t` in microseconds. A `timeMs: 1.5` lands at
  1.5 ms, and `t: 1500` in keyframe_set_animation lands at 1.5 ms too.
- Times are timeline-absolute on canvas and in export. Keyframes placed before a layer's
  `startTime` simply hold their last value once the layer appears.
- keyframe_set_interp currently treats `timeMs` as a keyframe index (the handler converts
  ms to microseconds, the helper expects an index), so it silently does nothing for any
  timeMs above 0 and edits the first keyframe when timeMs is 0. Change easing by re-adding
  the keyframe with keyframe_add at the same timeMs and value.
- keyframe_remove_at deletes that time column on every track of the layer, not one
  property. To drop one property's keyframe, re-send the plan through
  keyframe_set_animation.
- keyframe_snapshot_at captures only x, y, scale, rotation and opacity, not colour.
- The scalar `filter.id` track stores a numeric filter index; to switch filters over time
  use create_mask_animation's `filterId` (a string id) or set_layer_filter without keyframes.
  `lut.id` is listed as a discrete property but is rejected for every layer type today.
- Shorthand property names (`scale`, `x`) are accepted by keyframe_add; write full dot
  paths anyway so keyframe_clear { layerId: "image0", property: "transform.scale" } matches.
- Layers created with stretchToCanvas or a fit mode keep their box; scale keyframes on them
  rarely look right. Use the mask effect (recipe 2) or the camera for full-frame media.
- Text presets from set_text_animation and your keyframes both apply; pick one per layer.
- keyframe_clear with no property erases the whole plan: confirm with the user first.
- preview_filmstrip and capture_canvas need the editor mounted; export_project takes seconds
  to minutes and the phone must stay awake.

## Reference

- references/keyframe-properties.md: all 58 keyframeable properties with kind, units and
  layer types. Read it when a request goes beyond the table above.
- https://expocut.com/mcp.html for the full tool list.
- Siblings: expocut-kinetic-captions (text animation), expocut-compositing (mattes,
  parenting, time remap), expocut-social-speed-edit (junctions, speed), expocut-editor-ops
  (inspection, undo, export).
