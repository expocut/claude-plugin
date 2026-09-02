---
name: expocut-voice-narration
description: "Writes and places AI voiceover and transcribes speech in ExpoCut through its in-app MCP server - scripts written for the ear, the 14 on-device voices with quality grades, multi-voice scripts with pause markers, tts_validate_script pre-flight, tts_add_audio_layer placement with speed, volume and fades, on-device transcription of any audio or video file by uri, one-call transcript (caption) layers from that uri, ducking music under the narration, and loudness targets. Use when the user says voiceover, VO, narration, narrate this, text to speech, TTS, AI voice, read this script, British or American voice, transcribe, transcript, subtitles from the audio, captions from my recording, or wants a script written for a video. Do not use for caption styling and word-by-word animation (expocut-kinetic-captions), music and stem mixing beyond ducking (expocut-audio-post), or adding a voice file the user already has (expocut-video-creating)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---
# Voiceover and transcription

You write the script, pick the voice, generate the narration as an audio layer, and
turn speech into time-stamped text. Generation writes a new WAV and adds a layer;
transcription reads a file and returns segments. Neither modifies existing media.
Read every script back to the user before generating - synthesis is slow and the
user should not hear a first draft.

## When to use / hand off

| Need | Go to |
| --- | --- |
| Style the transcript layer, karaoke highlight, lower thirds | expocut-kinetic-captions |
| Stems, music selection, full mix, loudness beyond a gain | expocut-audio-post |
| Placing cuts to match the narration | expocut-social-speed-edit |
| Projects, undo, playback, export | expocut-editor-ops |

## Before you start

1. `get_active_project {}` and `list_layers {}` - a project must be open; note the
   video's `startTime`/`duration` (seconds) so the narration fits.
2. `tts_list_voices {}` - 14 voices with `id`, `name`, `gender`, `accent`, `grade`.
   Ids encode accent and gender: `af_` American female, `am_` American male,
   `bf_` British female, `bm_` British male. Grades A to C are the voice model's own
   quality ratings; af_heart (A) and af_bella (A-) are the safe defaults.
   `references/voices.md` has descriptions and best uses.
3. Models. The voice model must be downloaded in the app's TTS modal; without it
   `tts_add_audio_layer` silently falls back to the system voice, which ignores
   `[VOICE:]` switches and voice ids. The `tiny` or `base` transcription model must be downloaded
   in the app's Transcribe modal; `transcribe_audio` refuses to start a download
   and errors with "not downloaded" - ask the user to open that panel.
4. Getting a `uri`. The transcription tools take a file uri, never a layer id.
   Sources: `get_layer { layerId }` returns the full layer and its `content` field
   is the media path (video files work too - the audio is decoded to 16 kHz mono
   first); `tts_add_audio_layer`, `add_stock_music_layer` and
   `separate_audio` (per stem) return `uri` directly. For a video whose speech sits
   under music, `separate_audio` first and transcribe the vocal stem's uri.
5. Both engines run on the phone and block the call for many seconds; keep the
   phone awake and the client timeout generous.

## Writing for the ear

- The voices read about 150 words per minute at speed 1.0: 30 s of Reel is 70-80
  words, 60 s is 140-160. Trim before generating rather than speeding up.
- Short sentences, one idea each, the interesting word first. No lists longer
  than three items. Spell tricky brands phonetically ("chat gee pee tee").
- Pace with markers inside `text`: `...c` comma beat (160 ms), `...s` sentence
  pause (420 ms), `...p` paragraph pause (850 ms); a blank line also becomes a
  paragraph pause. `[VOICE: am_michael]` switches voice for the text that follows;
  repeat as needed. Pauses attach to the segment before them.

## Core workflow

1. Draft the script and read it back to the user.
2. `tts_validate_script { text, defaultVoice: "af_heart" }` - returns `segments`
   (voiceId, preview, pauseAfterMs), `perVoice` character counts and `totalPauseMs`
   without synthesising. Estimate duration as about 15 characters per second
   plus `totalPauseMs`.
