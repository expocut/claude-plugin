---
name: expocut-social-speed-edit
description: "Executes fast social edits inside ExpoCut through its in-app MCP server - speed ramps and slow-mo, splits and trims, cut-level junction transitions on touching clips (wipes, pushes, distort, light leaks, shade shaders), one-call clip sequences with push-ins and labels, keyframed zoom punches, silence removal and long-take-to-short auto edits, and the export settings that actually exist. Use when the user says punchy, TikTok-style, CapCut-style, Reels or Shorts edit, montage, room tour, speed ramp, slow-mo, 2x, zoom punch, whip pan, transition between clips, cut on the beat, trim the dead air, or turn this long video into a short. Beat times come from expocut-audio-post (beat_cut_from_drums) and captions from expocut-kinetic-captions. Do not use for general keyframe choreography (expocut-motion-graphics), colour (expocut-color-grading), or hook and pacing strategy (expocut-retention-playbook)."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Social speed edit

You are the fast-cut editor. Every tool below edits the open project live on the
user's phone; the app's undo covers each call, and `save_history_checkpoint` gives
you a named point to return to before a restructure. Nothing here touches the
source media files - trims, splits and speed changes are timeline metadata.

## When to use / hand off

| Need | Go to |
| --- | --- |
| Beat times from the music, ducking, stems | expocut-audio-post (`separate_audio`, `beat_cut_from_drums`) |
| Captions, word-by-word text, lower thirds | expocut-kinetic-captions |
| Anything keyframed beyond a zoom punch (paths, camera, masks) | expocut-motion-graphics |
| Create/open projects, undo, inspection, render status | expocut-editor-ops |
| Hook length, duration caps, safe zones, why viewers swipe | expocut-retention-playbook |
| Looks, glitch, VHS, light leaks | expocut-fx-looks |

## Before you start

1. `get_active_project {}` - confirms a project is open and returns its
   `exportSettings` (fps, aspectRatio). No project: create and open one first.
2. `list_layers {}` - real ids, types, `startTime`/`duration` in seconds and
   `trackIndex`. Never guess ids; tools that create layers return them.
3. `list_junctions {}` - the cuts that currently exist (two clips touching on the
   same timeline row). Only these can take a junction transition.
4. Ask three things: platform (duration cap), music (a track or a BPM/vibe), and
   which clip is the strongest (it goes first).
5. Beat grid: `beatMs = 60000 / BPM`. 100 BPM = 600 ms, 120 = 500 ms, 128 = 469 ms,
   140 = 429 ms. Verse: cut every 2 beats; pre-chorus: every beat; drop: half-beats,
   then hold the best shot. Real beat positions beat arithmetic - get them from
   `beat_cut_from_drums` when the track is on the timeline.

## Core workflow

1. Lay the base. Several clips in order: `add_clip_sequence` (imports, places
   back-to-back, adds a push-in, an out-transition and an optional label per clip).
   One long take: `add_video_layer` or the user's existing layer.
2. Rough cut. `trim_layer` (in-point, length, start), `split_layer` (cut in two),
   `set_layer_speed` (slow-mo / fast-forward). For talking heads run
   `auto_remove_silence`; for a highlight cut of a long take run `long_video_to_short`.
3. Rhythm. Place cut points on beats (recipe 1). Keep the hook clip inside the
   first 2 seconds.
4. Transitions. On a real cut (from `list_junctions`): `set_junction_transition`.
   On clips you added through MCP: `set_layer_transition` with an `out` role on the
   outgoing clip (that is what `add_clip_sequence` writes). Leave at least half the
   cuts hard.
5. Emphasis. Zoom punches with three `keyframe_add` calls (recipe 2). Save the
   biggest punch for the drop.
6. Overlays last. Push base clips behind them with `reorder_layer` (see pitfalls),
   then hand captions to expocut-kinetic-captions.
7. Check cheaply: `describe_canvas { timeSec }` for layout, `preview_filmstrip
   { fromSec, toSec, frames: 8 }` for pacing, `capture_canvas` only when you need
   pixels.
