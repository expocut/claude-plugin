---
name: expocut-retention-playbook
description: "Retention editing for TikTok, Instagram Reels and YouTube Shorts inside ExpoCut through the in-app MCP server: the first-second hook (open mid-action, a four to seven word text hook, an audio spike), a visible change every three to five seconds, snap punch-ins as hold keyframes at real timeline milliseconds, duration targets per platform, text kept inside platform safe zones checked with describe_canvas and the capture_canvas grid, seamless loop endings, a cover frame, and a preview_filmstrip verify loop. Use when the user wants a video to perform, go viral, hold attention, asks about hooks, retention, watch time, completion rate, the best length for a platform, where text is safe from the app UI, why viewers swipe away, or wants a cover frame. It decides what to change and when, then calls the executing skills (expocut-video-creating, expocut-social-speed-edit, expocut-audio-post, expocut-kinetic-captions). Do not use for long-form YouTube pacing beyond the basics."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# The retention playbook

You are the retention editor. The scroll decision happens in about 1.5 seconds, so everything
below serves the first second first. You change the live project on the user's phone; keep a
checkpoint before a pass, verify with cheap text readouts before spending images, and let the
user decide on removals.

## When to use / hand off

Use this skill to decide what to change and when: hook, cadence, punch-ins, duration, safe
zones, loop, cover frame. It executes the simple calls itself and hands the rest off:

- cuts, trims, titles, stock, music, export: expocut-video-creating and expocut-editor-ops
- speed ramps, cut-level transitions between two clips, zoom punches at scale: expocut-social-speed-edit
- beat detection, silence removal, ducking, loudness: expocut-audio-post
- captions and word-by-word text (most viewers watch muted): expocut-kinetic-captions
- keyframe easing beyond a snap, motion paths: expocut-motion-graphics

## Before you start

- Ask which platform and whether the piece is entertainment or educational; that sets the target
  length (table below) and the safe zone.
- `get_active_project`, then `get_canvas_info` for `totalDurationSec` and the aspect, and
  `list_layers` for ids and timings (seconds). Never guess an id.
- `save_history_checkpoint { label: "before retention pass" }` so the whole pass can be reverted
  with `undo_to_checkpoint { id }`.
- Units: cut tools take seconds; `keyframe_add` takes `timeMs` in milliseconds on the project
  timeline (a punch-in at 4 s is `timeMs: 4000`, and `timeMs: 4` lands at 4 ms).

## Core workflow

### 1. The hook window

- 0 to 1 s: a pattern interrupt (hard cut mid-action, whip pan, snap zoom), a four to seven word
  text hook, and an audio spike. Start mid-motion, never on an intro card.
- 0 to 3 s: the hook has to work with sound off. Text, not narration, carries it.
- 3 to 5 s: state the explicit promise ("3 edits that double watch time").
- Hook formats that keep working: bold or contrarian claim, open question, result first (show the
  payoff frame at t=0, then the process), numbered promise, direct callout ("if you edit on your phone").

Execution:

```
trim_layer { layerId: "video_…", mediaOffsetSec: 3.2, startTimeSec: 0 }          // skip the wind-up, open mid-action
add_text_layer { text: "3 edits that double watch time", fontSize: 64, fontWeight: "800", textColor: "#FFFFFF", fontFamily: "din-condensed", textAlign: "center", y: 18, startTime: 0, duration: 2.5, transitionIn: "slideUp", transitionInDuration: 0.25, textStrokeColor: "#000000", textStrokeWidth: 3, textAutoFit: { maxSize: 64, minSize: 40, maxLines: 2 } }
stock_search_music { query: "whoosh", category: "sfx", maxDuration: 2 }
add_stock_music_layer { soundId: 123456, startTime: 0, duration: 1, volume: 0.9 }  // example id
set_layer_transition { layerId: "video_…", in: { id: "whippan", durationSec: 0.3 } }
```

If the strongest moment sits later in the clip, `split_layer { layerId, atSec: 6 }` and move the
second half to the front with `trim_layer { layerId: "video_…second", startTimeSec: 0 }`, or let
expocut-social-speed-edit rebuild the order.

### 2. Cadence: change something every 3 to 5 seconds

- Baseline for short-form: a visible change (cut, B-roll, text pop, zoom, angle) at least every
  3 to 5 s. Trend and entertainment cuts run 0.5 to 1 s; educational content can hold 4 to 5 s.
- Talking head: cut at sentence boundaries. Run `auto_remove_silence { layerId: "video_…", thresholdDb: -40, minSilenceMs: 500, paddingMs: 80 }`
  first (it rebuilds the layer into trimmed segments; take the checkpoint before it), then punch
  in on every second or third cut.
