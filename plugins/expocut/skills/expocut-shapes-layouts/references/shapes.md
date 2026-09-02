# Shape catalog (list_shapes, 91 ids) plus layouts, shape styles, textures and border presets

Generated from the live catalogs. Shape ids go to add_shape_layer `shape`, set_shape `shape`, and add_shape_widget rows[].shape. Layout ids go to add_layout. Style ids go to set_shape_style. Texture ids go to set_shape_fill with style "texture". Border preset ids go to set_layer_border presetId.


## Shapes by category


### basic (25)

`circle` (Circle), `ellipse` (Ellipse), `square` (Square), `rectangle` (Rectangle), `rounded_rect` (Rounded), `triangle` (Triangle), `diamond` (Diamond), `pentagon` (Pentagon), `hexagon` (Hexagon), `octagon` (Octagon), `parallelogram` (Parallelogram), `trapezoid` (Trapezoid), `cross` (Cross), `right_triangle` (Right Triangle), `heptagon` (Heptagon), `nonagon` (Nonagon), `decagon` (Decagon), `semicircle` (Semicircle), `quarter_circle` (Quarter Circle), `donut` (Donut), `l_shape` (L-Shape), `t_shape` (T-Shape), `rhombus` (Rhombus), `kite` (Kite), `capsule` (Capsule)

### arrows (15)

`arrow` (Arrow Right), `arrow_left` (Arrow Left), `arrow_up` (Arrow Up), `arrow_down` (Arrow Down), `arrow_double` (Double Arrow), `chevron` (Chevron), `chevron_left` (Chevron Left), `arrow_up_down` (Up-Down Arrow), `arrow_block` (Block Arrow), `arrow_bent` (Bent Arrow), `chevron_double` (Double Chevron), `chevron_up` (Chevron Up), `chevron_down` (Chevron Down), `arrow_notched` (Notched Arrow), `arrow_curved` (Curved Arrow)

### stars (11)

`star` (5-Point Star), `star4` (4-Point Star), `star6` (6-Point Star), `star8` (8-Point Star), `star3` (3-Point Star), `star10` (10-Point Star), `star12` (12-Point Star), `sun` (Sun), `flower4` (4-Petal Flower), `flower6` (6-Petal Flower), `burst` (Burst)

### objects (28)

`heart` (Heart), `crescent` (Crescent), `cloud` (Cloud), `shield` (Shield), `speech_bubble` (Speech), `lightning` (Lightning), `teardrop` (Teardrop), `leaf` (Leaf), `moon` (Moon), `crown` (Crown), `infinity` (Infinity), `badge` (Badge), `clover4` (4-Leaf Clover), `spade` (Spade), `club` (Club), `hexagram` (Hexagram), `octagram` (Octagram), `speech_bubble_round` (Round Bubble), `thought_bubble` (Thought Bubble), `callout` (Callout), `gear` (Gear), `frame` (Frame), `ribbon` (Ribbon), `egg` (Egg), `flag` (Flag), `cross_rounded` (Rounded Cross), `puzzle` (Puzzle), `arrow_circle` (Arrow Circle)

### lines (10)

`line` (Line), `line_diagonal` (Diagonal), `bracket_left` (Bracket Left), `bracket_right` (Bracket Right), `brace_left` (Brace Left), `brace_right` (Brace Right), `line_wavy` (Wavy Line), `line_zigzag` (Zigzag Line), `line_double` (Double Line), `angle` (Angle)

### rulers (2)

`ruler_horizontal` (Ruler — Horizontal), `ruler_vertical` (Ruler — Vertical)

## Layouts (list_layouts, 12) — id — name — tiles created by add_layout

- `full` — Full Screen — 1 tile(s): one rectangle filling the canvas (stretchToCanvas + fitMode fill)
- `half` — Half Screen — 1 tile(s): top half on portrait canvases, left half on landscape/square
- `split2` — 2 Screen — 2 tile(s): two bands: top/bottom on portrait, left/right on landscape
- `split3` — 3 Screen — 3 tile(s): three equal bands, same orientation rule
- `split4` — 4 Square — 4 tile(s): 2x2 grid, reading order
- `bars5` — 5 Bars — 5 tile(s): five vertical bars, rainbow palette
- `bars10` — 10 Bars — 10 tile(s): ten vertical bars, rainbow palette
- `bars5_bw` — 5 B&W Bars — 5 tile(s): five vertical bars alternating black/white
- `bars10_bw` — 10 B&W Bars — 10 tile(s): ten vertical bars alternating black/white
- `slant3` — 3 Slant Panels — 3 tile(s): three parallelogram panels (rotated -24 deg, 210% tall so only the slanted edges show)
- `slant4` — 4 Slant Panels — 4 tile(s): four slant panels
- `slant5` — 5 Slant Panels — 5 tile(s): five slant panels

## Shape styles (list_shape_styles, 9) — one-tap fill + outline + glow rewrite

- `clean` — Clean — solid fill, no outline, no glow
- `neon-pink` — Neon Pink — solid fill + pink static glow
- `rainbow` — Rainbow — solid fill + rainbow glow
- `cyan-breathe` — Cyan Breathe — solid fill + cyan breathe glow
- `sunset` — Sunset — gradient fill + glow
- `ghost` — Ghost — transparent fill, 3 px white outline, no glow
- `chase-yellow` — Chase — solid fill + yellow chase glow (radius 16, intensity 80, speed 2)
- `pulse-violet` — Pulse — solid fill + violet pulse glow
- `hot-flame` — Hot Flame — solid fill, 3 px warm outline, layered flame glow

## Pattern textures (list_shape_textures, 16)

`gold` (Gold), `silver` (Silver), `rose-gold` (Rose Gold), `copper` (Copper), `holographic` (Holographic), `glitter-pink` (Glitter), `marble-white` (Marble), `marble-black` (Obsidian), `iridescent` (Iridescent), `lava` (Lava), `ice` (Ice), `galaxy` (Galaxy), `neon` (Neon), `sunset-glass` (Sunset), `plasma` (Plasma), `chrome` (Chrome)


## Border presets (list_border_presets, 12) — apply with set_layer_border presetId

`polaroid` (Polaroid), `film-strip` (Film Strip), `neon-pink` (Neon Pink), `rainbow-glow` (Rainbow), `breath-cyan` (Cyan Breathe), `chase-yellow` (Chase), `dashed-outline` (Dashed), `dotted-outline` (Dotted), `ocean-sunset` (Ocean Sunset), `aurora` (Aurora), `vapor-wave` (Vapor), `mint-neon` (Mint Neon)
