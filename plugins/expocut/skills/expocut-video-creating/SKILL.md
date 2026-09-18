---
name: expocut-video-creating
description: "Entry skill for making any video in the ExpoCut mobile editor through its in-app MCP server: asks two or three intent questions (platform, length, vibe, source), creates or opens the project, adds video, image and audio from local files or Pexels and Freesound stock, sequences clips, trims and splits, drops a title, previews cheaply, saves and exports. Use whenever someone says make a video, reel, TikTok, Short, YouTube video, promo, montage, slideshow, edit my clips, add stock footage, add music, put a title on it, trim, split, export, render, or wants to start. Also the router: it names all sixteen expocut-* specialists (editor-ops, motion-graphics, compositing, social-speed-edit, color-grading, fx-looks, audio-post, voice-narration, kinetic-captions, data-widgets, shapes-layouts, template-import, templates-brand, reel-templates, asset-authoring, retention-playbook) with trigger phrases. Not for keyframes, grading, captions, stems or template authoring alone; open that sibling."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# Creating a video with ExpoCut

You are the editor sitting inside the user's ExpoCut project, driving it through the in-app
MCP server. Every call changes the live project on their phone, so work in small, previewable
steps, use only the ids the tools return, and confirm before removing anything.

## When to use / hand off

Use this skill for the everyday flow: intent, project, media, cuts, a title, preview, export.
The moment a request becomes specialised, open the sibling skill instead of improvising here.

| open | when the user says |
| --- | --- |
| expocut-editor-ops | open, rename, duplicate or delete a project; undo, go back, checkpoint; what is on the canvas, screenshot the frame; hide or mute a track; export settings, 4K, 60 fps, is the export done; which layer fields can I patch; seconds versus milliseconds |
| expocut-motion-graphics | animate, keyframes, easing, move, grow, spin over time, motion path, camera move, parallax, animated mask |
| expocut-compositing | blend mode, track matte, alpha, adjustment layer, parent a layer, freeze frame, reverse, time remap, crop, anchor, contain or cover, chroma key, green screen, mask, fade on edge, detach audio from video |
| expocut-social-speed-edit | punchy, TikTok or CapCut style, speed ramp, zoom punch, transition between two clips, whip pan, cut on the beat |
| expocut-color-grading | LUT, CDL, cinematic grade, teal and orange, match colour across clips, brightness, saturation, hue, light region |
| expocut-fx-looks | effect, shader background, VHS, glitch, film grain, light leak, glow, border, vignette, procedural filter |
| expocut-audio-post | stems, remove vocals, duck the music, beat detection, loudness, LUFS, remove silence, audio effects, audio fades |
| expocut-voice-narration | voiceover, narrate this, TTS, read the script, transcribe, captions from the narration |
| expocut-kinetic-captions | captions, subtitles, karaoke text, animated text, typewriter, lower third, fonts, text style, Urdu or Arabic, video in text |
| expocut-data-widgets | chart race, counter, countdown, scoreboard, poll, ticker, QR code, weather card, phone mockup |
| expocut-shapes-layouts | shape, gradient, mesh, brush stroke, split screen, layout, SVG logo, shape widget |
| expocut-template-import | Lottie, FCPXML, .mogrt, OTIO, export to Lottie or FCPXML, font fallback, codec support |
| expocut-templates-brand | template, reel, theme, brand kit, brand profile, logo, community submission |
| expocut-reel-templates | write or fix a .ectpl reel template JSON |
| expocut-asset-authoring | register a custom effect, LUT, border preset, mask shape, light leak or fade mask |
| expocut-retention-playbook | hook, go viral, watch time, retention, best length, safe zone, seamless loop |

## Before you start

Ask at most three short questions, then act:

1. Platform and length: Reels/TikTok/Shorts are 9:16 and 7 to 60 s; YouTube is 16:9; grid posts
   are 1:1 or 4:5. This fixes `aspectRatio` and the target duration.
2. Vibe: cinematic, upbeat social, vlog, tutorial, promo. This picks pacing, music and the title look.
3. Source: the user's own clips (they must already be on the phone; tools take `file://` URIs or absolute paths) or
   stock (Pexels video/photos, Freesound music), and whether they want music.

Then check state: `get_active_project` never throws (`projectId: null` means nothing is open);
`list_projects` shows what exists. Conventions every call obeys:

- `startTime`, `duration`, `mediaOffsetSec`, `*Sec` arguments are seconds. Keyframe `timeMs`
  and `fadeInMs`/`fadeOutMs` are milliseconds. Positions `x`/`y` are the layer's top-left corner
  in percent of the canvas (0..100).
- A new layer always lands in front (`trackIndex 0`) and pushes everything else back. Add
  backgrounds first, or send them back with `reorder_layer { layerId, position: "back" }`.
- Layer ids are generated (`video_m2k1…`, `text_m2k1…`). Never guess one; use the id the add
  call returned, or `list_layers`.
- Every layer tool needs an open project; `capture_canvas`, `preview_filmstrip`, `render_still`
  and `export_project` also need the editor screen mounted. `open_project` navigates there.

## Core workflow

1. Project. New: `create_project { name: "Coffee promo", aspectRatio: "9:16", fps: 30 }` returns
   `id`; then `open_project { id }`. Existing: `list_projects`, then `open_project { id }`.
   Opening reloads the project from disk, so open once, not before every step.
2. Frame. `get_canvas_info` reports aspect, fps, duration, counts and playhead without an image.
   Set the output early, because it also sizes the canvas and the editor's own default is 480p/low:
   `set_export_settings { resolution: "1080x1920", quality: "high", format: "mp4", fps: 30 }`.
3. Background (optional, first so it stays behind everything):
   `add_shape_layer { shape: "rectangle", gradientColors: ["#0F0F1E", "#2D1B69"], gradientDirection: "vertical", stretchToCanvas: true, startTime: 0, duration: 15 }`.
4. Media. Video and image layers fit the screen by default (`stretchToCanvas: true`, fill); pass
   `stretchToCanvas: false` to letterbox.
   - Own clips: `add_video_layer { uri: "/var/mobile/…/IMG_0101.mp4", startTime: 0, duration: 4.5, mediaOffsetSec: 2 }`.
     `duration` defaults to 5 s, not the file length, so pass the real length or the trim you want.
     `add_image_layer { uri, startTime, duration }` (5 s default). `add_audio_layer { uri, duration, volume }` requires `duration`.
   - Stock video: `stock_search_videos { query: "coffee pour", orientation: "portrait", perPage: 8, minDuration: 5 }`,
     then `add_stock_video_layer { videoId: 6963395, startTime: 0, duration: 4, qualityHint: "best" }` (id is an example).
     Duration defaults to the Pexels clip length. `stock_popular_videos` and `stock_curated_photos` browse without a query.
   - Stock photo: `stock_search_photos { query: "latte art", orientation: "portrait", color: "brown" }`,
     then `add_stock_image_layer { photoId: 36620444, startTime: 4, duration: 3 }`.
   - Several clips in one call: `add_clip_sequence` (see recipe 2). It places clips back to back,
     adds a push-in, an out-transition and an optional label per clip, and returns the real ids.
5. Music. `stock_search_music { query: "upbeat acoustic", category: "music", sort: "downloads_desc", minDuration: 15, maxDuration: 60 }`
   returns `id`, `duration`, `license` and a preview url; then
   `add_stock_music_layer { soundId: 123456, startTime: 0, duration: 15, volume: 0.6, fadeInMs: 300, fadeOutMs: 1200 }`.
   Freesound clips are the public preview MP3s (fine for social); quote the `license` field to the user.
   Silence a clip's own sound with `mute_video_audio { layerId, muted: true }`.
6. Cuts. `trim_layer { layerId, mediaOffsetSec: 2, durationSec: 4, startTimeSec: 0 }` (any subset);
   `split_layer { layerId, atSec: 2 }` (relative to the layer start; the second half is a new id);
   `set_layer_speed { layerId, speed: 2, keepPitch: true }` (rescales the timeline duration);
   `reorder_layer { layerId, position: "back" }`; `remove_layer { id }` only after the user agrees.
   Cut-level transitions between two clips belong to expocut-social-speed-edit; a simple entrance on
   one layer is `set_layer_transition { layerId, in: { id: "fadeIn", durationSec: 0.4 } }`.
7. Title. `add_text_layer { text: "Wake up different.", fontSize: 72, fontWeight: "700", textColor: "#FFFFFF", fontFamily: "avenir-next", verticalAnchor: "center", startTime: 0.4, duration: 3, transitionIn: "fadeIn", transitionInDuration: 0.4, textShadowColor: "#000000", textShadowBlur: 24 }`.
   Text spans the full width and centres by default; `verticalAnchor` is top (y 12), center or
   bottom (y 86). Duration defaults to 3 s. Edit later with `update_text { layerId, text, fontSize }`.
   Fonts come from `list_fonts`; captions, lower thirds and text animation live in expocut-kinetic-captions.