- Music-led: cut on beats; expocut-audio-post owns `beat_cut_from_drums`.

A snap punch-in is two hold keyframes, not a ramp; `interp` describes the curve leaving the
keyframe, so a hold on the 1.0 key keeps the frame still until it jumps:

```
keyframe_add { layerId: "video_…", property: "transform.scale", timeMs: 0, value: 1.0, interp: { type: "hold" } }
keyframe_add { layerId: "video_…", property: "transform.scale", timeMs: 4000, value: 1.1, interp: { type: "hold" } }
keyframe_add { layerId: "video_…", property: "transform.scale", timeMs: 8000, value: 1.0, interp: { type: "hold" } }
```

Alternate 1.0 and 1.1 at each chosen cut. For a settle instead of a snap, ease back:
`keyframe_add { layerId: "video_…", property: "transform.scale", timeMs: 4000, value: 1.1, interp: { type: "preset", name: "easeOut" } }`
followed by a 1.0 key 400 ms later. Times are project-timeline milliseconds, so a clip that
starts at 12 s gets keys at 12000 and up; a text layer cannot host scale keys for a video.

### 3. Durations that fit distribution

| platform | sweet spot | note |
| --- | --- | --- |
| TikTok | 21 to 34 s entertainment; 60 to 90 s educational | completion is the first signal; over 50 percent completion earns pushes |
| Shorts | 15 to 30 s | roughly 65 percent retention needed under 30 s; loops count as watch time |
| Reels | 7 to 15 s punchy; 30 to 60 s value | watch time and sends outrank likes |

Under 15 s, build a seamless loop: make the last shot match the opening shot and end mid-motion.
`trim_layer { layerId: "video_…last", durationSec: 2.6 }` so the final frame resembles the first,
and never add a "thanks for watching" outro to short-form.

### 4. Safe zones

Platform UI covers the edges. In canvas percent (measured on 1080 x 1920, valid for any 9:16 size):

- TikTok: top 10, bottom 18, right 12. Reels: top 13, bottom 21, right 14. Shorts: top 10, bottom 21, right 12.
- Universal cross-platform zone: x from 9 to 91, y from 14 to 86. Practical rule: hook text at
  y 15 to 22; captions and CTAs no lower than y 78; nothing important in the right 14 percent.

Check numerically before spending an image: `describe_canvas { timeSec: 0.5 }` returns each visible
layer's box as `{ x, y, w, h }` in percent; text is safe when `y >= 14`, `y + h <= 79` and
`x + w <= 86`. Then confirm visually with `capture_canvas { timeSec: 0.5, grid: true }` (10 percent
grid) and fix with `update_layer { id: "text_…", patch: { position: { x: 0, y: 18 } } }` or a
smaller `fontSize` through `update_text`.

### 5. Signals to optimise

1. Completion and watch time, everywhere.
2. Sends per reach (DM shares) on Instagram: frame content as "send this to someone who".
3. Likes are the weakest signal; never trade the first two for them.

Plan the cover: one readable three to five word frame. `render_still { timeSec: 0.4, format: "png" }`
writes it to a file for the Shorts thumbnail; Reels covers must survive a centred 1:1 crop, so keep
that frame's text inside x 22 to 78.

### 6. Verify

```
preview_filmstrip { fromSec: 0, toSec: 3, frames: 6 }        // would you stop scrolling? is the hook readable in frame 0?
preview_filmstrip { fromSec: 0, toSec: 30, frames: 12 }      // any 5 s window with nothing changing is a swipe risk
describe_canvas { timeSec: 0.5 }                              // safe-zone numbers
capture_canvas { timeSec: 0.5, grid: true }                   // safe-zone eyes
```

Both filmstrip calls need the editor on screen and cost one image per frame; use the
`describe_canvas` readout first when you only need placement.

## Tools you will use

