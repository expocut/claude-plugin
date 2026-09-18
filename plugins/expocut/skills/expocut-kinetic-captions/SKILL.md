---
name: expocut-kinetic-captions
description: "Everything text in ExpoCut through the in-app MCP server: titles and captions (add_text_layer, update_text), 44 fonts including Urdu/Arabic RTL faces, 99 text styles, 85 text effects, 18 text shades, 199 text animations (entrance/exit/loop, the typewriter family, per-character ranges), text on an arc/circle/wave, per-range style runs, wrap box, video-in-text, 180 broadcast lower thirds, and captions transcribed from an audio file with karaoke word highlighting. Use when the user says title, headline, caption, subtitles, auto captions, karaoke text, word-by-word, kinetic typography, animated text, typewriter, lower third, name plate, RTL, Urdu, Arabic, curved text, or wants speech readable with the sound off. Do not use to generate the voiceover audio or to transcribe a file into plain text (expocut-voice-narration), for text position/scale keyframes or motion paths (expocut-motion-graphics), or for caption-box, ticker and quote-card widgets (expocut-data-widgets)."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# Kinetic captions, titles and lower thirds

You are the typographer for an ExpoCut project. Every call below edits the user's open project live on their phone. Edits are undoable in the app, but ask before removing a layer or replacing a transcript the user has already corrected by hand.

## When to use / hand off

- This skill: any text layer — titles, captions, karaoke transcripts, lower thirds, curved text, RTL text, video-in-text.
- Voiceover generation and plain file transcription: expocut-voice-narration (tts_add_audio_layer, transcribe_audio).
- Moving or scaling text over time (keyframes, motion paths): expocut-motion-graphics.
- Layer-level transitions and effects on a text layer (set_layer_transition, set_layer_effect): expocut-fx-looks.
- Plates, pills and bars behind text: expocut-shapes-layouts. Caption-box, ticker and quote-card widgets: expocut-data-widgets.
- Opening projects, undo, capture and export: expocut-editor-ops.

## Before you start

1. A project must be open (open_project). Every text tool throws "No project is open" otherwise.
2. Call get_canvas_info for the aspect ratio, pixel size and duration, and list_layers for existing ids. Ids look like text_m0c3k1x9_7a2b4c1d (type prefix, timestamp, hex); always use the id returned by the add call, never invent one.
3. Discover before you set: list_fonts { category, source }, list_text_styles { category }, list_text_effects { category }, list_text_animations, list_lower_thirds. Setters reject unknown ids with a hint back to the right list tool.
4. Captions need the Whisper model downloaded inside the app (Transcribe panel). MCP never downloads it; ask the user to do that once before add_caption_layer_from_audio.
5. Font sizes are display points, not pixels: divide a 1080-px design size by about 2.7. On a 9:16 canvas a long title wraps fast, so give single-line titles textAutoFit instead of a raw fontSize.

## Core workflow

