---
name: expocut-editor-ops
description: "Operate the ExpoCut editor session through the in-app MCP server: projects (create, open, save, rename, duplicate, delete with confirmation), reading state without an image (get_canvas_info, describe_canvas, list_layers, get_layer, get_layer_schema), layer edits (update_layer, remove_layer, reorder_layer, visibility), playback, selection, tracks, session checkpoints with undo, redo and undo_to_checkpoint before automated passes, previews (capture_canvas, preview_filmstrip, capture_export_frame), export settings, export_project and get_render_status, verify_export_parity and the resize review queue. Use when the user says open, rename, duplicate or delete the project, what does the frame look like, screenshot it, undo that, go back, checkpoint, save, hide or mute the track, export settings, 1080p, 4K, 60 fps, is the export done, which fields can I patch, or seconds versus milliseconds. Not for adding media or text (expocut-video-creating) or keyframes (expocut-motion-graphics)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# ExpoCut editor operations

You are the operator of the editor session: you find and open projects, read what is on the
canvas, patch layers, keep a checkpoint before every risky pass, and run the export. Nothing
here is destructive unless it says so; the two destructive calls (`delete_project`,
`remove_layer`) always get an explicit yes from the user first.

## When to use / hand off

Own: project lifecycle, inspection, generic `update_layer` patches, playback, selection, tracks,
checkpoints, previews, export settings, rendering, parity checks, resize review. Hand off adding
media, stock and titles to expocut-video-creating; keyframes and `set_camera` to
expocut-motion-graphics; fit/anchor/crop/blend to expocut-compositing; effect schemas
(`get_effect_schema`) to expocut-fx-looks.

## Before you start

- `get_active_project` is the cheapest state probe and never throws: `projectId` is null when
  nothing is open; otherwise it returns layerCount, trackCount, isDirty and exportSettings.
- Almost every other tool throws `No project is open. Call open_project first.` until a project
  is loaded. `open_project { id }` loads it from disk and navigates the phone to the editor.
- Mount matters. These reach into the live editor screen and fail (after a 2 to 6 s grace
  period) if it is not on screen: `capture_canvas`, `preview_filmstrip`, `render_still`,
  `capture_export_frame`, `export_project`, `verify_export_parity`. Everything else reads or
  writes the store and works with the editor in the background.
- Units. Tool arguments named `timeSec`, `startTime`, `duration`, `*Sec` are seconds. Stored
  layer fields and everything named `*Ms` are milliseconds. The precise rule is in the section
  "Seconds versus milliseconds" below; read it before your first `update_layer`.

## Core workflow

1. Find or make the project: `list_projects` (id, name, aspectRatio, updatedAt) or
   `create_project { name: "Launch teaser", aspectRatio: "16:9", fps: 30 }`, then `open_project { id }`.
2. Read the state you need, cheapest first: `get_canvas_info` (size, fps, duration, counts,
   playhead), `list_layers` (compact, seconds), `describe_canvas { timeSec: 2 }` (visible layers
   with boxes), `get_layer { layerId }` (full record, milliseconds), `get_project` only when you
   really need tracks and clips too.
3. Checkpoint before a pass that touches many layers: `save_history_checkpoint { label: "before grade pass" }`
   returns `{ id }`. Keep that id.
4. Edit: `update_layer { id, patch }` for fields without a typed setter (check
   `get_layer_schema { category: "text" }` for valid names), `reorder_layer` for z-order,
   `set_layer_visibility` for A/B toggles, `remove_layer` after confirmation, track tools for whole rows.
5. Look: `describe_canvas` again; `capture_canvas { timeSec, grid: true }` when geometry matters;
   `preview_filmstrip` for motion.
6. Not happy: `undo_to_checkpoint { id }` restores the checkpoint you took in step 3.
7. Output: `set_export_settings { resolution: "1080x1920", quality: "high", format: "mp4", fps: 30 }`,
   `save_project`, `export_project`, and `get_render_status` from a second connection while it runs.

## Tools you will use

Projects

| tool | what for | notes |
| --- | --- | --- |
| list_projects | ids and names | reads projects.json |
| create_project | new empty project | name*, aspectRatio (default 9:16), fps; does not open it; stores no resolution |
| open_project | load + navigate | id*; reloads from disk, discarding unsaved session edits |
| get_active_project | what is open | never throws |
| save_project | write the session to disk now | the editor also autosaves every 30 s while mounted and on backgrounding |
| rename_project | name only | id*, name* |
| duplicate_project | clone from disk to a new id | id*, name (default "<name> (copy)"); save first or unsaved edits are missing; not opened automatically |
| delete_project | permanent, no undo | id*; confirm first; clears the editor if that project was open |

Session, playback, selection

| tool | what for | notes |
| --- | --- | --- |
| play / pause / playback_status | store playback state | status returns isPlaying, playheadMs, totalDurationMs |
| seek { timeSec } / seek_seconds { timeSec } | move the playhead (seconds) | identical; capture tools take their own timeSec |
| ping {} / echo { message } | is the server alive; round-trip a payload | the two builtins; use them to confirm the phone is reachable before a long pass, they need no open project |
| select_layer { layerId } / get_selection | in-app selection | layerId may be null to clear; highlighted in capture_canvas |

