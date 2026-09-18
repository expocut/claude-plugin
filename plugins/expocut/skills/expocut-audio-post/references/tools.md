# Tool signatures used by expocut-audio-post

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_audio_layer

Add an audio layer from any local file:// URI (music, SFX, recordings). For TTS narration specifically use tts_add_audio_layer which generates the WAV first. duration is required (the audio file's length is not auto-detected here).

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| name | string |  |
| mediaOffsetSec | number |  |
| startTime | number |  |
| duration\* | number |  |
| volume | number |  |

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

## auto_remove_silence

Auto-edit: detect and ripple-delete the silent gaps in a video/audio clip, closing the timeline so the result is one tight cut. Non-destructive to the media file (rebuilds the timeline layer into trimmed segments). thresholdDb (default -40), minSilenceMs (shortest gap to cut, default 500), paddingMs (silence kept around speech, default 80).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| thresholdDb | number |  |
| minSilenceMs | number |  |
| paddingMs | number |  |

## beat_cut_from_drums

Detect onsets on the isolated DRUM stem and return cut times (ms) to place cuts/transitions. Requires the clip to be separated first.

| param | type | notes |
| --- | --- | --- |
| sourceLayerId\* | string |  |
| sensitivity | number | Higher = fewer cuts. Default 1.5. |
| maxCuts | number | Cap to the N strongest cuts. |

## build_loudness_plan

Compute a per-clip gain-ramp plan that normalizes each clip to a target loudness, clamped by the true-peak ceiling. Returns the structured plan + the JSON sidecar payload the native bridge consumes at export time.

| param | type | notes |
| --- | --- | --- |
| rows\* | array |  |
| target\* | string |  |
| mode | string | one of: `absolute`, `relative` |
| maxBoostDb | number |  |
| truePeakCeilingDbtp | number |  |

## clean_audio

AI audio cleanup: denoise and enhance speech on a video/audio layer on-device (non-destructive). For video layers the source audio is muted and a cleaned audio layer is added; for audio layers the track is replaced. strength 0..1 (default 0.85). Requires the on-device denoise model (downloads on first use).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| strength | number |  |

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

## isolate_voice

Voice isolate / dialogue boost — separate, then raise the vocal stem and duck the others (talking-head clips).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| boostDb | number | Vocal boost in dB. Default 6. |
| tier | string | one of: `fast`, `studio` |

## list_audio_effects

List all audio effects (EQ, dynamics, spatial, modulation, filter, creative, voice). Each entry includes the effect's params (id/min/max/default/unit) so callers can build set_layer_audio_effects payloads. auType maps to the underlying AVAudioUnit.

No parameters.

## list_audio_transitions

List all audio transitions (fades, filter sweeps, beat-aligned, creative). canIn/canOut flags indicate whether the transition can be used as in / out / both. params are transition-specific tuning knobs.

No parameters.

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_loudness_targets

List the named loudness targets the resolver knows about.

No parameters.

## list_tracks

List every track with id, type, name, layerCount, isVisible, isMuted, volume. Tracks group layers in the timeline UI.

No parameters.

## measure_loudness

EBU R128 loudness measurement on a mono PCM buffer. Returns integrated LUFS, max short-term LUFS, true-peak dBTP, and gated-block count.

| param | type | notes |
| --- | --- | --- |
| samplesBase64\* | string | Base64-encoded Float32Array of mono samples in [-1, 1]. |
| sampleRate\* | number |  |

## mute_video_audio

Mute or unmute the embedded audio on a video layer (does not detach the audio into its own track).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| muted\* | boolean |  |

## playback_status

Report current playback state: { isPlaying, playheadMs, totalDurationMs }.

No parameters.

## relink_video_audio

Re-attach a detached audio layer back into its source video. Removes the audio layer and clears the video's muted flag.

| param | type | notes |
| --- | --- | --- |
| audioLayerId\* | string |  |

## remove_layer

Remove the layer with the given id from the active project.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## remove_vocals

Karaoke / vocal remover — separate and mute the vocal stem, leaving an instrumental. Non-destructive.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| tier | string | one of: `fast`, `studio` |

## save_history_checkpoint

Push a session-scoped checkpoint of the editor state onto the undo stack. Returns the checkpoint id. Use undo() to revert to the previous checkpoint or undo_to_checkpoint({id}) for direct jump.

| param | type | notes |
| --- | --- | --- |
| label | string |  |

## separate_audio

