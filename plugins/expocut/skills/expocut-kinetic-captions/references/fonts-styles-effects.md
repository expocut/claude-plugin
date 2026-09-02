# Fonts, text styles and text effects (list_fonts 44, list_text_styles 99, list_text_effects 85)

Generated from the live catalogs. Font ids go to add_text_layer fontFamily or set_text_font; style ids to set_text_style; effect ids to set_text_effect. A style or effect is baked into concrete layer fields when applied (textColor, textStrokeColor, textShadow*, textBg*, textGradient*), so applying one and then calling update_text overrides only the fields you pass.


## Fonts (id — label — category — source; RTL marked)

- `system` — System — sans-serif — system
- `helvetica-neue` — Helvetica Neue — sans-serif — system
- `avenir-next` — Avenir Next — sans-serif — system
- `futura` — Futura — sans-serif — system
- `gill-sans` — Gill Sans — sans-serif — system
- `verdana` — Verdana — sans-serif — system
- `arial` — Arial — sans-serif — system
- `optima` — Optima — sans-serif — system
- `din-alternate` — DIN Alternate — sans-serif — system
- `georgia` — Georgia — serif — system
- `baskerville` — Baskerville — serif — system
- `palatino` — Palatino — serif — system
- `didot` — Didot — serif — system
- `hoefler` — Hoefler Text — serif — system
- `rockwell` — Rockwell — serif — system
- `superclarendon` — Clarendon — serif — system
- `times` — Times New Roman — serif — system
- `bodoni72` — Bodoni 72 — serif — system
- `impact` — Impact — display — system
- `copperplate` — Copperplate — display — system
- `papyrus` — Papyrus — display — system
- `chalkduster` — Chalkduster — display — system
- `chalkboard` — Chalkboard SE — display — system
- `phosphate` — Phosphate — display — system
- `snell-roundhand` — Snell Roundhand — handwriting — system
- `bradley-hand` — Bradley Hand — handwriting — system
- `marker-felt` — Marker Felt — handwriting — system
- `noteworthy` — Noteworthy — handwriting — system
- `signpainter` — SignPainter — handwriting — system
- `courier-new` — Courier New — monospace — system
- `menlo` — Menlo — monospace — system
- `american-typewriter` — Typewriter — monospace — system
- `monaco` — Monaco — monospace — system
- `arial-rounded` — Arial Rounded — rounded — system
- `avenir-next-condensed` — Avenir Condensed — condensed — system
- `din-condensed` — DIN Condensed — condensed — system
- `helvetica-condensed` — Helvetica Condensed — condensed — system
- `geeza` — Geeza عربی — arabic — system — RTL
- `al-nile` — Al Nile النيل — arabic — system — RTL
- `damascus` — Damascus دمشق — arabic — system — RTL
- `noto-naskh` — Noto Naskh نسخ — arabic — system — RTL
- `nadeem` — Nadeem نديم — arabic — system — RTL
- `noto-nastaliq` — Nastaliq نستعلیق — urdu — system — RTL
- `jameel-noori` — Jameel Noori جمیل — urdu — system — RTL

## Text styles by category (id — label — key props)


### basic (8)

- `basic-white` — Clean White — color=#FFFFFF, fontWeight=400
- `basic-white-bold` — Bold White — color=#FFFFFF, fontWeight=700
- `basic-black` — Clean Black — color=#000000, fontWeight=400
- `basic-black-bold` — Bold Black — color=#000000, fontWeight=700
- `basic-yellow` — Highlight Yellow — color=#FFD600, fontWeight=700
- `basic-red` — Bold Red — color=#FF3B30, fontWeight=700
- `basic-blue` — Cool Blue — color=#007AFF, fontWeight=600
- `basic-green` — Fresh Green — color=#34C759, fontWeight=600

### title (10)