Tracks (one track per MCP-added layer; ids look like `track-video-…`)

| tool | what for | notes |
| --- | --- | --- |
| list_tracks | id, type, name, layerCount, isVisible, isMuted, volume | |
| set_track_visibility { trackId, visible } | hide a row from canvas and export | |
| set_track_mute { trackId, muted } | silence a row | honoured by the exporter |
| set_track_volume { trackId, volume } | 0..2.5 multiplier | throws outside the range |
| reorder_track { trackId, toIndex } | move a row in the tracks array | export stacking only; see pitfalls, prefer reorder_layer |

Layers

| tool | what for | notes |
| --- | --- | --- |
| list_layers | compact summary, seconds | id, type, name, startTime, duration, trackIndex, position, scale, opacity, text fields |
| get_layer { layerId } | every stored field, milliseconds | diff before patching |
| get_layer_schema { category } | valid field names and units | categories: core, text, animation, transition, text_animation, audio, media, color, visual_effects, compositing, masks, shape, widget_configs, lottie, transcript |
| update_layer { id, patch } | merge a partial patch | no validation of names; startTime/duration in seconds, everything else raw |
| remove_layer { id } | delete a layer and its track and clip | confirm first; no undo unless you checkpointed |
| reorder_layer { layerId, position } | "front", "back" or a number | renumbers layers, clips and tracks together |
| set_layer_visibility { layerId, hidden, locked } | hide from canvas and export, or lock in the UI | |
| get_project | everything: layers, tracks, timelineClips, exportSettings, selection, playhead, camera | heavy |

Previews and rendering

| tool | what for | notes |
| --- | --- | --- |
| get_canvas_info | aspect, pixel size, fps, duration, frames, counts, playhead | width/height are null unless resolution is "WxH" |
| describe_canvas { timeSec } | visible layers top-most first with box x/y/w/h in percent, hidden and out-of-time counts | free, no mount |
| capture_canvas { timeSec, maxWidth, format, quality, xray, outlinesOnly, grid } | one frame as an image | maxWidth default 512, cap 1024; needs mount |
| preview_filmstrip { fromSec, toSec, frames, maxWidth, format } | 1..12 labelled frames | default 6 frames at 320 px jpg; needs mount |
| render_still { timeSec, maxWidth, format, quality } | write the frame to a file:// png/jpg | maxWidth defaults to canvas width, cap 2160; needs mount |
| capture_export_frame { timeSec, format } | one export-accurate frame with every overlay | needs mount; the true preview equals export still |
| compose_single_frame / capture_project_base_frame / render_composited_frame | native compositor diagnostics | base video only, iOS native path; not a full composite |
| set_export_settings | aspectRatio, resolution, quality, format, fps | only passed fields change |
| export_project | render and encode | no params, blocks, 10-minute internal timeout, returns { uri } |
| get_render_status | isExporting, lastExportUri, exportSettings, estimatedFrames, totalDurationSec | poll from a second connection |
| verify_export_parity { timesSec, maxWidth, existingExportPath } | canvas versus export frame pairs | runs a full export unless existingExportPath is given |
| get_resize_review_queue / clear_resize_review | layers flagged after an aspect change | see recipe 3 |

Checkpoints (session-scoped, in memory, ring of 50, cleared when the app restarts)

| tool | what for | notes |
| --- | --- | --- |
| save_history_checkpoint { label } | snapshot layers, tracks, clips, exportSettings | returns { id, depth }; taking one while mid-undo drops the redo tail |
| undo | move one checkpoint back | no-op with fewer than two checkpoints |
| redo | move one checkpoint forward | |
| undo_to_checkpoint { id } | jump to a specific checkpoint | the reliable way to revert a pass |
| list_checkpoints | ids, labels, timestamps, current cursor | |

## Seconds versus milliseconds

Verified against the app's layer and introspection tool implementations:

- `update_layer` multiplies `patch.startTime` and `patch.duration` by 1000 before merging, so
  they are seconds, like every `add_*` call. Every other key in the patch is written exactly as
  given. Fields that the layer stores in milliseconds therefore stay milliseconds inside a
  patch: `mediaOffset`, `transitionInDuration`, `transitionOutDuration`, `fadeInMs`, `fadeOutMs`,
  `audioOffset`, `textAnimInDuration`, `textAnimOutDuration`, `volumeKeyframes[].timeMs`.
- `get_layer` and `get_project` return the stored record, so `startTime`, `duration` and
  `mediaOffset` come back in milliseconds. `list_layers` divides startTime and duration by 1000.
  `describe_canvas`, `get_canvas_info` and `playback_status` report both (`atMs`/`atSec`,
  `playheadMs`/`playheadSec`, `totalDurationMs`/`totalDurationSec`).
- Consequence: a `get_layer` startTime of 4000 pasted into `update_layer` becomes 4,000,000 ms.
  Divide by 1000 first, or use `trim_layer { layerId, startTimeSec: 4 }`, which takes seconds.