1. Add the layer. add_text_layer { text: "STOP SCROLLING", fontFamily: "din-alternate", textTransform: "uppercase", textAutoFit: { maxSize: 80, minSize: 24, maxLines: 1 }, verticalAnchor: "center", startTime: 0.5, duration: 3 }. Defaults: fullWidth true, textAlign center, duration 3 s. verticalAnchor top/center/bottom picks y (about 12 / centred / 86 percent); pass fullWidth: false with x and y for a hand-placed block.
2. Pick the look. set_text_style { layerId: "text_…", styleId: "title-impact" } then set_text_effect { layerId: "text_…", effectId: "glow-neon-pink" }. Refine with update_text { layerId: "text_…", fontSize: 44, letterSpacing: 2, textColor: "#FFFFFF" } and set_text_font { layerId: "text_…", fontFamily: "futura" }. A style or effect is baked into concrete fields (textColor, textStrokeColor, textShadow*, textBg*, textGradient*) at apply time, so apply the preset first and override after.
3. Optional backdrop silhouette. set_text_shade { layerId: "text_…", shapeId: "highlighter", opacity: 0.9 }. Valid shapeId values (there is no list tool): rect, brush, rough, swipe, tape, banner, angled, cloud, speech, starburst, ticket, arrowRight, arrowLeft, pennant, highlighter, wave, stamp, cornerCut. shapeId: null clears.
4. Animate. set_text_animation { layerId: "text_…", inId: "in-fade-up", inDurationSec: 0.4, outId: "out-fade", outDurationSec: 0.3, loopId: "loop-breathe", loopSpeed: 1 }. Each slot is optional; null clears it. Durations are seconds (stored as ms internally). Per-character presets obey set_text_animation_range { layerId: "text_…", start: 0.5, end: 1 } (fractions of the glyph count).
5. Layout extras. set_text_wrap_box { layerId: "text_…", width: 0.8, offsetX: 0.1 } (fractions of canvas width, width 0.05..1). set_text_path { layerId: "text_…", path: { kind: "arc", amplitude: 40 } }. set_text_style_runs for one accent word (below).
6. Check cheaply. describe_canvas { timeSec: 1.2 } lists every visible layer with its box in canvas percent; capture_canvas { timeSec: 1.2 } when you need pixels. Text animations and keyframes evaluate at timeSec, no seek needed.

## Tools you will use