- `title-hero` — Hero Title — color=#FFFFFF, fontWeight=900, textTransform=uppercase, letterSpacing=4
- `title-cinematic` — Cinematic — color=#F5F5DC, fontWeight=300, letterSpacing=8, textTransform=uppercase
- `title-bold-center` — Bold Center — color=#FFFFFF, fontWeight=800, textAlign=center, letterSpacing=2
- `title-minimal` — Minimal Title — color=#E0E0E0, fontWeight=300, letterSpacing=6
- `title-impact` — Impact Title — color=#FFFFFF, fontWeight=900, textTransform=uppercase
- `title-news` — News Title — color=#FFFFFF, fontWeight=700
- `title-sport` — Sport Title — color=#FFD600, fontWeight=900, italic=True, textTransform=uppercase
- `title-epic` — Epic Title — color=#FFD700, fontWeight=900, letterSpacing=3
- `title-dark-mode` — Dark Mode — color=#FAFAFA, fontWeight=600
- `title-breaking` — Breaking News — color=#FFFFFF, fontWeight=800, textTransform=uppercase

### subtitle (8)

- `sub-light` — Light Sub — color=#CCCCCC, fontWeight=300
- `sub-italic` — Italic Sub — color=#B0B0B0, fontWeight=400, italic=True
- `sub-caps` — Caps Sub — color=#999999, fontWeight=500, textTransform=uppercase, letterSpacing=3
- `sub-underline` — Underlined — color=#FFFFFF, fontWeight=400, underline=True
- `sub-pill` — Pill Badge — color=#FFFFFF, fontWeight=600
- `sub-tag` — Tag Style — color=#FFFFFF, fontWeight=500
- `sub-muted` — Muted Gray — color=#8E8E93, fontWeight=400, letterSpacing=1
- `sub-accent` — Accent Line — color=#00D4FF, fontWeight=500, underline=True

### outline (10)

- `outline-white` — White Outline — color=transparent
- `outline-black` — Black Outline — color=transparent
- `outline-thick` — Thick Outline — color=transparent, fontWeight=700
- `outline-red` — Red Outline — color=transparent
- `outline-blue` — Blue Outline — color=transparent
- `outline-gold` — Gold Outline — color=transparent
- `outline-cyan` — Cyan Outline — color=transparent
- `outline-double` — Double Outline — color=#FFFFFF, fontWeight=700
- `outline-neon` — Neon Outline — color=transparent
- `outline-rainbow` — Rainbow Outline — color=transparent

### shadow (10)

- `shadow-drop` — Drop Shadow — color=#FFFFFF, fontWeight=700
- `shadow-soft` — Soft Shadow — color=#FFFFFF, fontWeight=600
- `shadow-hard` — Hard Shadow — color=#FFFFFF, fontWeight=800
- `shadow-long` — Long Shadow — color=#FFFFFF, fontWeight=900
- `shadow-glow-white` — White Glow — color=#FFFFFF
- `shadow-glow-blue` — Blue Glow — color=#00D4FF
- `shadow-glow-red` — Red Glow — color=#FF3B30
- `shadow-inner` — Inner Shadow — color=#FFFFFF, fontWeight=700
- `shadow-3d` — 3D Shadow — color=#FFFFFF, fontWeight=900
- `shadow-fire` — Fire Shadow — color=#FFD700, fontWeight=800

### gradient (10)

- `grad-sunset` — Sunset — color=#FF6B35
- `grad-ocean` — Ocean — color=#00D4FF
- `grad-aurora` — Aurora — color=#00FF87
- `grad-fire` — Fire — color=#FF4500
- `grad-galaxy` — Galaxy — color=#8B5CF6
- `grad-gold` — Gold — color=#FFD700, fontWeight=700
- `grad-silver` — Silver — color=#C0C0C0, fontWeight=700
- `grad-neon-pink` — Neon Pink — color=#FF00FF
- `grad-matrix` — Matrix — color=#00FF00
- `grad-candy` — Candy — color=#FF6FD8

### neon (8)