8. Export:
   `set_export_settings { resolution: "1080p", fps: 30, quality: "high", format: "mp4" }`
   then `export_project {}` (returns the rendered file's `uri`).

## Tools you will use

| Tool | What for | Key params (units) |
| --- | --- | --- |
| `trim_layer` | in-point, length, start | `layerId`, `mediaOffsetSec`, `durationSec`, `startTimeSec` - any subset, seconds |
| `split_layer` | cut a clip in two | `layerId`, `atSec` relative to the clip's own start; returns `first.id` (same id) and `second.id` (new) |
| `set_layer_speed` | slow-mo / speed-up | `layerId`, `speed` 0.1..100 (0.5 = half speed, 2 = twice), `keepPitch` default true; video/audio only |
| `reorder_layer` | z-order | `layerId`, `position`: `"front"`, `"back"` or a number (0 = top) |
| `set_layer_visibility` | A/B previews, lock a finished layer | `layerId`, `hidden`, `locked` |
| `add_clip_sequence` | N clips in one call | `clips[]` of `{ uri \| videoId \| stockQuery, durationSec, label?, pushIn?, transitionStyle?, transitionDurationSec? }`; sequence-level `startTimeSec`, `pushIn { fromScale, toScale }` (default 1.0 to 1.05), `transitionStyle` (id from `list_transitions`, default none = hard cut), `transitionDurationSec` (default 0.55), `labelPosition { x, y }` (default 8/86), `labelFontSize` (48), `labelFontFamily`, `labelDurationSec` (6, clamped to the clip) |
| `auto_remove_silence` | ripple-delete dead air | `layerId`, `thresholdDb` (-40), `minSilenceMs` (500), `paddingMs` (80); returns `newLayerIds` - the source layer id is gone |
| `long_video_to_short` | keep the most energetic passages | `layerId`, `targetDurationSec`, `maxSegmentSec`; trims dead air itself, chronological order, returns `newLayerIds` |
| `list_junctions` | discover cuts | none; returns `fromLayerId`, `toLayerId`, `atSec`, `maxDurationSec { center, start, end }`, current `transition` |
| `set_junction_transition` | blend on a cut | `fromLayerId`, `toLayerId`, `effectId` (junction catalog id, see reference), `durationSec` (default 1, clamped), `alignment` center/start/end, `ease` none/in/out/inOut/custom, `reverse`, `endRatio` 0..1, `params` |
| `clear_junction_transition` | back to a straight cut | `fromLayerId`, `toLayerId` |
| `set_layer_transition` | a clip's own intro/outro | `layerId`, `in`/`out`: `{ id, durationSec, easing, intensity, blur }`; `{ id: null }` clears |
| `keyframe_add` | zoom punch | `layerId`, `property` (`transform.scale`), `timeMs` milliseconds, `value`, `interp` `{ type: "hold" \| "linear" }`, `{ type: "preset", name: "easeOut" }` or `{ type: "bezier", x1, y1, x2, y2 }` |
| `keyframe_list` / `keyframe_clear` | inspect / reset a track | `layerId`, `property` optional on clear |
| `set_export_settings` | encoder settings | `resolution` `480p`/`720p`/`1080p`/`2K`/`4K` or `"1080x1920"`, `fps` 1..120, `quality` `low`/`medium`/`high`, `format` `mp4`/`mov`, `aspectRatio` |
| `export_project` | render | none; blocks until the file exists, returns `uri` |

## Recipes

### 1. Beat-cut a 15-second reel

```
# Music layer "audio0" at timeline 0, one long clip "video0" at 0 (example ids).
separate_audio { layerId: "audio0", tier: "fast" }
beat_cut_from_drums { sourceLayerId: "audio0", maxCuts: 8 }   // -> cutTimesMs e.g. [520, 1040, 1560, 2080]
```

Cut times are milliseconds from the start of the music file. With the music at
timeline 0 and no in-point they are timeline times; otherwise add the music
layer's `startTime` and subtract its `mediaOffset`.

Option A - many clips, one slot each: trim every clip to its slot.

```
trim_layer { layerId: "video0", mediaOffsetSec: 2.0, durationSec: 0.52, startTimeSec: 0 }      // best moment of clip 1
trim_layer { layerId: "video1", mediaOffsetSec: 0.8, durationSec: 0.52, startTimeSec: 0.52 }
trim_layer { layerId: "video2", mediaOffsetSec: 5.1, durationSec: 1.04, startTimeSec: 1.04 }   // hold 2 beats on the strongest shot
```

Option B - one long take: split at each beat, always splitting the piece that
continues, with `atSec` measured from that piece's start.

```
split_layer { layerId: "video0", atSec: 0.52 }    // -> second.id "videoB" (example)
split_layer { layerId: "videoB", atSec: 0.52 }    // timeline 1.04 s = 0.52 s into videoB
```

Then `set_layer_speed { layerId: "videoB", speed: 2 }` on weak pieces (halves
their length - re-check `list_layers` and close gaps with `trim_layer
startTimeSec`) or `remove_layer { id }` after confirming with the user.

### 2. Zoom punch on the drop

`timeMs` is layer-local milliseconds (0 = the clip's first frame). A hold keyframe
keeps the value flat until the next one, so the snap is instantaneous.

```
keyframe_add { layerId: "video0", property: "transform.scale", timeMs: 0, value: 1.0, interp: { type: "hold" } }
keyframe_add { layerId: "video0", property: "transform.scale", timeMs: 1000, value: 1.18, interp: { type: "preset", name: "easeOut" } }
keyframe_add { layerId: "video0", property: "transform.scale", timeMs: 1400, value: 1.0 }
```

Repeat the triplet per beat with the punch keyframe on the beat time. Read back
with `keyframe_list { layerId: "video0" }`; reset with `keyframe_clear { layerId:
"video0", property: "transform.scale" }`. Punches of 1.08-1.12 read as breathing,
1.15-1.25 as a hit; never stack a punch and a transition on the same beat.

### 3. Room tour in one call

```
add_clip_sequence {
  clips: [
    { stockQuery: "modern kitchen interior", durationSec: 3, label: "Kitchen" },
    { stockQuery: "bright living room", durationSec: 3, label: "Living room" },
    { uri: "file:///path/balcony.mp4", durationSec: 4, label: "Balcony", transitionStyle: null }
  ],
  transitionStyle: "whippan", transitionDurationSec: 0.4,
  pushIn: { fromScale: 1.0, toScale: 1.06 },
  labelPosition: { x: 8, y: 84 }, labelFontSize: 44
}
```

The result lists each clip's `videoLayerId` and `labelLayerId`, `totalDurationSec`
and `warnings` (a clip with no transition, a label clamped to fit). Stock clips
need network; `stockQuery` takes the first landscape Pexels result, so prefer a
`videoId` from `stock_search_videos` when the shot matters.

### 4. Long take to a 45-second short

```
save_history_checkpoint { label: "before auto-edit" }
long_video_to_short { layerId: "video0", targetDurationSec: 45, maxSegmentSec: 8 }   // -> newLayerIds, segments, totalMs
```

`video0` no longer exists afterwards; the segments are laid end-to-end from the
original start. To tighten a talking head without re-selecting, use
`auto_remove_silence { layerId: "video0", thresholdDb: -40, minSilenceMs: 400,
paddingMs: 80 }` instead. Both decode the whole clip on the phone - expect
seconds, longer for long files.

### 5. Transition on a cut the user made in the app

```
list_junctions {}   // -> [{ fromLayerId: "video0", toLayerId: "video1", atSec: 4, maxDurationSec: { center: 4, start: 2, end: 2 }, transition: null }]
set_junction_transition { fromLayerId: "video0", toLayerId: "video1", effectId: "wipe.iris", durationSec: 0.5, ease: "inOut", params: { originX: 0.7, originY: 0.35, bulge: 0.6 } }
set_junction_transition { fromLayerId: "video1", toLayerId: "video2", effectId: "distort.warp", durationSec: 0.18, params: { blur: 0.6, blurAniso: 1, blurAngle: 45 } }
clear_junction_transition { fromLayerId: "video0", toLayerId: "video1" }
```

`params` merge onto what the cut already has, so tweaking one option keeps the
rest. The result's `resolvedOptions` shows the clamped values the shader will
run with and `durationClamped` tells you the duration was shortened.

## Pitfalls

- Units. `startTime`, `duration`, `atSec`, `*Sec` are seconds; keyframe `timeMs`
  and `fadeInMs` are milliseconds because the animation tracks store ms
  (`timeMs: 1.5` lands at 1.5 ms).
- Junctions exist only between two clips that share one timeline row and touch.
  Every layer created through MCP (including `split_layer`'s second half,
  `add_clip_sequence` clips and auto-edit segments) lands on its own new row, and
  `update_layer` with `trackIndex` does not move the timeline clip - so on an
  MCP-built timeline `list_junctions` returns nothing. Use `set_layer_transition`
  there; use junction transitions on cuts the user assembled in the app.
- Junction `effectId` values are not the `list_transitions` ids. They are
  `cut.*`, `dissolve.*`, `wipe.*`, `slide.*`, `distort.*`, `light.*` and
  `shade.<id>` (a `list_transitions` Shader-category id with the `shade.` prefix,
  e.g. whippan becomes shade.whippan). The full list is in
  `references/junction-transitions.md`; there is no list tool for it.
- Junction duration is clamped to the cut's capacity: center = the shorter clip,
  start = half the incoming clip, end = half the outgoing clip, never below 0.1 s.
  The tool's default is 1 s, which is long for social; 0.15-0.5 s is the range.
  `cut.straight`, `cut.j-cut` and `cut.l-cut` draw nothing (the joiner does not
  retime audio).
- New layers land at the front (trackIndex 0). After `split_layer`, an auto edit
  or `add_clip_sequence`, the new pieces sit on top of existing text and shapes:
  `reorder_layer { layerId, position: "back" }` each base piece, or build the
  cut before adding overlays.
- `set_layer_speed` rescales only that clip's duration; nothing ripples. Re-read
  `list_layers` and fix gaps or overlaps with `trim_layer startTimeSec`. Minimum
  clip length is 100 ms. Stems from `separate_audio` inherit the source's speed.
- `split_layer` rejects `atSec` at 0 or at/after the clip's end. Each auto-edit
  segment and split half is a fresh id - store what the tool returns.
- `add_clip_sequence` validates `transitionStyle` against `list_transitions` and
  writes it as the outgoing clip's `out` transition, not as a junction.
- `set_export_settings` has only `aspectRatio`, `resolution`, `quality`, `format`,
  `fps`. There is no codec or bitrate parameter; the encoder derives bitrate from
  resolution and quality. `aspectRatio` is normally fixed at `create_project`;
  if you change it here, check the layout with `describe_canvas` and
  `get_resize_review_queue` (expocut-editor-ops).
- `export_project` needs the editor mounted on the project (`open_project` does
  this) and blocks until the file is written - minutes for long timelines, phone
  awake. Poll `get_render_status {}` from a second connection.
- Ask before `remove_layer`. Prefer `set_layer_visibility { hidden: true }` for an
  A/B, and `describe_canvas` before spending an image on `capture_canvas`.

## Reference

- `references/junction-transitions.md` - every junction effect id by family with
  render mode, picker default duration and the `params` each family reads.
- https://expocut.com/mcp.html - full tool reference.
- Siblings: expocut-audio-post (beats, ducking), expocut-kinetic-captions
  (captions), expocut-motion-graphics (keyframes beyond punches),
  expocut-editor-ops (projects, undo, inspection, render status),
  expocut-retention-playbook (what to change and when).
