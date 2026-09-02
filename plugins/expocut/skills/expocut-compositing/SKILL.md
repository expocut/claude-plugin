---
name: expocut-compositing
description: "Control how layers composite in the ExpoCut mobile editor through its MCP server - 14 blend modes, alpha/luma track mattes, adjustment layers, parent and null rigs, time remapping (freeze frame, reverse, ramps), stacked-alpha overlay packs, alpha mode, working colour space, 14 mask shapes including Video-in-Text, chroma key, fit mode, anchor, crop, pan, blur fill, timed fades, fade-on-edge masks, and video-audio unlink, relink and sync nudges. Use when the user says blend mode, multiply, screen, overlay, matte, cut out, mask to a shape, green screen, remove background, adjustment layer, parent, null, freeze frame, reverse clip, time remap, crop, fit, fill the frame, letterbox, blur background, fade the edges, detach audio, lip sync, or overlay pack. Do not use for keyframes, motion paths or animated mask reveals (expocut-motion-graphics), LUTs and grades (expocut-color-grading), or speed presets and junction transitions (expocut-social-speed-edit)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Compositing with ExpoCut

You are the compositor. You decide how layers stack, blend, clip and time-shift inside the
user's open project. Every setter is a merge-patch on one layer: it changes nothing else,
it is undoable in the app, and most of it is invisible until you look at the right frame.
Inspect first, checkpoint, then write.

## When to use / hand off

- Animating anything over time (keyframes, motion paths, camera, animated mask reveals):
  expocut-motion-graphics. This skill sets the static mask; that skill moves it.
- LUTs, CDL grades, colour adjust passes: expocut-color-grading (set_layer_cdl lives in this
  family but the grading decisions belong there).
- Constant-speed slow motion or fast forward (set_layer_speed) and the transition on a cut
  between two clips: expocut-social-speed-edit.
- Ducking, stems, volume automation after you unlink audio: expocut-audio-post.
- Effects, shader looks, light leaks as footage overlays: expocut-fx-looks
  (add_light_leak_overlay already picks a blend for you).
- Custom mask shapes (mask_register_shape), fade-mask and border presets: expocut-asset-authoring.

## Before you start

1. get_active_project, then list_layers for real ids and types; the tools below reject the
   wrong type (chroma key and alpha packing are video only, unlink is video only).
2. describe_canvas { timeSec: 1 } to see paint order: lower `trackIndex` paints on top,
   `trackIndex` 0 is the front. reorder_layer { layerId: "video1", position: "front" } fixes
   order before any matte or adjustment work, because both depend on what is beneath.
3. get_layer { layerId: "video0" } to read the current compositing fields;
   get_layer_schema { category: "compositing" } and get_layer_schema { category: "masks" }
   list every field update_layer can patch when no typed setter exists.
4. save_history_checkpoint { label: "before compositing" }.
5. Know how you will verify: describe_canvas and capture_canvas show the editor canvas,
   which approximates blend modes and does not composite track mattes or adjustment layers
   the way the encoder does. capture_export_frame { timeSec: 1 } renders one frame through
   the real export builder (editor must be mounted); export_project is the final word and
   takes seconds to minutes.

## The compositing model (from the app code)

Paint order and blend. The renderer sorts by `trackIndex` descending and paints the highest
first, so the lowest ends up on top. Each layer then blends with everything already painted
using `blendMode` (default normal). The 14 modes: normal, multiply, screen, overlay, darken,
lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, add,
subtract. Formulas run per channel in sRGB with source-over alpha. The encoder applies the
exact mode; the canvas preview maps add to screen and subtract to difference, so judge those
two on an export frame.

Track matte. set_track_matte stores `{ sourceLayerId, mode, keepSourceVisible }` on the
target layer. At render time the source layer (any type: text, shape, image, video) is
drawn to an offscreen buffer and its alpha (mode alpha) or luminance (mode luma) clips the
target; the inverted modes swap inside and outside. By After Effects convention the source
is hidden from the composite while any consumer uses it, unless one passes
keepSourceVisible: true. The source only exists while it is on the timeline, so give it the
same startTime and duration as the target. A layer cannot matte itself, the source must
exist, and importers drop dangling references. Both encoders implement mattes (Android also
on the CPU fallback path).

