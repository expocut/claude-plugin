# Text animation catalog (list_text_animations, 199 ids)

Generated from the live catalog. Every id below is valid in set_text_animation as inId (type in), outId (type out) or loopId (type loop); set_text_animation only checks that the id exists, not that it belongs to the slot, so keep in-* ids in inId, out-* in outId and loop-* in loopId. "per-char" marks perCharacter animations (they animate glyph by glyph and obey set_text_animation_range). "popular" mirrors the app picker badge. "params" lists the tunable keys the preset bakes in; override any of them through inParams / outParams / loopParams (schema: TextAnimationParams, see the last section).


## type = in (108 ids)


### fade (6)

- `in-fade` — Fade In (popular)
- `in-fade-up` — Fade Up (popular)
- `in-fade-down` — Fade Down
- `in-fade-zoom` — Fade Zoom (popular)
- `in-blur-slide` — Blur Slide
- `in-appear` — Appear

### slide (8)

- `in-slide-left` — Slide Left
- `in-slide-right` — Slide Right
- `in-slide-up` — Slide Up
- `in-slide-down` — Slide Down
- `in-slide-left-fade` — Slide Left + Fade
- `in-slide-right-fade` — Slide Right + Fade
- `in-glide` — Glide
- `in-slide-reveal` — Slide Reveal

### scale (7)

- `in-scale` — Scale In
- `in-scale-up` — Scale Up
- `in-scale-down` — Shrink In
- `in-scale-x` — Stretch X In
- `in-lines-morph` — Lines To Text
- `in-stretch` — Stretch
- `in-mask-reveal` — Mask Reveal

### rotate (6)

- `in-rotate` — Rotate In
- `in-rotate-cw` — Spin CW In
- `in-flip-x` — Flip X In
- `in-flip-y` — Flip Y In
- `in-shape-morph` — Shape Morph
- `in-mirror` — Mirror Flip

### bounce (7)

- `in-bounce` — Bounce In
- `in-bounce-up` — Bounce Up
- `in-bounce-left` — Bounce Left
- `in-drop` — Drop
- `in-pink-bounce` — Pink Bounce (popular)
- `in-bouncy-period` — Bouncy Period (per-char)
- `in-zero-gravity` — Zero Gravity (per-char)

### elastic (5)

- `in-elastic` — Elastic In
- `in-spring` — Spring
- `in-rubber` — Rubber Band
- `in-inflate` — Inflate (per-char)
- `in-squeeze` — Squeeze

### special (6)

- `in-typewriter` — Typewriter (per-char)
- `in-wave` — Wave In (per-char)
- `in-cascade` — Cascade (per-char)
- `in-pop-chars` — Pop Characters (per-char)
- `in-scramble` — Scramble (per-char)
- `in-dots-morph` — Dots To Text (per-char)

### glitch (2)

- `in-glitch-reveal` — Glitch Reveal
- `in-glitch-reveal-2` — Glitch Reveal II

### cinematic (3)

- `in-wow` — Wow Rotate+Scale
- `in-apple-title` — Apple Title
- `in-apple-list` — Apple Feature List (per-char)

### kinetic (1)

- `in-multiply` — Multiply

### typewriter (59)

