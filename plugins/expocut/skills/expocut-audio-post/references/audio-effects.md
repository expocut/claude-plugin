# Audio effects and audio transitions

Read this when building a `set_layer_audio_effects` chain or a
`set_layer_audio_transitions` call. Generated from the live output of
`list_audio_effects` and `list_audio_transitions`; call those tools for the
current catalog. Every param is a number; omitted params take the default.

Call shape:

```
set_layer_audio_effects { layerId: "audio0", effects: [ { effectId: "bass_boost", enabled: true, params: { gain: 6, frequency: 80 } } ] }
set_layer_audio_transitions { layerId: "audio0", in: { transitionId: "fade_s_curve", durationMs: 800 }, out: { transitionId: "reverb_tail", durationMs: 1500 } }
```

## Effects (37)

### EQ & Tone

| effectId | Name | Params (min..max, default, unit) |
| --- | --- | --- |
| `bass_boost` | Bass Boost | gain 0..18 (6 dB); frequency 40..200 (80 Hz); bandwidth 0.5..3 (1.5 oct) |
| `treble_boost` | Treble Boost | gain 0..18 (6 dB); frequency 4000..16000 (8000 Hz); bandwidth 0.5..3 (1.5 oct) |
| `mid_scoop` | Mid Scoop | cut -18..0 (-6 dB); frequency 300..3000 (1000 Hz); bandwidth 0.5..4 (2 oct) |
| `presence` | Presence | gain 0..12 (4 dB); frequency 2000..6000 (3500 Hz) |
| `warmth` | Warmth | warmth 0..100 (50 %); rolloff 6000..20000 (12000 Hz) |
| `parametric_eq` | Parametric EQ | lowGain -18..18 (0 dB); lowFreq 30..300 (100 Hz); midGain -18..18 (0 dB); midFreq 300..5000 (1000 Hz); highGain -18..18 (0 dB); highFreq 3000..16000 (8000 Hz) |

### Dynamics

| effectId | Name | Params |
| --- | --- | --- |
| `compressor` | Compressor | threshold -60..0 (-20 dB); ratio 1..20 (4:1); attack 0.1..100 (10 ms); release 10..1000 (100 ms); makeupGain 0..24 (0 dB) |
| `limiter` | Limiter | ceiling -12..0 (-1 dB); release 1..500 (50 ms) |
| `noise_gate` | Noise Gate | threshold -80..-10 (-40 dB); attack 0.1..50 (1 ms); release 5..500 (50 ms); hold 0..500 (50 ms) |
| `normalize` | Normalize | targetLevel -24..0 (-3 dB) |

### Spatial

| effectId | Name | Params |
| --- | --- | --- |
| `reverb_room` | Room Reverb | wetDry 0..100 (30 %); decayTime 0.1..2 (0.5 s); brightness 0..100 (60 %) |
| `reverb_hall` | Hall Reverb | wetDry 0..100 (40 %); decayTime 1..8 (3 s); brightness 0..100 (50 %) |
| `reverb_cathedral` | Cathedral | wetDry 0..100 (50 %); decayTime 3..15 (7 s); brightness 0..100 (40 %) |
| `reverb_plate` | Plate Reverb | wetDry 0..100 (35 %); decayTime 0.5..5 (2 s); brightness 0..100 (75 %) |
| `delay` | Delay / Echo | wetDry 0..100 (30 %); delayTime 50..2000 (250 ms); feedback 0..90 (40 %); lowCut 20..500 (100 Hz) |
| `stereo_widener` | Stereo Widen | width 0..200 (130 %) |

### Modulation

| effectId | Name | Params |
| --- | --- | --- |
| `chorus` | Chorus | wetDry 0..100 (40 %); rate 0.1..10 (1.5 Hz); depth 0..100 (50 %) |
| `flanger` | Flanger | wetDry 0..100 (50 %); rate 0.05..5 (0.5 Hz); depth 0..100 (70 %); feedback -90..90 (50 %) |
| `phaser` | Phaser | wetDry 0..100 (50 %); rate 0.01..4 (0.3 Hz); depth 0..100 (60 %); stages 2..12 (6) |
| `tremolo` | Tremolo | rate 0.5..20 (4 Hz); depth 0..100 (50 %); shape 0..100 (50 %) |
| `vibrato` | Vibrato | rate 1..10 (5 Hz); depth 0..100 (30 cents) |

### Filter

| effectId | Name | Params |
| --- | --- | --- |
| `low_pass` | Low Pass | cutoff 100..20000 (5000 Hz); resonance 0..20 (0 dB) |
| `high_pass` | High Pass | cutoff 20..5000 (100 Hz); resonance 0..20 (0 dB) |
| `band_pass` | Band Pass | center 100..10000 (1000 Hz); bandwidth 0.1..4 (1 oct) |
| `notch` | Notch Filter | frequency 50..10000 (60 Hz); q 1..50 (10) |

