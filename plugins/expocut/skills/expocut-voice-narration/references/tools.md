# Tool signatures used by expocut-voice-narration

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_caption_layer_from_audio

Transcribe an audio file and create a transcript layer with the segments populated. Same model requirements as transcribe_audio. Position via x/y (top-left percent). The layer's duration is derived from the last segment's end time.

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| language | string |  |
| modelSize | string | one of: `tiny`, `base` |
| startTime | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |

## add_stock_music_layer

Download a Freesound clip and add it as an audio layer in the active project. Pass either soundId (recommended — picks the best preview MP3) or a direct preview url. Layer duration defaults to the full clip length reported by Freesound. Uses preview-hq-mp3 (no OAuth required); original-quality download needs OAuth2 which the app does not configure.

| param | type | notes |
| --- | --- | --- |
| soundId | number |  |
| url | string |  |
| startTime | number |  |
| duration | number |  |
| volume | number | 0..1 layer volume |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## auto_duck

Duck the music layer when the vocal stem is active. Detects vocal-active regions and writes volume keyframes on the music layer (non-destructive).

| param | type | notes |
| --- | --- | --- |
| musicLayerId\* | string |  |
| vocalSourceLayerId\* | string | Source whose vocal stem drives ducking. |
| duckDb | number | Duck depth in dB (negative). Default -12. |

## gain_to_loudness_target

Compute the dB gain to apply to a signal at `currentLufs` to land at the named target (tiktok / spotify / youtube / appleMusic / broadcastEbu / broadcastUs, or a numeric LUFS string). Capped at `maxBoostDb` (default 12).

| param | type | notes |
| --- | --- | --- |
| currentLufs\* | number |  |
| target\* | string |  |
| maxBoostDb | number |  |

## get_active_project

Return the currently-open project id, layer count, and export settings.

No parameters.

## get_layer

Return the full Layer object (every field) for a given id. Use this to diff state, then `update_layer` to patch.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## mute_video_audio

Mute or unmute the embedded audio on a video layer (does not detach the audio into its own track).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| muted\* | boolean |  |

## playback_status

Report current playback state: { isPlaying, playheadMs, totalDurationMs }.

No parameters.

## reorder_layer

Change a layer's z-order. "front" pulls it to trackIndex 0 (top); "back" pushes it past every other layer (bottom). Pass an explicit number for fine control. Other layers are shifted to keep the trackIndex sequence dense.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| position\* | any |  |

## separate_audio

Separate a clip into vocals/drums/bass/other stems on-device (non-destructive — adds 4 audio stem layers, source untouched). tier: "fast" (Spleeter, low-end/quick) or "studio" (Demucs, high quality; falls back to fast if it cannot run).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string | Source audio or video layer id. |
| tier | string | one of: `fast`, `studio` |
| stems | array |  |
| mutedStems | array |  |

## set_layer_audio_offset

Nudge an audio layer's playback relative to its timeline startTime. Positive offset = audio plays LATER (delayed); negative = EARLIER. Typical lip-sync range is ±200ms; larger values for creative misalignment. Combined with startTime and mediaOffset by the exporter; the encoder schema does not have a separate audioOffset field.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| offsetMs\* | number |  |

## set_layer_fade

Set per-layer fade-in and/or fade-out (milliseconds). Works on every layer type. For video/audio it ducks the alpha + volume envelope; for text/shape it cross-fades the rendered alpha. Pass 0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## set_layer_volume_keyframes

Set the volume automation curve on an audio or video layer. keyframes are sorted by timeMs internally; the encoder linearly interpolates between them. Common pattern: duck under a voice-over by adding [{0,1},{ducked_start,1},{ducked_end,0.3},…,{end,1}].

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| keyframes\* | array |  |

## set_track_volume

Set the track-level volume multiplier (0..2.5).

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| volume\* | number |  |

## transcribe_audio

Transcribe an audio file using on-device Whisper. Returns time-stamped text segments. Requires the Whisper model to be downloaded already (open the app's transcribe panel to download). Default model: "tiny" — faster but less accurate; pass "base" for better accuracy at the cost of speed.

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| language | string | e.g. "en", "ur". Omit for auto-detect. |
| modelSize | string | one of: `tiny`, `base` |

## tts_add_audio_layer

Generate speech with the on-device TTS engine (Kokoro; falls back to AVSpeech if Kokoro not downloaded) and add the resulting WAV as an audio layer. Use tts_list_voices to find voiceId. Layer duration defaults to the generated audio length.

Script markers — embed in `text` for dramatic pacing:
  ...p   paragraph pause (≈850 ms silence)
  ...s   sentence pause  (≈420 ms silence)
  ...c   comma beat      (≈160 ms silence)
  blank line (\n\n) → paragraph break (≈500 ms)
  [VOICE: am_michael] — switch voice mid-script. Repeat as needed.

Example: "[VOICE: af_bella] Welcome to the show ...p [VOICE: am_michael] Today we explore... ...s a hidden world."
Call tts_validate_script first to preview the segment count and per-voice breakdown before committing to a long synthesis.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |
| voiceId | string |  |
| speed | number | 0.5..2.0; 1.0 default |
| pitch | number | semitones; 0 default |
| sampleRate | number | one of: `16000`, `22050`, `44100` |
| startTime | number |  |
| duration | number |  |
| volume | number | 0..1 layer volume |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## tts_list_voices

List all Kokoro TTS voices. Voice ids encode accent + gender: af_* American female, am_* American male, bf_* British female, bm_* British male. Use the id with tts_add_audio_layer (added in step 5.5).

No parameters.

## tts_validate_script

Parse a TTS script WITHOUT synthesising. Returns the segment list — each segment's voiceId, text preview, and trailing pause — plus a per-voice character count so the model can estimate cost / duration. Use this to sanity-check a multi-voice script before tts_add_audio_layer.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |
| defaultVoice | string |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer. rotationX / rotationY tilt the layer out of plane in degrees (0 = flat, clamped to ±75) — that is the card-in-3D-space move; plain `rotation` remains the in-plane spin. Supported on every visual layer type that can rotate at all — image, video, base video, text, shape, shape-widget, collage and Lottie — on canvas and at export. Android adds transcript and lower-third; on iOS those two carry no layer rotation in the encoder at all, so they stay flat there.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