| Tool | What for | Key params (units, enums) |
| --- | --- | --- |
| add_text_layer | create a text layer | text*; fontSize (pt); fontFamily (list_fonts id); fontWeight "400"/"700"/"bold"; textAlign left/center/right/justify; fullWidth; verticalAnchor top/center/bottom; x, y (top-left %); startTime, duration (s); letterSpacing (pt); textTransform none/uppercase/lowercase/capitalize; lineHeight (multiplier); textStrokeColor, textStrokeWidth; textShadowColor, textShadowBlur; textAutoFit { maxSize, minSize, maxLines }; transitionIn/transitionOut (list_transitions id) with transitionInDuration/transitionOutDuration (s); fadeInMs/fadeOutMs |
| update_text | edit an existing text or transcript layer | layerId*; text; fontSize; lineHeight; fontWeight; fontItalic; textTransform; textAlign; letterSpacing; textColor; opacity 0..1. Only passed fields change |
| set_text_font / set_text_style / set_text_effect | Fonts tab, Text Styles row, Effects row | layerId*; fontFamily / styleId / effectId. styleId or effectId null clears. set_text_effect also accepts a category id (glow, outline, 3d, shadow, distort, retro, nature, metallic, comic, tech) and resolves it to that category's first preset |
| set_text_shade | SVG silhouette behind the text | layerId*; shapeId (18 ids above or null); opacity 0..1 |
| set_text_animation | entrance / exit / loop | layerId*; inId, outId, loopId (list_text_animations ids or null); inDurationSec, outDurationSec (s); loopSpeed (multiplier); inParams, outParams, loopParams (typewriter family tuning, see references/text-animations.md) |
| set_typewriter | simple glyph-by-glyph reveal | layerId*; charDelayMs (30-80 feels human, 0 clears); startDelayMs |
| set_text_animation_range | limit a per-character animation to part of the text | layerId*; start, end (0..1 of glyph count); randomize 0..1; seed; invert |
| set_text_style_runs / clear_text_style_runs | per-range bold/italic/colour | layerId*; runs: [{ start, end, bold, italic, color }] as [start, end) character indexes into the content, sorted, non-overlapping; [] clears. Text layers only |
| set_text_wrap_box | tighten the wrap box without resizing the font | layerId*; width (0.05..1 of canvas width); offsetX (fraction) |
| set_text_path / clear_text_path | glyphs along a curve | layerId*; path: { kind: "arc", amplitude, flip } or { kind: "circle", radius, startAngleDeg, flip } or { kind: "wave", amplitude, frequency } or { kind: "none" }. amplitude/radius in the same points as fontSize |
| set_text_writing_direction | force bidi direction | layerId*; direction auto/ltr/rtl |
| set_text_font_features / set_text_font_variations | OpenType toggles, variable axes | layerId*; features { liga, smcp, tnum, ss01 … } / axes { wght, wdth, slnt … }; {} clears. Text layers only |
| set_text_media_fill / clear_text_media_fill | video or image inside the glyphs | layerId*; uri* (local file://); type* video/image; offsetSec (s into a video). Text layers only |
| add_lower_third_layer | broadcast name plate from a preset | presetId* (list_lower_thirds); lines (strings, one per preset line); startTime, duration (s, default 5); x, y (top-left %, default 50/75) |
| get_widget_config / update_widget_config | read and patch lowerThirdConfig on a lower-third layer | layerId*; config (shallow merge, see Recipe 2) |
| add_caption_layer_from_audio | transcribe a file and create a transcript layer | uri* (local audio file); language ("en", "ur"; omit = auto); modelSize tiny/base; startTime (s); x, y (top-left %); scale |
| transcribe_audio | segments only, no layer | uri*; language; modelSize |
| get_layer / update_layer | read the full layer, patch raw fields | layerId* / id*, patch* (startTime/duration in the patch are seconds) |

## Text animation quick picks

Full grouped catalog with per-character and popular flags: references/text-animations.md. Keep in-* ids in inId, out-* in outId, loop-* in loopId; the tool only checks that an id exists.

- Clean titles: in-fade-up, in-fade-zoom, in-mask-reveal, in-apple-title / out-apple-title, out-cinema-fade.
- Punchy social: in-pop-chars (per-character), in-pink-bounce, in-elastic, in-wow / out-wow, out-scatter (per-character).
- Typewriter family: in-tw-classic, in-tw-cursor, in-tw-word (reveals by word), in-tw-sparkle / in-tw-sparkle-word (particle burst from each letter / word as it lands — tune with inParams.sparkle), in-tw-scramble (decode), in-tw-highlighter (marker overlay), in-tw-terminal. Tune with inParams, e.g. set_text_animation { layerId: "text_…", inId: "in-tw-classic", inDurationSec: 1.2, inParams: { speedMs: 40, cursor: true, cursorColor: "#FFD93D" } }.
- Glitch and tech: in-glitch-reveal, out-glitch-exit, loop-neon-flicker, loop-glitch-cycle.
- Ambient loops: loop-pulse, loop-breathe, loop-float, loop-subtle-zoom, loop-counter-tick.
- One motion family per video (pop, or slide, or type). Entrances 0.3-0.5 s; exits shorter than entrances.

## Captions from audio (the transcript layer)

add_caption_layer_from_audio { uri: "/…/voice.m4a", language: "en", modelSize: "base", startTime: 2, x: 10, y: 75 } (uri is a file:// or absolute path to an m4a/mp3/wav/aac file) transcribes on-device and creates a transcript layer whose duration runs to the last segment. Segment times (startMs/endMs) are relative to the layer's startTime, so pass the same startTime you gave the narration audio layer.

What the tool does not do: the canvas and the export only draw a transcript layer that also has textAnimationStyleId (a transcript style) and textAnimationWords (word timings). The app's Transcript panel fills those in when the user taps Apply; through MCP you set them yourself:

1. get_layer { layerId: "transcript_…" } and read transcriptSegments: [{ text, startMs, endMs }].
2. Build words: split each segment's text on whitespace and spread the words evenly across [startMs, endMs] — exactly what the app does (Whisper gives segment timing, not word timing).
3. update_layer { id: "transcript_…", patch: { textAnimationStyleId: "karaoke-classic", textAnimationWords: [{ word: "Stop", t0: 0, t1: 320 }, { word: "scrolling", t0: 320, t1: 640 }], transcriptFontSize: 30, textAlign: "center", textFullWidth: true, position: { x: 0, y: 70 } } }.

Transcript style ids (no list tool; colours, weight and the highlight animation come from the style): karaoke-classic, karaoke-neon, karaoke-fire, highlight-yellow, highlight-blue, highlight-green, highlight-red, highlight-gradient, bounce-pop, bounce-scale, bounce-wave, typewriter-classic, typewriter-mono, typewriter-subtitle, cinematic-bold, cinematic-slide, cinematic-minimal, cinematic-impact.

Layer-level overrides the transcript renderer reads: transcriptFontSize (pt), transcriptFontFamily (a list_fonts id), textAlign, textFullWidth, position, scale, opacity. Per segment you may set enterAnim/exitAnim (none, fade, slide-left, slide-right, slide-up, slide-down, scale, bounce), rtl, fontFamily, by patching the whole transcriptSegments array back. update_text only helps here for textAlign; its fontSize and textColor, and set_text_font / set_text_style / set_text_effect, write fields this renderer ignores (it reads transcriptFontSize, transcriptFontFamily and the style colours).

Caption spec that performs: 1-3 word segments held 600-900 ms, heavy sans in caps, white on a dark style, one highlight colour, placed 60-70 percent down the frame inside the safe zone. Fix mis-heard words in the segments before styling; spelling errors at caption size are fatal. There is no translation tool: caption in the spoken language.

## RTL: Urdu, Arabic, Hebrew

- RTL faces from list_fonts { source: "rtl" }: geeza, al-nile, damascus, noto-naskh, nadeem (Arabic); noto-nastaliq, jameel-noori (Urdu). Direction auto-detects from the text; call set_text_writing_direction { layerId: "text_…", direction: "rtl" } only when mixed content is mis-detected.
- Keep letterSpacing at 0 for Arabic-script text; tracking breaks letter joining.
- Curved text on connected scripts renders as one shaped run bent along the path (Latin renders glyph by glyph). Hebrew works glyph by glyph on paths; skip niqqud.
- RTL lower thirds: the five urdu-* presets (trend) and the twelve fx-urdu-* / fx-arabic-* presets; pass Urdu/Arabic strings in lines.

## Recipes

### 1. Hook title with one accent word (kinetic typography)

```
add_text_layer { text: "STOP SCROLLING NOW", fontFamily: "din-alternate", textTransform: "uppercase", textAutoFit: { maxSize: 84, minSize: 28, maxLines: 1 }, verticalAnchor: "center", startTime: 0, duration: 2.5 }   // returns { id: "text_…" }
set_text_style { layerId: "text_…", styleId: "title-impact" }
set_text_effect { layerId: "text_…", effectId: "fx-outline-thick" }
set_text_style_runs { layerId: "text_…", runs: [{ start: 15, end: 18, color: "#FFD93D", bold: true }] }   // "NOW"
set_text_animation { layerId: "text_…", inId: "in-pop-chars", inDurationSec: 0.6, outId: "out-fade", outDurationSec: 0.25 }
describe_canvas { timeSec: 1 }
```

Run indexes count characters of the stored content ("STOP SCROLLING NOW": N at 15, W at 17, end is exclusive). Runs live on text layers only.

### 2. Branded lower third

```
list_lower_thirds
add_lower_third_layer { presetId: "accent-bar", lines: ["Maya Chen", "Head of Design"], startTime: 1, duration: 5, x: 6, y: 72 }   // returns { id: "lowerthird_…" }
get_widget_config { layerId: "lowerthird_…" }
update_widget_config { layerId: "lowerthird_…", config: { accentColor: "#FFD93D", textAlign: "left", transitionIn: { type: "slide-left", "duration": 400, easing: "easeOut" }, transitionOut: { type: "fade", "duration": 300, easing: "easeIn" } } }   // transition durations are ms
```

lowerThirdConfig keys you can patch: accentColor, accentElement, textAlign, hasBackground, backgroundColor, backgroundOpacity, backgroundRadius, padding { top, bottom, left, right }, lineGap, transitionIn/transitionOut { type, duration (ms), easing }, lines[]. Transition types: none, fade, slide-left, slide-right, slide-up, slide-down, scale, scale-up, scale-down, wipe-left, wipe-right, wipe-up, wipe-down, flip-x, flip-y, bounce, elastic, blur, zoom-rotate, typewriter. update_widget_config is a shallow merge, so to recolour one line read lines from get_widget_config, edit the entry ({ text, color, fontScale, fontWeight, uppercase, letterSpacing }) and send the whole array back. Hold a lower third at least 3 s; slide in 300-500 ms.

### 3. Captions for a muted feed

```
add_caption_layer_from_audio { uri: "/…/narration.m4a", language: "en", modelSize: "base", startTime: 0, x: 10, y: 75 }   // returns { id: "transcript_…", segmentCount }
get_layer { layerId: "transcript_…" }   // transcriptSegments → build [{ word, t0, t1 }] per segment, evenly spread
update_layer { id: "transcript_…", patch: { textAnimationStyleId: "highlight-yellow", textAnimationWords: [ /* built above */ ], transcriptFontSize: 30, transcriptFontFamily: "din-condensed", textAlign: "center", textFullWidth: true, position: { x: 0, y: 68 } } }
capture_canvas { timeSec: 1.4, maxWidth: 540 }   // mid-sentence: is the active word highlighted and legible on this footage?
```

Whisper tiny is fast and rough, base is slower and more accurate; both take seconds to minutes with the phone awake. If the response says the model is not downloaded, stop and ask the user to open the Transcribe panel.

### 4. Video inside display type

```
add_text_layer { text: "SUMMER", fontFamily: "impact", textAutoFit: { maxSize: 120, minSize: 40, maxLines: 1 }, verticalAnchor: "center", startTime: 0, duration: 4 }
set_text_media_fill { layerId: "text_…", uri: "/…/waves.mp4", type: "video", offsetSec: 3 }
set_text_animation { layerId: "text_…", inId: "in-scale", inDurationSec: 0.5 }
```

Whole-text entrances and exits bake into the export; per-character presets on media-filled text render static in the export, so keep those for solid text.

## Pitfalls

- Units: startTime, duration, inDurationSec, outDurationSec, transitionInDuration, offsetSec are seconds; charDelayMs, startDelayMs, fadeInMs, lower-third transition duration, and transcript t0/t1/startMs/endMs are milliseconds. A patch startTime of 3000 makes a 3000-second layer and wedges the export.
- textStyleId and textEffectId are bookkeeping; only the baked fields render. Applying a style after update_text overwrites the overlapping fields (colour, weight, case, tracking), so preset first, overrides second.
- set_text_font accepts any string (treated as a Google font, flagged bundled: false in the response). Prefer list_fonts ids: a runtime font that fails to load falls back to the system face in the export.
- New layers always land on top (trackIndex 0). Put a plate under a title with reorder_layer { layerId: "shape_…", position: "back" } or add the plate first.
- The transcript layer default position is x 50 / y 80 with an 80-percent-wide box, so half of it starts off the right edge. Pass x: 10 or set textFullWidth: true with position x 0.
- Transcript layers render nothing until textAnimationStyleId and textAnimationWords are set (see above). transcript ids look like transcript_….
- set_text_style_runs, set_text_shade, set_text_path, set_text_media_fill, font features and variations refuse non-text layers (transcript and lowerthird included).
- Lower-third text is drawn from lowerThirdConfig; set_text_font/style/effect accept the layer but do not change what it draws. Use update_widget_config.
- Media-filled text needs a local file:// uri; remote URLs and data URIs do not export.
- set_text_path still describes native export as in progress. Arc, circle and wave text has exported on both platforms in practice, but compare capture_canvas with capture_export_frame at the same timeSec before promising it, especially with a media fill or a cursive script.
- delete or remove_layer only after the user confirms; there is no undo through MCP except undo / undo_to_checkpoint (expocut-editor-ops).

## Reference

- references/text-animations.md — all 199 animation ids grouped by type and category, per-character and popular flags, typewriter params.
- references/lower-thirds.md — all 180 lower-third presets by category with line counts.
- references/fonts-styles-effects.md — 44 fonts (RTL flagged), 99 text styles with their key props, 85 text effects.
- https://expocut.com/mcp.html — tool reference. Siblings: expocut-voice-narration, expocut-motion-graphics, expocut-fx-looks, expocut-shapes-layouts, expocut-data-widgets, expocut-editor-ops, expocut-retention-playbook.