| tool | what for | key params (units) |
| --- | --- | --- |
| trim_layer | open mid-action, shorten, move a clip | layerId*, mediaOffsetSec, durationSec, startTimeSec (s) |
| split_layer | cut a clip at a moment | layerId*, atSec (s, relative to the layer start) |
| add_text_layer | the text hook | text*, fontSize, fontWeight, y (percent), startTime, duration (s), transitionIn (list_transitions id), textStrokeColor/Width, textAutoFit |
| update_text / update_layer | resize or move the hook | layerId + text fields; id + patch { position } |
| set_layer_transition | pattern interrupt on one clip | layerId*, in { id: "whippan" or "flash" or "zoomBlur", durationSec } |
| keyframe_add | snap punch-in | layerId*, property "transform.scale", timeMs (ms, timeline), value, interp { type: "hold" } |
| keyframe_clear | remove a punch-in track | layerId*, property |
| auto_remove_silence | sentence-boundary cuts on a talking head | layerId*, thresholdDb, minSilenceMs, paddingMs |
| stock_search_music / add_stock_music_layer | whoosh or riser at t=0 | query, category "sfx", maxDuration; soundId, startTime, duration, volume |
| describe_canvas / capture_canvas | safe-zone numbers / grid picture | timeSec; grid: true |
| preview_filmstrip | hook and cadence review | fromSec, toSec, frames 1..12 |
| render_still | cover frame file | timeSec, format png/jpg |
| get_canvas_info / list_layers | length, aspect, ids | none |
| save_history_checkpoint / undo_to_checkpoint | revert the whole pass | label; id |

## Recipes

### 1. Talking-head retention pass (Shorts, 25 s target)

```
save_history_checkpoint { label: "before retention pass" }
list_layers                                                       // video_… is the talking head
auto_remove_silence { layerId: "video_…", thresholdDb: -40, minSilenceMs: 450, paddingMs: 80 }
list_layers                                                       // re-read: segments are new ids with new startTimes
add_text_layer { text: "Stop exporting at 480p", fontSize: 60, fontWeight: "800", textColor: "#FFFFFF", fontFamily: "din-condensed", y: 17, startTime: 0, duration: 2.2, transitionIn: "slideUp", transitionInDuration: 0.25, textStrokeColor: "#000000", textStrokeWidth: 3 }
keyframe_add { layerId: "video_…seg2", property: "transform.scale", timeMs: 5200, value: 1.1, interp: { type: "hold" } }
keyframe_add { layerId: "video_…seg3", property: "transform.scale", timeMs: 10800, value: 1.0, interp: { type: "hold" } }
describe_canvas { timeSec: 0.4 }
preview_filmstrip { fromSec: 0, toSec: 25, frames: 10 }
```

Captions for the muted majority come next from expocut-kinetic-captions. Keyframe times are
timeline milliseconds, so use each segment's own startTime (from `list_layers`, in seconds, times 1000).

### 2. Twelve-second loop reel (Reels)

```
get_canvas_info
trim_layer { layerId: "video_…open", mediaOffsetSec: 1.4, durationSec: 4 }      // start on the action
trim_layer { layerId: "video_…close", durationSec: 3.2 }                        // end on a frame that matches the opener
set_layer_transition { layerId: "video_…mid", in: { id: "whippan", durationSec: 0.3 } }
add_text_layer { text: "Send this to your co-founder", fontSize: 56, fontWeight: "700", textColor: "#FFFFFF", y: 20, startTime: 0, duration: 3, transitionIn: "fadeIn", transitionInDuration: 0.2 }
render_still { timeSec: 0.3, format: "png" }                                     // cover
preview_filmstrip { fromSec: 0, toSec: 12, frames: 8 }
```

End mid-motion; do not fade to black. The last frame and the first frame should read as one shot.

## Pitfalls

- `keyframe_add` takes milliseconds on the project timeline. Seconds in `timeMs` place every
  key inside the first few milliseconds and the punch-in never shows.
- `interp` is the curve leaving that keyframe. A hold on the 1.1 key keeps the punch until the
  next key; a linear (default) 1.1 key ramps into whatever follows.
- `auto_remove_silence` replaces the layer with trimmed segments; re-run `list_layers` before
  touching ids, and take a checkpoint first.
- `add_text_layer` ignores `x` while `fullWidth` is true (the default). Use `y` for the safe zone
  and `textAlign` for horizontal placement; `verticalAnchor` and `y` are alternatives, not a pair.
- `preview_filmstrip` and `capture_canvas` need the editor on screen; `describe_canvas` does not.
- Safe-zone percentages assume a 9:16 canvas; for 1:1 or 16:9 keep text inside the middle 80
  percent and re-check with `describe_canvas`.
- Cut-level transitions between two clips use `set_junction_transition`, whose ids differ from
  `list_transitions`; leave those to expocut-social-speed-edit. `set_layer_transition` on the
  incoming layer is the executable shortcut used above.

## Reference

- Executing skills: expocut-video-creating, expocut-social-speed-edit, expocut-audio-post,
  expocut-kinetic-captions, expocut-motion-graphics, expocut-editor-ops.
- Full tool list and conventions: https://expocut.com/mcp.html
