---
name: expocut-audio-post
description: "Mixes and post-produces audio in ExpoCut through its in-app MCP server - on-device stem separation (vocals, drums, bass, other), karaoke and vocal isolation, per-stem mixes, auto-ducking music under a vocal stem, beat times from the drum stem, audio-reactive zoom, flash and wobble, AI dialogue denoise, silence removal, loudness targets and gain maths, 37 per-layer audio effects, 25 audio in/out transitions, volume automation, fades, sync offsets, and royalty-free music from Freesound. Use when the user mentions stems, remove vocals, instrumental, karaoke, isolate the voice, duck the music, mix voice and music, beat sync, cut on the beat, pulse with the bass, clean up audio, denoise, hiss, hum, silence, LUFS, loudness, too quiet, too loud, compressor, EQ, reverb, fade the music, crossfade, lip-sync offset, or background music. Do not use for generating a voiceover or transcribing speech (expocut-voice-narration) or for caption styling (expocut-kinetic-captions)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Audio post-production

You are the mix engineer. Everything here is non-destructive: stems are new audio
layers, ducking is a volume curve on the music layer, effects and transitions are
fields on the layer, and the source files are never rewritten. `clean_audio` is
the one tool that writes a new file - and it keeps the original layer's media.

## When to use / hand off

| Need | Go to |
| --- | --- |
| Generate narration, transcribe speech, captions from a file | expocut-voice-narration |
| Caption styling, karaoke text | expocut-kinetic-captions |
| Placing the video cuts on the beat times you found | expocut-social-speed-edit |
| Layer opacity/scale keyframes not driven by audio | expocut-motion-graphics |
| Projects, undo, playback, export status | expocut-editor-ops |

## Before you start

1. `get_active_project {}` then `list_layers {}` - find the audio and video ids,
   their `startTime`/`duration` (seconds) and which layer carries the voice.
   `list_tracks {}` gives track ids for `set_track_volume` / `set_track_mute`.
2. Know what needs a model. `separate_audio` tier `fast` runs a model-free DSP
   path on the device (no download); tier `studio` downloads the studio separation model from the
   CDN on first use (hundreds of MB, needs network and the phone awake) and falls
   back to fast on low-memory devices (`fellBack: true` in the result).
   `clean_audio` needs a build with the native denoise engine and downloads its
   model on first use. If the stems come back silent, the build has no native
   separation module; judge results on a real device, not the simulator.
3. Stem layers are deterministic: `<sourceLayerId>__stem_vocals`, `__stem_drums`,
   `__stem_bass`, `__stem_other`. They inherit the source's start, in-point and
   speed and sit on rows behind it. `separate_audio` also returns each stem's
   `layerId` and file `uri`.
4. Model-backed calls block for many seconds. Set a generous client timeout and
   `save_history_checkpoint { label }` before a call that adds layers.

## Core workflow

1. Identify sources: music layer, voice layer (or a video whose embedded audio is
   the voice - `unlink_video_audio { videoLayerId }` gives it its own audio layer).
2. Separate when you need components: `separate_audio`, or the one-call wrappers
   `remove_vocals` (instrumental) and `isolate_voice` (dialogue boost).
3. Balance: `set_stem_mix` for stems, `update_layer { id, patch: { volume } }`
   (0..1) for a whole layer, `set_track_volume` (0..2.5) when you need a boost.
4. Duck the music under speech: `auto_duck` (recipe 1).
5. Clean dialogue: `clean_audio`, then an effect chain with `set_layer_audio_effects`.
6. Rhythm: `beat_cut_from_drums` for cut times, `set_audio_reactive` for a layer
   that pulses with a stem.
7. Polish: `set_layer_fade`, `set_layer_audio_transitions`, `set_layer_audio_offset`.
8. Loudness: pick a target with `list_loudness_targets`, compute gain with
   `gain_to_loudness_target`, apply it (recipe 5).
9. Verify: `seek { timeSec }`, `play {}`, `playback_status {}`, `pause {}`; then
   export through expocut-editor-ops and listen to the file.

## Tools you will use

