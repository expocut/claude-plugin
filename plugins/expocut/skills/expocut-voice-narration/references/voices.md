# TTS voices and script markers

Read this when choosing a `voiceId` or writing a multi-voice script. The live list
is `tts_list_voices {}` (id, name, gender, accent, grade). Descriptions and
styles below come from the app's curated roster, which
already excludes the lower-grade voices. Grades are the voice model's published
quality grades; higher is more natural.

## Voices (14)

| voiceId | Name | Gender | Accent | Grade | Style | Best for |
| --- | --- | --- | --- | --- | --- | --- |
| `af_heart` | Heart | F | American | A | Warm | podcast, conversational, the default pick |
| `af_bella` | Bella | F | American | A- | Expressive | audiobooks, long narration |
| `bf_emma` | Emma | F | British | B- | Broadcast | narration, education, news |
| `af_nicole` | Nicole | F | American | B- | Clear | tutorials, technical content (ASMR-like clarity) |
| `am_fenrir` | Fenrir | M | American | C+ | Energetic | male podcast, tech, hype |
| `am_michael` | Michael | M | American | C+ | Authority | documentary, meditation, audiobook |
| `am_puck` | Puck | M | American | C+ | Friendly | app UI, explainers, casual |
| `af_sarah` | Sarah | F | American | C+ | Precise | instructional, corporate, e-learning |
| `af_aoede` | Aoede | F | American | C+ | Versatile | narration and story variants |
| `bm_george` | George | M | British | C | Distinguished | documentary, trustworthy narration |
| `bm_fable` | Fable | M | British | C | Whimsical | fiction, fantasy, children's stories |
| `bf_isabella` | Isabella | F | British | C | Dramatic | animated narrative fiction |
| `af_nova` | Nova | F | American | C | Upbeat | social media, vlogs, casual |
| `af_kore` | Kore | F | American | C | Neutral | corporate, e-learning, assistants |

Picking by content:

- Tutorial / how-to: af_nicole, af_sarah, bf_emma.
- Hype / promo: am_fenrir, af_nova.
- Documentary / calm: am_michael, bm_george, af_bella.
- Story / character: bm_fable, bf_isabella, af_aoede.
- Brand default when nothing is specified: af_heart.

Speed: 1.0 for everything above; 0.9 for meditation or documentary; 1.1 when a
script is 10% too long; beyond 1.2 words blur.

## Script markers

Markers go inside `text` for `tts_add_audio_layer` and `tts_validate_script`.

| Marker | Effect | Silence |
| --- | --- | --- |
| `...c` | comma beat | 160 ms |
| `...s` | sentence pause | 420 ms |
| `...p` | paragraph pause | 850 ms |
| blank line | paragraph pause (same as `...p`) | 850 ms |
| `[VOICE: am_michael]` | switch voice for the following text | none |

Rules the parser applies:

- A pause attaches to the segment before it; two pauses in a row keep the longer.
- Text before the first `[VOICE:]` uses the call's `voiceId` (`defaultVoice` in
  the validator). Voice ids are lower-cased; anything after the id inside the
  brackets (e.g. `[VOICE: am_michael - narrator]`) is ignored.
- Square-bracket fragments are stripped from the spoken text, so do not use
  brackets for content.
- When the voice model is not downloaded the system-voice fallback strips `[VOICE:]`
  markers and maps `...p` to a paragraph break, `...s` to an ellipsis and `...c`
  to an em dash - one voice for the whole script.

Example:

```
[VOICE: af_heart] Three things nobody tells you about sourdough. ...p
[VOICE: am_puck] One. ...c The starter is alive. ...s Feed it, or it sulks.
```

Duration estimate: characters / 14 seconds of speech at speed 1.0, plus
`totalPauseMs` from `tts_validate_script`.