### Creative

| effectId | Name | Params |
| --- | --- | --- |
| `pitch_shift` | Pitch Shift | semitones -24..24 (0 st); cents -50..50 (0) |
| `speed` | Speed Change (tempo and pitch) | rate 0.25..4 (1 x) |
| `distortion_light` | Overdrive | drive 0..100 (30 %); tone 0..100 (50 %); mix 0..100 (60 %) |
| `distortion_heavy` | Distortion | drive 0..100 (70 %); tone 0..100 (40 %); mix 0..100 (80 %) |
| `bitcrusher` | Bitcrusher | bitDepth 2..16 (8 bit); sampleRate 1000..44100 (11025 Hz); mix 0..100 (70 %) |
| `reverse` | Reverse | enabled 0..1 (1) |

### Voice

| effectId | Name | Params |
| --- | --- | --- |
| `vocal_enhance` | Vocal Enhance | presence 0..12 (4 dB); warmth 0..12 (2 dB); deEss 0..100 (30 %); compression 0..100 (40 %) |
| `de_noise` | De-Noise | reduction 0..100 (50 %); sensitivity 0..100 (50 %) |
| `telephone` | Telephone | intensity 0..100 (80 %) |
| `radio` | Radio | intensity 0..100 (60 %); static 0..100 (20 %) |
| `underwater` | Underwater | depth 0..100 (70 %); resonance 0..20 (5 dB) |
| `megaphone` | Megaphone | intensity 0..100 (70 %); feedback 0..50 (10 %) |

Starting chains:

- Podcast voice: `high_pass` cutoff 90, `compressor` threshold -18 ratio 3,
  `vocal_enhance`, `limiter` ceiling -1.
- Music bed under voice: `mid_scoop` cut -4 at 2000 Hz, `low_pass` cutoff 9000
  (lets the voice sit on top even before ducking).
- Lo-fi / retro: `bitcrusher` bitDepth 10, `low_pass` cutoff 4000, `tremolo` rate 3.
- Phone call cutaway: `telephone` intensity 85.

## Audio transitions (25)

`durationMs` defaults to 500. `canIn` / `canOut` say which role accepts the id;
`none` clears like passing `null`.

| transitionId | Name | Category | In | Out | Curve |
| --- | --- | --- | --- | --- | --- |
| `none` | None | Fade | yes | yes | linear |
| `fade_linear` | Linear Fade | Fade | yes | yes | linear |
| `fade_exponential` | Exponential Fade | Fade | yes | yes | exponential |
| `fade_logarithmic` | Logarithmic Fade | Fade | yes | yes | logarithmic |
| `fade_s_curve` | S-Curve Fade | Fade | yes | yes | sCurve |
| `crossfade` | Crossfade (equal-power) | Fade | yes | yes | sCurve |
| `ducking` | Ducking | Fade | yes | yes | exponential |
| `filter_sweep_in` | Filter Open | Filter | yes | no | exponential |
| `filter_sweep_out` | Filter Close | Filter | no | yes | exponential |
| `high_pass_sweep_in` | HP Sweep In | Filter | yes | no | logarithmic |
| `high_pass_sweep_out` | HP Sweep Out | Filter | no | yes | logarithmic |
| `band_pass_sweep` | Band Sweep | Filter | yes | yes | linear |
| `echo_out` | Echo Out | Creative | no | yes | exponential |
| `echo_in` | Echo In | Creative | yes | no | exponential |
| `reverb_swell` | Reverb Swell | Creative | yes | no | sCurve |
| `reverb_tail` | Reverb Tail | Creative | no | yes | exponential |
| `pitch_rise` | Pitch Rise | Creative | yes | no | exponential |
| `pitch_drop` | Pitch Drop | Creative | no | yes | exponential |
| `speed_ramp_in` | Speed Ramp In | Creative | yes | no | exponential |
| `speed_ramp_out` | Speed Ramp Out (tape stop) | Creative | no | yes | exponential |
| `stutter_in` | Stutter In | Beat | yes | no | custom |
| `stutter_out` | Stutter Out | Beat | no | yes | custom |
| `gate_rhythm` | Gate Rhythm | Beat | yes | yes | custom |
| `sidechain_pump` | Sidechain Pump | Beat | yes | yes | custom |
| `beat_drop` | Beat Drop | Beat | yes | no | custom |

Social defaults: music in `fade_s_curve` 600 ms, music out `fade_exponential`
1500 ms; a drop entrance `beat_drop` 900 ms; a tape-stop ending `speed_ramp_out`
700 ms; a talking-head cutaway `filter_sweep_out` 400 ms.