3. `tts_add_audio_layer { text, voiceId, speed, startTime, volume, fadeInMs,
   fadeOutMs }` - returns `id`, `uri`, `durationMs`. Pass `voiceId` every time:
   the default differs between tools.
4. Fit the picture: if `durationMs` overshoots, regenerate at `speed: 1.1` or
   shorten the script; extend the video instead of clipping words.
5. Duck the music (recipe 1): `set_layer_volume_keyframes` from the known
   narration window, or `separate_audio` on the narration layer followed by
   `auto_duck` for speech-shaped ducking.
6. Captions: `add_caption_layer_from_audio { uri, language, startTime, y }` on
   the narration's `uri`, then hand styling to expocut-kinetic-captions.
7. Loudness: aim the narration at -14 LUFS for social; `gain_to_loudness_target`
   gives the dB, applied through `set_track_volume` (details in expocut-audio-post).
8. Verify: `seek { timeSec }`, `play {}`, `playback_status {}`; export through
   expocut-editor-ops and listen to the file.

## Tools you will use

| Tool | What for | Key params |
| --- | --- | --- |
| `tts_list_voices` | voice catalog | none |
| `tts_validate_script` | parse without synthesis | `text`, `defaultVoice` (defaults to am_michael) |
| `tts_add_audio_layer` | generate and place | `text` (with markers), `voiceId` (defaults to af_bella), `speed` 0.5..2, `pitch` semitones (fallback engine only), `sampleRate` 16000/22050/44100, `startTime` seconds, `duration` seconds (override), `volume` 0..1, `fadeInMs`, `fadeOutMs` |
| `transcribe_audio` | segments from a file | `uri`, `language` (e.g. "en", "ur"; omit = auto), `modelSize` tiny/base; returns `segments[] { text, startMs, endMs }` |
| `add_caption_layer_from_audio` | transcript layer from a file | `uri`, `language`, `modelSize`, `startTime` seconds (anchor for the segments), `x`, `y` top-left percent (default 50/80), `scale` |
| `get_layer` | read `content` (uri), `transcriptSegments` | `layerId` |
| `update_layer` | fix a mis-heard word | `id`, `patch: { transcriptSegments }` |
| `set_layer_volume_keyframes` | duck music by hand | `layerId`, `keyframes[] { timeMs, volume }` |
| `separate_audio` / `auto_duck` | speech-shaped ducking | see expocut-audio-post |
| `set_layer_fade` / `set_layer_audio_offset` | tails and sync | `fadeInMs`, `fadeOutMs` / `offsetMs` |
| `mute_video_audio` | silence the original speech under a re-voice | `layerId`, `muted` |

## Recipes

### 1. Two-voice product spot with ducked music

```
tts_validate_script { text: "[VOICE: af_heart] Meet the kettle that boils in ninety seconds. ...s [VOICE: am_fenrir] Ninety. ...c Seconds. ...p [VOICE: af_heart] Order today.", defaultVoice: "af_heart" }
tts_add_audio_layer { text: "[VOICE: af_heart] Meet the kettle that boils in ninety seconds. ...s [VOICE: am_fenrir] Ninety. ...c Seconds. ...p [VOICE: af_heart] Order today.", voiceId: "af_heart", speed: 1.0, startTime: 0.5, volume: 1, fadeInMs: 100, fadeOutMs: 250 }
```

The result gives `durationMs` (say 7400). Duck the music layer (example id
"audio0") over that window: keep 1.0 until 0.35 s, sit at 0.25 while the voice
talks, come back 0.4 s after it ends.

```
set_layer_volume_keyframes { layerId: "audio0", keyframes: [ { timeMs: 0, volume: 1 }, { timeMs: 350, volume: 1 }, { timeMs: 500, volume: 0.25 }, { timeMs: 7900, volume: 0.25 }, { timeMs: 8300, volume: 1 } ] }
```