8. Preview. `describe_canvas { timeSec: 2 }` is free and lists every visible layer with its box in
   percent, top-most first; use it first. `capture_canvas { timeSec: 2 }` returns the frame as an image
   (default 512 px wide, `grid: true` overlays a 10 percent grid). `preview_filmstrip { fromSec: 0, toSec: 15, frames: 8 }`
   shows pacing across the whole piece.
9. Ship. `save_project` (writes projects.json now; the editor also autosaves every 30 s while it is
   on screen), then `export_project`. It blocks until the file is written, can take minutes, needs the
   phone awake and the editor mounted, and returns `{ uri }`. `get_render_status` from a second
   connection reports `isExporting` and `lastExportUri`.

## Tools you will use

| tool | what for | key params (units) |
| --- | --- | --- |
| create_project | new empty project, returns id | name*, aspectRatio "9:16"/"16:9"/"1:1"/"4:5", fps |
| open_project | load + navigate to the editor | id* |
| list_projects / get_active_project | find what exists / what is open | none |
| set_export_settings | output and canvas size | resolution "1080x1920" or "1080p", quality low/medium/high, format mp4/mov, fps 1..120 |
| get_canvas_info / describe_canvas | frame facts / what is visible at a time, no image | timeSec (s) |
| add_video_layer / add_image_layer / add_audio_layer | local files | uri* file://, startTime (s), duration (s, required for audio), mediaOffsetSec, volume 0..1, stretchToCanvas |
| stock_search_videos / stock_search_photos | Pexels search | query*, orientation landscape/portrait/square, size, minDuration/maxDuration (s), perPage |
| stock_popular_videos / stock_curated_photos | Pexels feeds without a query | page, perPage, minDuration/maxDuration |
| add_stock_video_layer / add_stock_image_layer | download + place | videoId or photoId (or url), startTime, duration, qualityHint best/sd |
| stock_search_music / stock_trending_music | Freesound search / feed | query, category music/sfx/ambient/vocals/nature/electronic/cinematic/all, sort, minDuration/maxDuration |
| add_stock_music_layer | download + place audio | soundId (or url), startTime, duration (default full clip), volume 0..1, fadeInMs/fadeOutMs |
| add_clip_sequence | N clips back to back with push-in, transitions, labels | clips[] {uri or videoId or stockQuery, durationSec*, label}, transitionStyle, transitionDurationSec, pushIn, labelPosition, labelFontSize, labelFontFamily |
| trim_layer / split_layer / set_layer_speed | cuts | layerId*, mediaOffsetSec/durationSec/startTimeSec; atSec; speed 0.1..100 |
| reorder_layer / remove_layer | z-order / delete | layerId*, position front/back/number; id* |
| mute_video_audio / set_layer_fade | clip sound off / fade envelope | layerId*, muted; fadeInMs, fadeOutMs |
| add_text_layer / update_text | title / edit it | text*, fontSize, fontWeight, textColor, fontFamily, verticalAnchor, startTime, duration, transitionIn/Out (ids from list_transitions), transitionInDuration (s) |
| set_layer_transition | entrance/exit on one layer | layerId*, in {id, durationSec}, out {id, durationSec} |
| capture_canvas / preview_filmstrip | look at the frame / at pacing | timeSec, maxWidth, grid; fromSec, toSec, frames 1..12 |
| save_project / export_project / get_render_status | persist / render / poll | none |

## Recipes

### 1. Fifteen-second stock reel with music and a title (9:16)

```
create_project { name: "Morning brew", aspectRatio: "9:16", fps: 30 }          // → id
open_project { id: "proj_3f9a…" }                                                // example id
set_export_settings { resolution: "1080x1920", quality: "high", format: "mp4", fps: 30 }
stock_search_videos { query: "coffee pour slow motion", orientation: "portrait", perPage: 6, minDuration: 5 }
add_stock_video_layer { videoId: 6963395, startTime: 0, duration: 5 }            // clip A (example id)
add_stock_video_layer { videoId: 5386411, startTime: 5, duration: 5 }            // clip B
add_stock_video_layer { videoId: 7438482, startTime: 10, duration: 5 }           // clip C
set_layer_transition { layerId: "video_…B", in: { id: "dissolve", durationSec: 0.5 } }
set_layer_transition { layerId: "video_…C", in: { id: "dissolve", durationSec: 0.5 } }
stock_search_music { query: "warm acoustic morning", category: "music", minDuration: 15 }
add_stock_music_layer { soundId: 123456, startTime: 0, duration: 15, volume: 0.6, fadeOutMs: 1500 }
add_text_layer { text: "Wake up different.", fontSize: 72, fontWeight: "700", textColor: "#FFF3D6", fontFamily: "avenir-next", verticalAnchor: "center", startTime: 0.5, duration: 3.5, transitionIn: "fadeIn", transitionInDuration: 0.5, textShadowColor: "#000000", textShadowBlur: 24 }
describe_canvas { timeSec: 1.5 }
capture_canvas { timeSec: 1.5 }
save_project
export_project                                                                    // → { uri }
```