Adjustment layer. set_layer_is_adjustment turns a layer into one with no pixels of its own;
what it carries is applied to the accumulated composite of every layer beneath it (higher
trackIndex) that overlaps its time range, and nothing above it. Today the encoder applies
the adjustment layer's LUT (set_layer_lut) and CDL (set_layer_cdl); effects, filters and
colorAdjust on an adjustment layer do not propagate. `disabled: true` keeps the layer but
suspends it. Any full-canvas shape makes a good adjustment layer (recipe 4).

Parenting and null objects. set_layer_parent makes the child inherit the parent's position,
scale and rotation (parent first, then the child's offset, pivoting on the parent's anchor);
cycles are rejected. set_layer_is_null marks a rig layer that renders nothing. These fields
are stored and exported to Lottie and FCPXML, but the editor canvas and the video encoders
do not read `parentId` or `isNull` yet: a parented child does not follow its parent in the
preview or the MP4. Use them for interchange, and move groups with the virtual camera or
matching keyframes (expocut-motion-graphics) when the result has to render.

Time remap. set_time_remap maps editor timeline time to source media time with keyframes
`{ playheadMs, sourceMs }` (both milliseconds; playheadMs on the global timeline, sorted
ascending, at least one). Between keyframes the mapping is linear: equal slopes play at
normal speed, a steeper source slope is faster, a flat segment (same sourceMs twice) is a
freeze frame, a decreasing segment plays in reverse. Outside the range the value clamps
(extrapolation clamp or hold behave the same today). A remap does not lengthen the layer:
extend it with trim_layer { layerId: "video0", durationSec: 9.5 } when you add a hold.
Preview, iOS and Android all evaluate it; the explicit remap wins over any speed setting.
clear_time_remap removes it.

Alpha. set_layer_alpha_mode records whether the source is straight or premultiplied; the
value is stored for interchange only and no renderer reads it yet, so it will not fix dark
fringes by itself. set_layer_alpha_packing { packing: "stacked" } is for video layers whose
file carries transparency as a packed frame: the frame is twice the visual height with the
colour image in one half and a luma matte (white = opaque) in the other; the encoders unpack
it into real alpha, the canvas preview still shows the double frame. Any non-video layer
ignores it.

Working colour space. set_working_color_space accepts sRGB (default), Rec.709, Rec.2020,
linear and stores it with the export settings; non-sRGB values downgrade at encode time, so
treat it as intent metadata.

## Masks, keying and edges

set_layer_mask { layerId: "image0", shape: "ellipse", rect: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 }, feather: 24 }

- shape ids are exact: rectangle, roundedRect, ellipse, triangle, star, heart, cross, xShape,
  linear, mirror, radial, angular, diamond, path, text. Defaults on first apply: rectangle,
  rect { x: 0, y: 0, width: 1, height: 1 } (identity, layer-local 0..1), feather 0,
  invert false. Later calls merge with the existing mask, so you can change one field.
- rotation is degrees about the rect centre; bandWidth is the mirror band half-width or the
  roundedRect corner radius (0..0.5); invert shows the outside; feather is px at 1080p.
- shape "text" is Video-in-Text: textData { content, fontFamily, fontWeight, italic, align }
  is required and content must be non-empty. shape "path" needs a registered custom shape
  (mask_register_shape) or a `layerMask.pathData` patch through update_layer.
- effect (cinematic motion inside the mask) and morph (material between mask shape
  keyframes) belong to expocut-motion-graphics; enabled: false removes the mask.
- Masks are designed for image and video layers. On Android an enabled mask forces the CPU
  export path, which drops shader filters on that layer (iOS is unaffected).

Chroma key (video layers): set_layer_chroma_key { layerId: "video1", keyColor: "#00FF00", similarity: 0.4, smoothness: 0.15, spill: 0.6 }.
Defaults are #00FF00, similarity 0.4, smoothness 0.1, spill 0.5. Raise similarity in 0.05
steps until the backdrop clears, add smoothness for hair edges, raise spill for green
fringes; enabled: false disables and keeps the settings. Read the real backdrop colour from
capture_canvas before keying a blue or uneven screen.