Separate a clip into vocals/drums/bass/other stems on-device (non-destructive — adds 4 audio stem layers, source untouched). tier: "fast" (Spleeter, low-end/quick) or "studio" (Demucs, high quality; falls back to fast if it cannot run).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string | Source audio or video layer id. |
| tier | string | one of: `fast`, `studio` |
| stems | array |  |
| mutedStems | array |  |

## set_audio_reactive

Bind a stem envelope to a target layer property (zoom-pulse / flash / wobble). Non-destructive: stores an audioReactive binding on the target layer.

| param | type | notes |
| --- | --- | --- |
| targetLayerId\* | string | Layer whose property reacts. |
| stemLayerId\* | string | Stem layer that drives the effect. |
| stem\* | string | one of: `vocals`, `drums`, `bass`, `other`, `noise` |
| presetId\* | string | one of: `bass-zoom-pulse`, `kick-zoom-soft`, `vocal-flash-opacity`, `drum-wobble-rotate` |
| intensity | number |  |

## set_layer_audio_effects

Set the per-layer audio effect chain (EQ, dynamics, spatial, modulation, filter, voice). Each entry: {effectId, enabled?, params?}. params are effect-specific (e.g. bass_boost takes gain/frequency/bandwidth). Use list_audio_effects to discover.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effects\* | array |  |

## set_layer_audio_offset

Nudge an audio layer's playback relative to its timeline startTime. Positive offset = audio plays LATER (delayed); negative = EARLIER. Typical lip-sync range is ±200ms; larger values for creative misalignment. Combined with startTime and mediaOffset by the exporter; the encoder schema does not have a separate audioOffset field.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| offsetMs\* | number |  |

## set_layer_audio_transitions

Set audio entrance/exit transitions (fades, beat-aligned cuts, filter sweeps). Use list_audio_transitions for valid ids. Pass in=null or out=null to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object \| null |  |
| out | object \| null |  |

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

## set_stem_mix

Set per-stem volume (0..1) and/or mute on already-separated stems. Faders are non-destructive (write to the stem layers).

| param | type | notes |
| --- | --- | --- |
| sourceLayerId\* | string |  |
| mix\* | array |  |

## set_track_mute

Mute or unmute an audio/video track.

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| muted\* | boolean |  |

## set_track_volume

Set the track-level volume multiplier (0..2.5).

| param | type | notes |
| --- | --- | --- |
| trackId\* | string |  |
| volume\* | number |  |

## stock_search_music

Search Freesound for music / audio clips. Returns id, name, username, duration (seconds), tags, waveform url, and a preview url for each result. Use the returned id with add_stock_music_layer to drop the sound onto the timeline. category buckets: music | sfx | ambient | vocals | nature | electronic | cinematic | all. minDuration / maxDuration are post-filtered client-side. Default sort downloads_desc (most popular first).

| param | type | notes |
| --- | --- | --- |
| query | string |  |
| category | string | one of: `all`, `music`, `sfx`, `ambient`, `vocals`, `nature`, `electronic`, `cinematic` |
| page | number |  |
| perPage | number | Default 15 |
| sort | string | one of: `score`, `duration_desc`, `duration_asc`, `created_desc`, `created_asc`, `downloads_desc`, `downloads_asc`, `rating_desc`, `rating_asc` |
| minDuration | number | seconds |
| maxDuration | number | seconds |

## stock_trending_music

Freesound trending feed (sorted by all-time downloads, no query). Same return shape as stock_search_music. Duration filters are post-filtered client-side.

| param | type | notes |
| --- | --- | --- |
| perPage | number |  |
| minDuration | number |  |
| maxDuration | number |  |

## swap_music

Copyright-safe music strip — mute the music stems (bass+other, optionally drums) so you can re-layer a licensed track from the library.

| param | type | notes |
| --- | --- | --- |
| sourceLayerId\* | string |  |
| includeDrums | boolean | Also strip the drum stem. |

## unlink_video_audio

Detach a video layer's embedded audio into a separate audio Layer + Track. The video is forced muted afterward. Returns the new audio layer id. Use relink_video_audio to undo.

| param | type | notes |
| --- | --- | --- |
| videoLayerId\* | string |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer. rotationX / rotationY tilt the layer out of plane in degrees (0 = flat, clamped to ±75) — that is the card-in-3D-space move; plain `rotation` remains the in-plane spin. Supported on every visual layer type that can rotate at all — image, video, base video, text, shape, shape-widget, collage and Lottie — on canvas and at export. Android adds transcript and lower-third; on iOS those two carry no layer rotation in the encoder at all, so they stay flat there.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