- `neon-blue` — Neon Blue — color=#00D4FF, fontWeight=700
- `neon-pink` — Neon Pink — color=#FF00FF, fontWeight=700
- `neon-green` — Neon Green — color=#39FF14, fontWeight=700
- `neon-red` — Neon Red — color=#FF073A, fontWeight=700
- `neon-orange` — Neon Orange — color=#FF6600, fontWeight=700
- `neon-purple` — Neon Purple — color=#BF00FF, fontWeight=700
- `neon-yellow` — Neon Yellow — color=#FFF700, fontWeight=700
- `neon-white` — Neon White — color=#FFFFFF, fontWeight=700

### retro (8)

- `retro-vhs` — VHS — color=#FFFFFF, fontWeight=700
- `retro-80s` — 80s Retro — color=#FF00FF, fontWeight=800, italic=True
- `retro-chrome` — Chrome — color=#E0E0E0, fontWeight=900
- `retro-arcade` — Arcade — color=#FFD700, fontWeight=900, textTransform=uppercase
- `retro-pixel` — Pixel — color=#00FF00, fontWeight=700, letterSpacing=2
- `retro-synth` — Synthwave — color=#FF6EC7, fontWeight=700
- `retro-vintage` — Vintage — color=#D4A574, fontWeight=600, letterSpacing=3, textTransform=uppercase, opacity=0.9
- `retro-glitch` — Glitch — color=#FFFFFF, fontWeight=800

### elegant (8)

- `elegant-serif` — Classic Serif — color=#F5F5DC, fontWeight=400, letterSpacing=3, textTransform=uppercase
- `elegant-thin` — Thin Elegant — color=#FFFFFF, fontWeight=200, letterSpacing=6
- `elegant-gold` — Gold Luxury — color=#FFD700, fontWeight=400, letterSpacing=4, textTransform=uppercase
- `elegant-rose` — Rose Gold — color=#E8C4B8, fontWeight=300, letterSpacing=2
- `elegant-wedding` — Wedding — color=#FFFFFF, fontWeight=300, italic=True, letterSpacing=4
- `elegant-magazine` — Magazine — color=#1A1A1A, fontWeight=900, textTransform=uppercase, letterSpacing=1
- `elegant-fashion` — Fashion — color=#FFFFFF, fontWeight=200, letterSpacing=8, textTransform=uppercase
- `elegant-diamond` — Diamond — color=#E0E0E0, fontWeight=600

### fun (11)

- `fun-comic` — Comic — color=#FFD700, fontWeight=900, italic=True
- `fun-pop` — Pop Art — color=#FF00FF, fontWeight=900, textTransform=uppercase
- `fun-sticker` — Sticker — color=#FFFFFF, fontWeight=800
- `fun-bubble` — Bubble — color=#333333, fontWeight=700
- `fun-rainbow` — Rainbow — color=#FF0000, fontWeight=800
- `fun-chalk` — Chalk — color=#FFFFFF, fontWeight=400, opacity=0.85, letterSpacing=1
- `fun-emoji-bg` — Emoji Style — color=#FFFFFF, fontWeight=700
- `fun-graffiti` — Graffiti — color=#FF4500, fontWeight=900, italic=True
- `fun-stamp` — Stamp — color=#CC0000, fontWeight=900, textTransform=uppercase, opacity=0.85
- `fun-marker` — Marker — color=#000000, fontWeight=700
- `fun-pink-outline` — Pink Outline — color=#FF69B4, fontWeight=700

### social (8)

- `social-ig-story` — IG Story — color=#FFFFFF, fontWeight=700
- `social-tiktok` — TikTok — color=#FFFFFF, fontWeight=800
- `social-youtube` — YouTube — color=#FFFFFF, fontWeight=800
- `social-snap` — Snapchat — color=#000000, fontWeight=700
- `social-twitter` — Tweet — color=#1DA1F2, fontWeight=600
- `social-linkedin` — Professional — color=#333333, fontWeight=600
- `social-whatsapp` — WhatsApp — color=#FFFFFF, fontWeight=500
- `social-caption` — Caption — color=#FFFFFF, fontWeight=600