- Keyframe `timeMs` (expocut-motion-graphics) is milliseconds on the project timeline.

## Recipes

### 1. A safe automated pass

```
save_history_checkpoint { label: "before opacity pass" }        // → { id: "ckpt_…" }
list_layers
update_layer { id: "text_…", patch: { opacity: 0.85, startTime: 0.2 } }   // seconds
update_layer { id: "image_…", patch: { opacity: 0.6 } }
describe_canvas { timeSec: 1 }
capture_canvas { timeSec: 1, maxWidth: 640 }
undo_to_checkpoint { id: "ckpt_…" }                            // only if the user dislikes it
save_project
```

`undo` alone would not revert this: it steps to the checkpoint before the current cursor, and
with a single checkpoint there is none. Either jump by id, or take a second checkpoint after
the pass so `undo`/`redo` flip between "before" and "after".

### 2. Diagnose a blank or wrong frame without an image

```
get_canvas_info                                  // totalDurationSec, playhead, counts
describe_canvas { timeSec: 6 }                   // visibleCount 0? check scheduledElsewhereCount
list_layers                                      // find the layer whose startTime+duration misses 6 s
trim_layer { layerId: "video_…", startTimeSec: 4, durationSec: 5 }
reorder_layer { layerId: "shape_…", position: "back" }   // background covering everything
describe_canvas { timeSec: 6 }
```

Boxes come back as `{ x, y, w, h }` in canvas percent, top-left anchored, `approx: true` when
the size is estimated (text without measured metrics). Lower `trackIndex` paints on top.

### 3. Change the aspect ratio and clean up

```
save_history_checkpoint { label: "before 1:1" }
set_export_settings { aspectRatio: "1:1", resolution: "1080x1080" }
get_resize_review_queue                          // → { layerIds, count }
describe_canvas { timeSec: 1 }                   // inspect the flagged ids
update_layer { id: "text_…", patch: { fontSize: 56 } }
clear_resize_review
capture_canvas { timeSec: 1, grid: true }
```

Changing `aspectRatio` runs the store's re-anchor pass and fills the review queue with layers
whose placement needed a guess; the queue is the same list the in-app review modal shows.

### 4. Export and poll

```
set_export_settings { resolution: "1080x1920", quality: "high", format: "mp4", fps: 30 }
save_project
export_project                                   // blocks; → { uri: "file://…/export.mp4" }
get_render_status                                // from another connection: isExporting, lastExportUri
```

For a proof frame instead of a full render: `capture_export_frame { timeSec: 3 }`. For a poster
file: `render_still { timeSec: 3, format: "png" }`.

## Pitfalls

- `update_layer` and `remove_layer` take `id`; almost every other setter takes `layerId`.
- `update_layer` does not validate field names. A typo becomes a harmless junk field and the
  change silently does nothing; confirm names with `get_layer_schema` and re-read with `get_layer`.
- `reorder_track` only moves the tracks array, which is what the native exporter uses for
  stacking; the canvas stacks by `layer.trackIndex`. Moving a track alone makes the preview and
  the export disagree. `reorder_layer` updates both.
- Checkpoints are not per project. Restoring a checkpoint taken in another project overwrites
  the current project's layers. `list_checkpoints` before jumping. Checkpoints also do not
  capture cut transitions or the camera, and they are separate from the in-app undo button.
- `open_project` reloads from disk. Unsaved session edits vanish if you reopen the same project.
  `duplicate_project` clones the disk copy too, so `save_project` before either.
- `set_export_settings` accepts `resolution` as a preset (480p, 720p, 1080p, 2K, 4K) or "WxH"
  between 64 and 7680, `fps` 1..120, `quality` low/medium/high, `format` mp4 or mov (anything
  else is written as .mov). `create_project` stores no resolution and the editor's own default is
  480p low, so set these explicitly before `export_project`.
- `get_canvas_info` parses only "WxH"; with a preset the width/height fields are null even though
  the canvas is sized correctly.
- `export_project` blocks the connection for the whole render and needs the phone unlocked with
  the editor on screen; a backgrounded app stalls it. Do not fire it twice.
- `verify_export_parity` runs an entire export unless `existingExportPath` is given. Its
  `meanAbsDiff`/`maxAbsDiff` are always -1; the verdict compares encoded PNG sizes, so look at the
  returned image pairs yourself or pass them to `analyze_pixels` for real numbers.
- `compose_single_frame` and `capture_project_base_frame` render the first video layer only and
  need the native iOS compositor; use `capture_export_frame` for a frame with overlays.
- `capture_project_base_frame` picks the first video layer in array order, which is not always
  the lowest track.

## Reference

- `references/layer-fields.md`: every `get_layer_schema` category with field names, units and
  ranges; read it when composing an `update_layer` patch.
- Full tool list and conventions: https://expocut.com/mcp.html
- Siblings: expocut-video-creating (adding media and text), expocut-motion-graphics (keyframes,
  camera), expocut-compositing (fit, anchor, crop, blend), expocut-fx-looks (effect schemas).