| Tool | What for | Key params |
| --- | --- | --- |
| `separate_audio` | 4 stems as new layers | `layerId`, `tier` fast/studio, `stems[]`, `mutedStems[]` (vocals/drums/bass/other/noise) |
| `remove_vocals` | instrumental / karaoke | `layerId`, `tier` |
| `isolate_voice` | vocal up, rest down | `layerId`, `boostDb` (default 6; others ducked -12 dB), `tier` |
| `set_stem_mix` | stem faders | `sourceLayerId`, `mix[]` of `{ stem, volume 0..1, muted }` |
| `beat_cut_from_drums` | onset times | `sourceLayerId` (must be separated), `sensitivity` (1.5; higher = fewer), `maxCuts`; returns `cutTimesMs` |
| `set_audio_reactive` | property follows a stem | `targetLayerId`, `stemLayerId`, `stem`, `presetId` bass-zoom-pulse / kick-zoom-soft / vocal-flash-opacity / drum-wobble-rotate, `intensity` 0..1 |
| `auto_duck` | music under voice | `musicLayerId`, `vocalSourceLayerId` (a layer that has been separated), `duckDb` negative, default -12 |
| `swap_music` | strip the music stems | `sourceLayerId`, `includeDrums` |
| `clean_audio` | AI denoise / speech enhance | `layerId`, `strength` 0..1 (0.85) |
| `auto_remove_silence` | ripple-delete gaps | `layerId`, `thresholdDb` (-40), `minSilenceMs` (500), `paddingMs` (80) - returns `newLayerIds`, the source id is gone |
| `set_layer_audio_effects` | effect chain | `layerId`, `effects[]` of `{ effectId, enabled?, params? }` - replaces the whole chain; `[]` clears |
| `list_audio_effects` | 37 ids with params/ranges | none |
| `set_layer_audio_transitions` | audio in/out | `layerId`, `in`/`out`: `{ transitionId, durationMs (500), params }` or `null` |
| `list_audio_transitions` | 25 ids with canIn/canOut | none |
| `set_layer_volume_keyframes` | volume automation | `layerId`, `keyframes[]` of `{ timeMs, volume 0..1 }`; `[]` clears |
| `set_layer_fade` | fades | `layerId`, `fadeInMs`, `fadeOutMs` (0 clears) |
| `set_layer_audio_offset` | sync nudge | `layerId`, `offsetMs` (positive = later) |
| `mute_video_audio` / `unlink_video_audio` / `relink_video_audio` | embedded audio | `layerId`, `muted` / `videoLayerId` / `audioLayerId` |
| `stock_search_music` / `stock_trending_music` | Freesound | `query`, `category` all/music/sfx/ambient/vocals/nature/electronic/cinematic (default music), `sort`, `minDuration`/`maxDuration` seconds, `perPage` |
| `add_stock_music_layer` | add a Freesound clip | `soundId` (or `url`), `startTime`, `duration` (seconds, default full clip), `volume`, `fadeInMs`, `fadeOutMs` |
| `add_audio_layer` | any local file | `uri`, `duration` required (seconds), `startTime`, `mediaOffsetSec`, `volume` |
| `list_loudness_targets` / `gain_to_loudness_target` / `build_loudness_plan` / `measure_loudness` | loudness | see recipe 5 |

## Recipes

### 1. Voice over music, ducked

```
stock_search_music { query: "upbeat acoustic", category: "music", minDuration: 30, maxDuration: 120 }
add_stock_music_layer { soundId: 123456, startTime: 0, duration: 45, volume: 0.8, fadeInMs: 500, fadeOutMs: 1500 }   // example id -> returns { id: "audio…" }
separate_audio { layerId: "audio0", tier: "fast", mutedStems: ["vocals", "drums", "bass", "other"] }   // the VOICE layer (example id): stems muted, they only feed detection
auto_duck { musicLayerId: "audio1", vocalSourceLayerId: "audio0", duckDb: -15 }
```

`auto_duck` detects speech from the vocal stem's RMS (50 ms windows, gaps under
250 ms merged), writes `volumeKeyframes` on the music layer every 100 ms with a
150 ms attack and 400 ms release, and replaces any curve already there. -12 dB
suits light beds, -15 to -18 dense music, -22 when the voice is quiet. Inspect
with `get_layer { layerId: "audio1" }` (`volumeKeyframes`), hand-edit with
`set_layer_volume_keyframes`. The muted stems still work for `auto_duck` because
it reads the stem file, not the layer's volume.

### 2. Karaoke, then the silence drop

```
remove_vocals { layerId: "audio0", tier: "studio" }                       // vocal stem muted, three stems audible
set_stem_mix { sourceLayerId: "audio0", mix: [ { stem: "vocals", volume: 0.2, muted: false }, { stem: "drums", volume: 1 } ] }
set_layer_volume_keyframes { layerId: "audio0__stem_bass", keyframes: [ { timeMs: 0, volume: 1 }, { timeMs: 14000, volume: 1 }, { timeMs: 14050, volume: 0 }, { timeMs: 16000, volume: 0 }, { timeMs: 16050, volume: 1 } ] }
```

Repeat the last call for `audio0__stem_other` to drop everything but drums for
one bar before the payoff. The original layer `audio0` still plays the full mix:
mute it with `update_layer { id: "audio0", patch: { audioMuted: true } }` (or
`mute_video_audio` when the source is a video layer) - through MCP, separation
leaves the source audible.

### 3. Beat times and an audio-reactive title

```
separate_audio { layerId: "audio0", tier: "fast" }
beat_cut_from_drums { sourceLayerId: "audio0", sensitivity: 1.8, maxCuts: 12 }   // -> cutTimesMs from the start of the music FILE
set_audio_reactive { targetLayerId: "text0", stemLayerId: "audioBass", stem: "bass", presetId: "bass-zoom-pulse", intensity: 0.8 }   // stemLayerId = the bass stem's layerId from separate_audio, i.e. audio0__stem_bass
```