- `in-tw-classic` — Classic Typewriter (per-char, popular) — params: reveal=glyph, speedMs=60
- `in-tw-cursor` — Cursor Typewriter (per-char, popular) — params: reveal=glyph, cursor=true, cursorColor=currentColor, speedMs=60
- `in-tw-word` — Word-by-word (per-char) — params: reveal=word, speedMs=180
- `in-tw-sparkle` — Sparkle Typewriter (per-char, popular) — params: reveal=glyph, speedMs=90, sparkle={count 12, sizePx 2.6, spreadPx 26, lifeMs 650} — gold-dust burst fires from every letter as it lands; tune/recolour with inParams.sparkle ({count, sizePx, spreadPx, lifeMs, colors}); any typewriter preset gains bursts via inParams.sparkle, `sparkle: null` switches them off
- `in-tw-sparkle-word` — Sparkle Words (per-char) — params: reveal=word, speedMs=240, sparkle={count 18, sizePx 3, spreadPx 34, lifeMs 800} — one burst per word as it appears
- `in-tw-line` — Line-by-line (per-char) — params: reveal=line, speedMs=480
- `in-tw-reverse` — Reverse / Backspace (per-char) — params: reveal=reverse, cursor=true, speedMs=60
- `in-tw-scramble` — Scramble Decode (per-char, popular) — params: reveal=scramble, cyclePool=ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@*!?, cycleColor=#a855f7, speedMs=50
- `in-tw-glitch` — Glitch Typewriter (per-char) — params: reveal=glyph, continuous=glitch, glitchAmplitudePx=5, glitchFrequencyHz=20, speedMs=60
- `in-tw-terminal` — Terminal / Code (per-char) — params: reveal=line, cursor=true, cursorColor=#4ade80, speedMs=25
- `in-tw-sound` — Sound-synced (per-char) — params: reveal=sound, speedMs=60
- `in-tw-variable` — Variable Speed (per-char) — params: reveal=variable, variableMap={"punct": 4, "caps": 0.4, "default": 1}, speedMs=60
- `in-tw-mistake` — Mistake & Correct (per-char) — params: reveal=mistake, mistakeRate=0.15, mistakeCharPool=qwertyuiopasdfghjklzxcvbnm, cursor=true, speedMs=70
- `in-tw-fade` — Fade In (typed) (per-char)
- `in-tw-slide-down` — Slide Down (per-char)
- `in-tw-slide-up` — Slide Up (per-char)
- `in-tw-slide-right` — From Right (per-char)
- `in-tw-slide-left` — From Left (per-char)
- `in-tw-pop` — Pop / Scale-in (per-char)
- `in-tw-blur` — Blur-to-focus (per-char)
- `in-tw-bounce-up` — Bounce Up (per-char)
- `in-tw-stamp` — Stamp / Impact (per-char)
- `in-tw-rotate-in` — Rotate-in (per-char)
- `in-tw-skew` — Skew Settle (per-char)
- `in-tw-yflip` — Y-axis Flip (per-char)
- `in-tw-cartwheel` — Cartwheel (per-char)
- `in-tw-mirror` — Mirror Flip (per-char)
- `in-tw-megazoom` — Mega Zoom (per-char)
- `in-tw-megazoom-rev` — Mega Zoom Reverse (per-char)
- `in-tw-drop-bounce` — Drop & Bounce (per-char)
- `in-tw-swing-in` — Swing In (per-char)
- `in-tw-diagonal` — Diagonal In (per-char)
- `in-tw-color-shift` — Color Shift Settle (per-char) — params: cycleColor=#3b82f6
- `in-tw-highlighter` — Highlighter Reveal (per-char) — params: overlay=highlight, overlayColor=#fde68a, overlayDurationMs=700
- `in-tw-center-out` — Center Outward (per-char) — params: reveal=centerOut
- `in-tw-outside-in` — Outside Inward (per-char) — params: reveal=outsideIn
- `in-tw-random` — Random Order (per-char) — params: reveal=random
- `in-tw-anagram` — Anagram Unscramble (per-char) — params: reveal=anagram
- `in-tw-rainbow` — Rainbow Pop (per-char) — params: rainbow=true, rainbowColors=["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]
- `in-tw-heat-cool` — Heat → Cool (per-char) — params: heatCool=true, heatColors=["#dc2626", "#ea580c", "#d97706", "#65a30d", "#0891b2", "#1d4ed8"]
- `in-tw-two-tone` — Two-Tone (per-char) — params: twoTone=["#3b82f6", "#ec4899"]
- `in-tw-underline` — Underline Draw (per-char) — params: overlay=underline, overlayColor=currentColor, overlayDurationMs=600
- `in-tw-strike` — Strikethrough Draw (per-char) — params: overlay=strike, overlayColor=#ef4444, overlayDurationMs=600
- `in-tw-box` — Box Draw (per-char) — params: overlay=box, overlayColor=currentColor, overlayDurationMs=880
- `in-tw-curtain` — Curtain Open — params: overlay=curtain, overlayColor=#0f0f0f, overlayDurationMs=800
- `in-tw-iris` — Iris (Circle) — params: overlay=iris, overlayDurationMs=1000
- `in-tw-wipe-down` — Wipe Down — params: overlay=wipeDown, overlayDurationMs=800
- `in-tw-diag-wipe` — Diagonal Wipe — params: overlay=wipeDiag, overlayDurationMs=800
- `in-tw-crt-on` — CRT On — params: overlay=crtOn, overlayDurationMs=500
- `in-tw-binary` — Binary 0/1 (per-char) — params: cycle=binary, cyclePool=01, cycles=8, cycleColor=#22c55e
- `in-tw-hex` — Hex Cycle (per-char) — params: cycle=hex, cyclePool=0123456789ABCDEF, cycles=10, cycleColor=#a855f7
- `in-tw-caps-cycle` — Caps Cycle (per-char) — params: cycle=capsCycle, cycles=4
- `in-tw-font-morph` — Font Morph — params: cycle=fontMorph, fontMorphList=["serif", "monospace", "cursive", "sans-serif"], fontMorphPerMs=320
- `in-tw-weight-pump` — Weight Pump (per-char) — params: continuous=weightPump
- `in-tw-tracking-expand` — Tracking Expand (per-char) — params: continuous=trackingExpand
- `in-tw-tracking-collapse` — Tracking Collapse (per-char) — params: continuous=trackingCollapse
- `in-tw-vertical` — Vertical Type (per-char) — params: reveal=glyph, layout=vertical, speedMs=95
- `in-tw-marquee` — Marquee Scroll — params: layout=marquee, marqueeDurationMs=1400
- `in-tw-receipt` — Receipt Printer (per-char) — params: reveal=line, layout=receipt, speedMs=420

## type = out (45 ids)


### fade (6)

- `out-fade` — Fade Out
- `out-fade-up` — Fade Up
- `out-fade-down` — Fade Down
- `out-fade-blur` — Blur Out
- `out-blur-slide` — Blur Slide Out
- `out-disappear` — Disappear

### slide (8)

- `out-slide-left` — Slide Left
- `out-slide-right` — Slide Right
- `out-slide-up` — Slide Up
- `out-slide-down` — Slide Down
- `out-slide-left-fade` — Slide Left + Fade
- `out-slide-right-fade` — Slide Right + Fade
- `out-glide` — Glide Out
- `out-slide-reveal` — Slide Conceal

### scale (7)

- `out-scale` — Scale Out
- `out-scale-up` — Grow Out
- `out-scale-down` — Shrink Out
- `out-scale-x` — Stretch X Out
- `out-lines-morph` — Text To Lines
- `out-stretch` — Stretch Out
- `out-mask-hide` — Mask Hide

### rotate (5)

- `out-rotate` — Rotate Out
- `out-rotate-cw` — Spin Out
- `out-flip-x` — Flip X Out
- `out-flip-y` — Flip Y Out
- `out-mirror` — Mirror Flip Out

### bounce (3)

- `out-bounce` — Bounce Out
- `out-bounce-down` — Bounce Down
- `out-rise` — Rise Away

### elastic (4)

- `out-elastic` — Elastic Out
- `out-squish` — Squish Out
- `out-deflate` — Deflate (per-char)
- `out-squeeze` — Squeeze Out

### special (4)

- `out-wave` — Wave Out (per-char)
- `out-cascade` — Cascade Out (per-char)
- `out-scatter` — Scatter (per-char)
- `out-dissolve` — Dissolve (per-char)

### cinematic (5)

- `out-cinema-fade` — Cinema Fade
- `out-cinema-zoom` — Cinema Zoom
- `out-letterbox` — Letterbox Out
- `out-wow` — Wow Out
- `out-apple-title` — Apple Title Out

### glitch (2)

- `out-glitch-exit` — Glitch Exit
- `out-glitch-exit-2` — Glitch Exit II

### kinetic (1)

- `out-multiply` — Multiply Out

## type = loop (44 ids)


### fade (3)

- `loop-pulse` — Pulse
- `loop-blink` — Blink
- `loop-breathe` — Breathe

### scale (5)

- `loop-heartbeat` — Heartbeat
- `loop-scale-pulse` — Scale Pulse
- `loop-pop` — Pop
- `loop-squash` — Squash & Stretch
- `loop-stretch-cycle` — Stretch Cycle

### slide (4)

- `loop-float` — Float
- `loop-sway` — Sway
- `loop-wave` — Wave
- `loop-bounce-y` — Bounce

### rotate (4)

- `loop-spin` — Spin
- `loop-wobble` — Wobble
- `loop-pendulum` — Pendulum
- `loop-tilt` — Tilt

### bounce (5)

- `loop-jelly` — Jelly
- `loop-trampoline` — Trampoline
- `loop-rubber` — Rubber
- `loop-zero-gravity` — Zero Gravity
- `loop-mirror-bounce` — Mirror Bounce

### kinetic (6)

- `loop-shake` — Shake
- `loop-vibrate` — Vibrate
- `loop-swing` — Swing
- `loop-earthquake` — Earthquake
- `loop-scroll` — Looped Scroll
- `loop-counter-tick` — Counter Tick

### glitch (5)

- `loop-glitch` — Glitch
- `loop-flicker` — Flicker
- `loop-static` — Static
- `loop-neon-flicker` — Neon Flicker
- `loop-glitch-cycle` — Glitch Cycle

### cinematic (5)

- `loop-ken-burns` — Ken Burns
- `loop-slow-float` — Slow Float
- `loop-subtle-zoom` — Subtle Zoom
- `loop-dramatic-pulse` — Dramatic Pulse
- `loop-apple-breathe` — Apple Breathe

### elastic (2)

- `loop-inflate` — Inflate Pulse
- `loop-squeeze-pulse` — Squeeze Pulse

### special (1)

- `loop-cascade-wave` — Cascade Wave (per-char)

### typewriter (4)

- `loop-tw-heartbeat` — Heartbeat Pulse (per-char) — params: continuous=heartbeat
- `loop-tw-jelly` — Jelly Wobble — params: continuous=jelly, continuousAmplitude=6, continuousFrequency=0.08
- `loop-tw-breathe` — Breathing — params: continuous=breathe, continuousAmplitude=0.06
- `loop-tw-wave` — Wave (per-char) — params: continuous=wave, continuousAmplitude=5, continuousFrequency=0.06

## TextAnimationParams keys (for inParams / outParams / loopParams)

Only the typewriter family (in-tw-* and loop-tw-*) reads these; other presets ignore params.

- reveal: glyph | word | line | scramble | ... (how units appear); speedMs: ms per unit (30-80 feels human-typed)
- cursor (bool), cursorColor (#hex)
- variableMap { punct, caps, default } — per-class speed multipliers (in-tw-variable)
- mistakeRate (0..1), mistakeCharPool (in-tw-mistake)
- cycle: binary | hex | capsCycle | fontMorph; cyclePool (string of glyphs); cycles (count); cycleColor (#hex)
- fontMorphList (string[] of font ids), fontMorphPerMs
- overlay (highlighter/box style), overlayColor, overlayDelayMs, overlayDurationMs
- continuous (post-reveal motion), continuousAmplitude, continuousFrequency
- layout: normal | vertical | marquee | receipt; marqueeDurationMs
- glitchAmplitudePx, glitchFrequencyHz (in-tw-glitch)
- echoColors [a, b], echoOffsetPx
- rainbow (bool), rainbowColors (string[]); heatCool (bool), heatColors (string[]); twoTone [a, b]
- drawEasing: linear | easeIn | easeOut | easeInOut; rtlMirror (bool)