Background remover: set_layer_background_remover { layerId: "video1", quality: "balanced", featherPx: 2 }
stores the ML segmentation config (quality fast, balanced, accurate) and shows the badge in
the editor, but no encoder module implements it yet, so the export is unchanged. Prefer a
chroma key or a shape mask when the result must render, and tell the user.

Spatial fade (fade on edge): set_layer_fade_mask { layerId: "video1", mode: "linear", angle: 270, position: 0.5, softness: 0.4 }.
Modes: linear (angle 0 fades from the left edge, 90 top, 180 right, 270 bottom), radial
(vignette outward from the centre), inset (all four edges). position, softness and floor are
0..1 (floor is the minimum opacity), invert flips, curve is linear, easeIn, easeOut or
easeInOut. Defaults: linear, angle 180, position 0.5, softness 0.4, floor 0. This is
spatial; set_layer_fade { layerId: "video1", fadeInMs: 300, fadeOutMs: 300 } is the timed
envelope (works on every layer type; 0 clears). clear_layer_fade_mask removes the spatial one.

## Geometry inside the frame

| tool | what it does | notes |
| --- | --- | --- |
| set_layer_fit_mode | contain, cover, fill, scale-down, none | fill also sets the legacy stretchToCanvas true; the others set it false |
| set_blur_fill | true / false / null | blurred copy of the media behind a contain-fit image or video; null = auto, which fires only on portrait and square canvases; preview only until the encoders read it |
| set_stretch_pan | x, y in canvas percent | pans a fill-mode layer inside the frame; preview only today |
| set_layer_anchor | anchorX, anchorY 0..1 | pivot for scale and rotation, default centre; exported |
| set_aspect_lock | locked | only affects the user's edge-handle gestures |
| set_layer_scale_xy | scaleX, scaleY | -1 mirrors or flips; multiplies with the uniform scale; exported |
| set_layer_crop | x, y, width, height 0..1 | source sub-rectangle, top-left origin; identity is 0, 0, 1, 1; encoders clamp invalid rects to identity |
| set_layer_overlay_color | "#RRGGBB" or null | multiplicative tint over the rendered layer |
| reorder_layer | front, back or a number | z-order; other layers renumber densely |

## Video and audio linking

- mute_video_audio { layerId: "video0", muted: true } silences the embedded track without
  creating a layer (video layers only).
- unlink_video_audio { videoLayerId: "video0" } creates an audio layer (returned as
  audioLayerId) with the same start, duration, media offset and volume, then mutes the
  video. Do this before ducking, stems or audio effects on the clip's own sound.
- relink_video_audio { audioLayerId: "<audioLayerId returned by unlink_video_audio>" } removes
  that audio layer and unmutes the video; it only works on layers created by unlink.
- set_layer_audio_offset { layerId: "audio1", offsetMs: 120 } nudges playback later
  (negative = earlier); the exporter folds it into the layer's timing. Lip-sync fixes live
  within about 200 ms.

## Recipes

### 1. Video revealed through a title (track matte)

add_text_layer { text: "SUMMER", fontSize: 140, fontWeight: "900", verticalAnchor: "center", startTime: 0, duration: 5 }
set_track_matte { layerId: "video0", sourceLayerId: "text0", mode: "alpha" }
capture_export_frame { timeSec: 1 }

The clip video0 (full canvas, 0 to 5 s) now shows only inside the glyphs and the text
hides itself. mode "luma" keys on brightness instead, useful with a gradient shape as the
source. If the user wants to see it live on the canvas, the alternative is Video-in-Text:
set_layer_mask { layerId: "video0", shape: "text", textData: { content: "SUMMER", fontWeight: "900" } }.

### 2. Green-screen presenter over B-roll

reorder_layer { layerId: "video1", position: "front" }
set_layer_chroma_key { layerId: "video1", keyColor: "#00FF00", similarity: 0.4, smoothness: 0.15, spill: 0.6 }
set_layer_fit_mode { layerId: "video1", fitMode: "contain" }
set_layer_fade_mask { layerId: "video1", mode: "inset", softness: 0.15 }
capture_canvas { timeSec: 2 }