Timeline time = music `startTime` + (cut - `mediaOffset`) - both in ms on
`get_layer`. Hand the times to expocut-social-speed-edit for the cuts. Presets:
bass-zoom-pulse scales 1 to 1.15, kick-zoom-soft 1 to 1.06, vocal-flash-opacity
0.7 to 1, drum-wobble-rotate 0 to 4 degrees; `intensity` scales the swing. The
binding is stored on the target layer and baked into keyframes at export.

### 4. Dialogue cleanup chain

```
clean_audio { layerId: "video0", strength: 0.8 }   // video: source muted + new cleaned audio layer (cleanedAudioLayerId); audio layer: replaced in place
set_layer_audio_effects { layerId: "audio2", effects: [
  { effectId: "high_pass", params: { cutoff: 90 } },
  { effectId: "compressor", params: { threshold: -18, ratio: 3, attack: 10, release: 120, makeupGain: 3 } },
  { effectId: "vocal_enhance", params: { presence: 4, deEss: 35 } }
] }
```

Params are numbers in the ranges `list_audio_effects` reports (see
`references/audio-effects.md`); omitted params use the defaults. For a mild
touch use `de_noise` in the chain instead of `clean_audio`.

### 5. Loudness pass

```
list_loudness_targets {}                                        // tiktok -14, spotify -14, youtube -14, appleMusic -16, broadcastEbu -23, broadcastUs -24 LUFS
gain_to_loudness_target { currentLufs: -20.5, target: "youtube", maxBoostDb: 12 }   // -> gainDb 6.5
set_track_volume { trackId: "track-audio-1", volume: 2.1 }     // 10^(6.5/20) = 2.11; track id from list_tracks
```

`measure_loudness { samplesBase64, sampleRate }` needs base64 Float32 mono PCM;
no MCP tool exports a layer's samples, so it is only practical when the client
itself holds the audio file (desktop). On the phone, work from a known or
estimated LUFS. `build_loudness_plan { rows: [ { clipId, name, measurement:
{ integratedLufs, maxShortTermLufs, truePeakDbtp, gatedBlocks } } ], target:
"tiktok", mode: "absolute" }` returns per-clip `gainDb` entries; nothing in the
export path consumes the plan, so apply each gain yourself (dB to linear gain is
10^(dB/20): -6 dB = 0.5, +6 dB = 2). Layer `volume` is a 0..1 fader, so boosts
go through `set_track_volume` or a `compressor` `makeupGain` / `normalize` effect.

## Pitfalls

- Through MCP, `separate_audio`, `remove_vocals` and `isolate_voice` leave the
  source layer audible, so source and stems play together (the in-app panel
  mutes the source; the MCP path does not). Mute the source: `mute_video_audio
  { layerId, muted: true }` for video, `update_layer { id, patch: { audioMuted:
  true } }` for audio - or pass `mutedStems` when the stems are only for analysis.
- `auto_duck` and `beat_cut_from_drums` fail with "No vocal stem" / "No drum
  stem" until `separate_audio` (or a wrapper) has run on that source layer.
- `set_stem_mix` throws when the source has no stems; each entry needs `stem`.
  The `noise` stem is in the enum but the shipped 4-stem models never produce it.
- `separate_audio` adds four audio layers every time you call it; call it once per
  source. Studio on a long track can take minutes.
- `swap_music` only mutes stems (bass + other, plus drums with `includeDrums`);
  add the replacement with `add_stock_music_layer` yourself.
- Freesound results are preview MP3s; the app build must carry Freesound
  credentials (a 401 means it does not). Check each result's `license` before
  commercial use.
- `add_audio_layer` requires `duration` in seconds - the file length is not read.
- `set_layer_audio_effects` rejects unknown `effectId`s and overwrites the whole
  chain. `set_layer_audio_transitions` rejects unknown ids but does not check
  `canIn`/`canOut`, so respect the flags yourself (filter_sweep_in is in-only,
  reverb_tail out-only - the wrong role is stored but meaningless).
- `set_layer_fade`, `fadeInMs`, `durationMs`, `offsetMs`, `timeMs` are
  milliseconds; `startTime`, `duration`, `minDuration` are seconds.
- `auto_remove_silence` removes the source layer and returns new ids; it decodes
  the whole clip on the phone. Video and audio layers only.
- `set_audio_reactive` on a text layer needs the preset's property to apply
  (scale/opacity/rotation apply to image, text, shape and video layers).
- Confirm before `remove_layer`; use `update_layer { id, patch: { audioMuted: true } }`
  or `set_track_mute` to audition instead.

## Reference

- `references/audio-effects.md` - all 37 audio effects with categories and
  param ranges, and the 25 audio transitions with in/out capability.
- https://expocut.com/mcp.html - full tool reference.
- Siblings: expocut-voice-narration, expocut-social-speed-edit,
  expocut-kinetic-captions, expocut-editor-ops.