## Text effects by category (id — label)


### glow (10)

- `glow-soft-white` — Soft Glow
- `glow-neon-blue` — Neon Blue
- `glow-neon-pink` — Neon Pink
- `glow-neon-green` — Neon Green
- `glow-fire` — Fire Glow
- `glow-ice` — Ice Glow
- `glow-purple` — Purple Glow
- `glow-gold` — Gold Glow
- `glow-electric` — Electric
- `glow-sunset` — Sunset Glow

### outline (10)

- `fx-outline-thin` — Thin Outline
- `fx-outline-medium` — Medium Outline
- `fx-outline-thick` — Thick Outline
- `fx-outline-double` — Double Outline
- `fx-outline-color-pop` — Color Pop
- `fx-outline-red-black` — Red & Black
- `fx-outline-gold` — Gold Border
- `fx-outline-frosted` — Frosted
- `fx-outline-neon-border` — Neon Border
- `fx-outline-cartoon` — Cartoon

### 3d (10)

- `3d-basic` — 3D Basic
- `3d-deep` — 3D Deep
- `3d-red` — 3D Red
- `3d-blue` — 3D Blue
- `3d-gold` — 3D Gold
- `3d-emboss` — Emboss
- `3d-deboss` — Deboss
- `3d-letterpress` — Letterpress
- `3d-pop` — 3D Pop
- `3d-isometric` — Isometric

### shadow (8)

- `fx-shadow-multi` — Multi Shadow
- `fx-shadow-long` — Long Shadow
- `fx-shadow-retro` — Retro Shadow
- `fx-shadow-neon-drop` — Neon Drop
- `fx-shadow-cinema` — Cinematic
- `fx-shadow-float` — Float
- `fx-shadow-hard-offset` — Hard Offset
- `fx-shadow-color-split` — Color Split

### distort (7)

- `distort-italic` — Heavy Italic
- `distort-lean-right` — Lean Right
- `distort-perspective` — Perspective
- `distort-squeeze` — Squeeze
- `distort-wave` — Wave
- `distort-glitch-offset` — Glitch Offset
- `distort-blur` — Motion Blur

### retro (8)

- `fx-retro-vhs` — VHS Glitch
- `fx-retro-scanline` — Scanline
- `fx-retro-typewriter` — Typewriter
- `fx-retro-stamp` — Rubber Stamp
- `fx-retro-polaroid` — Polaroid
- `fx-retro-newspaper` — Newspaper
- `fx-retro-woodblock` — Woodblock
- `fx-retro-terminal` — Terminal

### nature (8)

- `nature-frost` — Frost
- `nature-flame` — Flame
- `nature-ocean` — Ocean
- `nature-forest` — Forest
- `nature-earth` — Earth
- `nature-sky` — Sky
- `nature-aurora` — Aurora
- `nature-lava` — Lava

### metallic (8)

- `metal-gold` — Gold
- `metal-silver` — Silver
- `metal-chrome` — Chrome
- `metal-copper` — Copper
- `metal-bronze` — Bronze
- `metal-platinum` — Platinum
- `metal-steel` — Steel
- `metal-rose-gold` — Rose Gold

### comic (8)

- `comic-boom` — Boom!
- `comic-pow` — POW!
- `comic-zap` — ZAP!
- `comic-speech` — Speech
- `comic-thought` — Thought
- `comic-shout` — Shout
- `comic-halftone` — Halftone
- `comic-manga` — Manga

### tech (8)

- `tech-hud` — HUD
- `tech-hologram` — Hologram
- `tech-matrix` — Matrix
- `tech-cyberpunk` — Cyberpunk
- `tech-wireframe` — Wireframe
- `tech-circuit` — Circuit
- `tech-scan` — Scan
- `tech-data` — Data Stream