The presenter (video1) sits in front of the B-roll (video0); the inset fade hides the
hard frame edge of the keyed plate. Increase similarity if green remains, decrease it if
skin starts to disappear.

### 3. Freeze frame then reverse (video0 runs 0 to 8 s)

set_time_remap { layerId: "video0", keyframes: [ { playheadMs: 0, sourceMs: 0 }, { playheadMs: 3000, sourceMs: 3000 }, { playheadMs: 4500, sourceMs: 3000 }, { playheadMs: 8000, sourceMs: 0 } ], extrapolation: "clamp" }
preview_filmstrip { fromSec: 2.5, toSec: 8, frames: 8 }

Normal speed for 3 s, a 1.5 s hold on the frame at 3 s, then the clip runs backwards to
its first frame by 8 s. To keep the original ending instead of eating it, extend the layer
first: trim_layer { layerId: "video0", durationSec: 9.5 }. clear_time_remap restores 1:1.

### 4. Adjustment band with a stacked-alpha overlay on top

add_shape_layer { shape: "rectangle", fillColor: "#000000", stretchToCanvas: true, startTime: 4, duration: 3 }
set_layer_is_adjustment { layerId: "shape1", isAdjustment: true }
set_layer_cdl { layerId: "shape1", slope: [1.05, 1, 0.9], offset: [0, 0, 0], power: [1, 1, 1.05], saturation: 0.85 }
add_video_layer { uri:"file:///path/to/wipe-stacked.mp4", stretchToCanvas: true, startTime: 4, duration: 1.5 }
set_layer_alpha_packing { layerId: "video2", packing: "stacked" }
reorder_layer { layerId: "video2", position: "front" }

Between 4 and 7 s everything beneath shape1 gets a warm, slightly desaturated grade; the
packed overlay (video2) composites with real transparency in the export while the canvas
shows its double frame. For a light leak or particle clip without a matte, use
set_layer_blend_mode { layerId: "video2", mode: "screen" } instead of alpha packing.

## Pitfalls

- Anything set on a layer that is not visible at the frame you check looks like a no-op:
  confirm startTime and duration with get_layer first.
- Track mattes and adjustment layers depend on `trackIndex`; adding a layer puts it at 0
  (front) and shifts the rest, so reorder after adding, not before.
- set_track_matte hides the source layer in the export; keepSourceVisible: true draws it
  twice (source and matte). A source that ends before the target un-mattes the remainder.
- Adjustment layers propagate only LUT and CDL. An effect on an adjustment layer affects
  nothing.
- parentId, isNull and alphaMode are data-model fields today: no canvas or encoder result.
  Say so rather than promising a rigged move.
- set_layer_alpha_packing on an image or shape is ignored (video only); the tool description
  and the type comments disagree about which half holds colour, so test one overlay from a
  pack before batch-applying.
- Time remap keyframes must be sorted by playheadMs; a decreasing segment reverses, a flat
  one freezes, and the layer's duration does not change on its own.
- set_layer_fit_mode writes fitMode and stretchToCanvas together; do not patch one of them
  alone through update_layer.
- blur fill and stretch pan render in the editor only; verify with capture_export_frame or
  a real export before promising them in the MP4.
- Background removal is stored but not rendered by the encoders; chroma key is.
- describe_canvas ignores blend modes, mattes and adjustments; capture_export_frame and
  export_project need the editor mounted and the phone awake.
- remove_layer and clear_track_matte, clear_time_remap, clear_layer_fade_mask are undoable
  but silent: state what you are removing before you call them.

## Reference

- https://expocut.com/mcp.html for the full tool list and parameter shapes.
- Siblings: expocut-motion-graphics (keyframes, camera, mask animation),
  expocut-color-grading (LUT, CDL, colour adjust), expocut-social-speed-edit (speed presets,
  junctions), expocut-audio-post (after unlinking audio), expocut-asset-authoring (custom mask
  shapes, fade-mask presets), expocut-editor-ops (undo, checkpoints, render status).