Stock clips mute nothing by themselves; if the footage carries noisy audio, run
`mute_video_audio { layerId, muted: true }` on each clip before exporting.

### 2. The user's own clips as a labelled montage

```
add_clip_sequence {
  clips: [
    { uri: "/var/mobile/…/IMG_0101.mp4", durationSec: 4, label: "Kitchen" },
    { uri: "/var/mobile/…/IMG_0102.mp4", durationSec: 3.5, label: "Living room" },
    { stockQuery: "city skyline sunset", durationSec: 4 }
  ],
  startTimeSec: 0, transitionStyle: "dissolve", transitionDurationSec: 0.5,
  labelPosition: { x: 8, y: 80 }, labelFontSize: 44, labelFontFamily: "avenir-next", labelDurationSec: 3
}
```

The result lists each clip's `videoLayerId` and `labelLayerId` plus warnings (a hard cut, a label
clamped to its clip). Clips are placed back to back from `startTimeSec`; a `stockQuery` takes the
first landscape Pexels result at SD quality. Pass `pushIn: false` to skip the slow zoom. Pass a
`labelFontFamily` from `list_fonts`; the built-in default is not a bundled font id. Then add the
title and music from recipe 1 and preview with `preview_filmstrip { fromSec: 0, toSec: 11.5, frames: 8 }`.

### 3. Quick fix on an existing project

```
list_projects                                   // pick the id by name
open_project { id: "proj_…" }
list_layers                                     // ids, types, startTime/duration in seconds
trim_layer { layerId: "video_…", mediaOffsetSec: 1.2, durationSec: 6 }
split_layer { layerId: "video_…", atSec: 3 }    // second half gets a new id
update_text { layerId: "text_…", text: "Now open in Lahore", fontSize: 64 }
describe_canvas { timeSec: 3.5 }
save_project
export_project
```

## Pitfalls

- `add_video_layer` and `add_image_layer` default to 5 s regardless of the file; `add_audio_layer`
  refuses to guess and requires `duration`. Stock video layers default to the Pexels length.
- Seconds everywhere on tool arguments, but `list_layers` reports seconds while `get_layer` reports
  the stored milliseconds. Do not paste a `get_layer` startTime into a patch; see expocut-editor-ops.
- New layers go to the front. A background added last hides the whole video; send it back with
  `reorder_layer { layerId, position: "back" }`.
- `add_text_layer` uses `verticalAnchor` or `y`, not both; `x` is ignored while `fullWidth` is true
  (the default). Pass `fullWidth: false` with `x` for a left-aligned block.
- `remove_layer` and `delete_project` have no confirmation and no built-in undo. Take
  `save_history_checkpoint { label: "before cleanup" }` before automated passes (expocut-editor-ops).
- `open_project` replaces the in-memory session with the saved copy. Unsaved MCP edits are lost if
  you reopen; call `save_project` first.
- `export_project`, stock downloads and `preview_filmstrip` take seconds to minutes and need the
  phone unlocked with ExpoCut in front. Prefer `describe_canvas` over images while iterating.
- `add_clip_sequence` writes its push-in and label keyframes at 0..duration ms for every clip,
  while the canvas evaluates keyframes on the project timeline; on clips after the first, check the
  motion with `preview_filmstrip` and re-author with `keyframe_add` at timeline times if it looks static.
- The junction ids quoted in `set_junction_transition` differ from `list_transitions`; leave cut
  transitions to expocut-social-speed-edit rather than guessing.

## Reference

- Full tool list and conventions: https://expocut.com/mcp.html
- Siblings named in the routing table above; expocut-editor-ops for undo, inspection and export
  details, expocut-retention-playbook for hooks, pacing and safe zones.