For ducking that follows every phrase instead of one block, separate the
narration layer with its stems muted (they only feed detection; unmuted stems
would double the voice), then duck:

```
separate_audio { layerId: "audio1", tier: "fast", mutedStems: ["vocals", "drums", "bass", "other"] }
auto_duck { musicLayerId: "audio0", vocalSourceLayerId: "audio1", duckDb: -15 }
```

### 2. Caption a video's own speech

```
get_layer { layerId: "video0" }                                        // content is the media path - pass it as-is (a file:// uri or an absolute path)
transcribe_audio { uri: "/path/to/clip.mp4", language: "en", modelSize: "base" }   // read the segments first; check names and numbers
add_caption_layer_from_audio { uri: "/path/to/clip.mp4", language: "en", modelSize: "base", startTime: 0, y: 78 }
```

Segment times are relative to the file; `startTime` must equal the video layer's
`startTime` (seconds) so the captions line up, and a trimmed in-point
(`mediaOffset`) shifts them - transcribe the vocal stem or a trimmed export when
the offset is large. The layer type is `transcript`; its duration ends at the
last segment. Style it in expocut-kinetic-captions.

### 3. Fix a mis-heard word

```
get_layer { layerId: "transcript0" }   // transcriptSegments: [{ text, startMs, endMs }, …]
update_layer { id: "transcript0", patch: { transcriptSegments: [ { text: "Meet the kettle", startMs: 0, endMs: 1200 }, { text: "that boils in ninety seconds", startMs: 1200, endMs: 3100 } ] } }
```

Send the full array back - the patch replaces it. Re-transcribing with
`modelSize: "base"` or a `language` hint usually fixes more than hand edits.

### 4. Re-voice a talking head

```
mute_video_audio { layerId: "video0", muted: true }
tts_add_audio_layer { text: "…the new script…", voiceId: "bm_george", startTime: 0 }
set_layer_audio_offset { layerId: "audio2", offsetMs: -120 }   // nudge earlier to land on the lip movement
```

## Pitfalls

- Defaults disagree: `tts_add_audio_layer` uses af_bella when `voiceId` is
  omitted, `tts_validate_script` assumes am_michael. Always pass both.
- Voice ids in `[VOICE: …]` markers must be `tts_list_voices` ids in lowercase; an
  unknown id falls through to the call's `voiceId` (or the engine's default speaker) without
  an error - `tts_validate_script` shows what each segment resolved to.
- `pitch` only affects the system-voice fallback; the on-device voices ignore it. `speed` is
  the lever, and going past 1.2 costs intelligibility.
- `duration` on `tts_add_audio_layer` overrides the layer length, not the audio:
  shorter cuts words, longer leaves silence. Leave it out.
- The generated file lives in the app cache (`tts_<timestamp>.wav`); the layer
  keeps pointing at it. Do not clear the app cache before exporting.
- `transcribe_audio` returns segments, not words (`tokenTimestamps` is off), so
  word-by-word highlights are the caption skill's job from segment timing.
- `transcribe_audio` errors on a missing model rather than downloading; an empty result on
  `add_caption_layer_from_audio` throws "no segments" (silent or unrecognised
  audio - separate the vocal stem or pass `language`).
- There is no `stylePreset`, `layerId` or `trackId` on the transcription tools;
  the transcript layer is positioned with `x`/`y` only and styled afterwards.
- Long text means long waits: generation and transcription each block the MCP
  call while the phone works. Split scripts over 90 seconds into several layers.
- New audio layers land at trackIndex 0; harmless for audio, but check
  `list_layers` if you later `reorder_layer` visual layers.

## Reference

- `references/voices.md` - the 14 voices with grade, accent, style and best use,
  plus the script marker table.
- https://expocut.com/mcp.html - full tool reference.
- Siblings: expocut-kinetic-captions (styling), expocut-audio-post (ducking
  detail, loudness, stems), expocut-editor-ops (undo, playback, export).
