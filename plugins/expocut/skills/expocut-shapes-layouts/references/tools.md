# Tool signatures used by expocut-shapes-layouts

<!-- generated from the app's live MCP registry by ExpoCut's skill-parity test; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_brush_layer

Add a brush-stroke layer — a decorative vector stroke (splat, ink stroke, arrow, encircle, underline, sparkle, neon one-liner, speedlines, lightning…) that rides the full shape color system. `brush` is a bundled brush id — call list_brushes to discover ids and categories. Solid fill by default; pass gradientColors for a gradient. For neon looks, add a glow afterwards via update_layer patching shapeConfig.glow.

| param | type | notes |
| --- | --- | --- |
| brush\* | string | one of: `brush-arrows-01`, `brush-arrows-02`, `brush-arrows-03`, `brush-arrows-04`, `brush-arrows-05`, `brush-arrows-06`, `brush-arrows-07`, `brush-arrows-08`, `brush-circles-01`, `brush-circles-02`, `brush-circles-03`, `brush-circles-04`, `brush-circles-05`, `brush-circles-06`, `brush-circles-07`, `brush-circles-08`, `brush-underline-01`, `brush-underline-02`, `brush-underline-03`, `brush-underline-04`, `brush-underline-05`, `brush-underline-06`, `brush-underline-07`, `brush-underline-08`, `brush-sparkle-01`, `brush-sparkle-02`, `brush-sparkle-03`, `brush-sparkle-04`, `brush-sparkle-05`, `brush-sparkle-06`, `brush-sparkle-07`, `brush-sparkle-08`, `brush-neon-01`, `brush-neon-02`, `brush-neon-03`, `brush-neon-04`, `brush-neon-05`, `brush-neon-06`, `brush-neon-07`, `brush-neon-08`, `brush-comic-01`, `brush-comic-02`, `brush-comic-03`, `brush-comic-04`, `brush-comic-05`, `brush-comic-06`, `brush-comic-07`, `brush-comic-08`, `brush-energy-01`, `brush-energy-02`, `brush-energy-03`, `brush-energy-04`, `brush-energy-05`, `brush-energy-06`, `brush-energy-07`, `brush-energy-08`, `brush-splatter-01`, `brush-splatter-02`, `brush-splatter-03`, `brush-splatter-04`, `brush-splatter-05`, `brush-splatter-06`, `brush-splatter-07`, `brush-splatter-08`, `brush-splatter-09`, `brush-splatter-10`, `brush-splatter-11`, `brush-splatter-12`, `brush-ink-01`, `brush-ink-02`, `brush-ink-03`, `brush-ink-04`, `brush-ink-05`, `brush-ink-06`, `brush-ink-07`, `brush-ink-08`, `brush-ink-09`, `brush-ink-10`, `brush-ink-11`, `brush-ink-12`, `brush-marker-01`, `brush-marker-02`, `brush-marker-03`, `brush-marker-04`, `brush-marker-05`, `brush-marker-06`, `brush-marker-07`, `brush-marker-08`, `brush-marker-09`, `brush-marker-10`, `brush-paint-01`, `brush-paint-02`, `brush-paint-03`, `brush-paint-04`, `brush-paint-05`, `brush-paint-06`, `brush-paint-07`, `brush-paint-08`, `brush-paint-09`, `brush-paint-10`, `brush-drybrush-01`, `brush-drybrush-02`, `brush-drybrush-03`, `brush-drybrush-04`, `brush-drybrush-05`, `brush-drybrush-06`, `brush-spray-01`, `brush-spray-02`, `brush-spray-03`, `brush-spray-04`, `brush-spray-05`, `brush-spray-06`, `brush-spray-07`, `brush-spray-08`, `brush-spray-09`, `brush-spray-10`, `brush-spray-11`, `brush-spray-12`, `brush-scribble-01`, `brush-scribble-02`, `brush-scribble-03`, `brush-scribble-04`, `brush-scribble-05`, `brush-scribble-06`, `brush-scribble-07`, `brush-scribble-08`, `brush-scribble-09`, `brush-scribble-10`, `brush-scribble-11`, `brush-scribble-12`, `brush-scribble-13`, `brush-scribble-14`, `brush-scribble-15`, `brush-scribble-16` |
| fillColor | string |  |
| gradientColors | array | Two or more hex stops. Sets the fill to a gradient. |
| gradientDirection | string | one of: `horizontal`, `vertical`, `diagonal`, `radial` |
| opacity | number |  |
| canvasRelativeWidth | number | % of canvas width (0–100). Set BOTH canvasRelative* for fixed-fraction sizing. |
| canvasRelativeHeight | number | % of canvas height (0–100) |
| strokeColor | string | #RRGGBB outline color |
| strokeWidth | number |  |
| rotation | number | degrees |
| fadeInMs | number |  |
| fadeOutMs | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| startTime | number |  |
| duration | number |  |

## add_image_layer

Add an image layer from any local file:// URI. Useful for screenshots, logos, photos, SVG-rendered PNGs, etc. For Pexels stock photos specifically use add_stock_image_layer. The layer is fit-to-screen (full-canvas) by default; pass stretchToCanvas:false to letterbox.

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| name | string |  |
| startTime | number |  |
| duration | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| stretchToCanvas | boolean |  |

## add_layout

Add a screen-layout preset (Add Shape ▸ Layouts) — drops one rectangle shape layer per tile, sized in canvas-% so the split follows the project aspect ratio (Full Screen fills the canvas; 2/3 Screen, 4 Square and 5/10 Bars subdivide it; each tile gets a distinct fill color). Returns the created layer ids. Discover layoutId via list_layouts.

| param | type | notes |
| --- | --- | --- |
| layoutId\* | string |  |
| startTime | number | seconds |
| duration | number | seconds |

## add_shape_layer

Add a shape layer. `shape` is any built-in preset id — basic (rectangle, circle, triangle, hexagon…), arrows (arrow, chevron…), stars (star, burst, sun…), objects (heart, shield, speech_bubble, badge, ribbon, callout…), lines, rulers. Call list_shapes to discover ids. For gradient backgrounds: pass gradientColors=[startHex, endHex] and stretchToCanvas=true.

| param | type | notes |
| --- | --- | --- |
| shape | string | one of: `circle`, `ellipse`, `square`, `rectangle`, `rounded_rect`, `triangle`, `diamond`, `pentagon`, `hexagon`, `octagon`, `parallelogram`, `trapezoid`, `cross`, `right_triangle`, `heptagon`, `nonagon`, `decagon`, `semicircle`, `quarter_circle`, `donut`, `l_shape`, `t_shape`, `rhombus`, `kite`, `capsule`, `arrow`, `arrow_left`, `arrow_up`, `arrow_down`, `arrow_double`, `chevron`, `chevron_left`, `arrow_up_down`, `arrow_block`, `arrow_bent`, `chevron_double`, `chevron_up`, `chevron_down`, `arrow_notched`, `arrow_curved`, `star`, `star4`, `star6`, `star8`, `star3`, `star10`, `star12`, `sun`, `flower4`, `flower6`, `burst`, `heart`, `crescent`, `cloud`, `shield`, `speech_bubble`, `lightning`, `teardrop`, `leaf`, `moon`, `crown`, `infinity`, `badge`, `clover4`, `spade`, `club`, `hexagram`, `octagram`, `speech_bubble_round`, `thought_bubble`, `callout`, `gear`, `frame`, `ribbon`, `egg`, `flag`, `cross_rounded`, `puzzle`, `arrow_circle`, `line`, `line_diagonal`, `bracket_left`, `bracket_right`, `brace_left`, `brace_right`, `line_wavy`, `line_zigzag`, `line_double`, `angle`, `ruler_horizontal`, `ruler_vertical` |
| fillColor | string |  |
| gradientColors | array | Two or more hex stops. Sets the fill to a gradient. |
| gradientDirection | string | one of: `horizontal`, `vertical`, `diagonal`, `radial` |
| opacity | number |  |
| stretchToCanvas | boolean |  |
| canvasRelativeWidth | number | % of canvas width (0–100). Set BOTH canvasRelative* for fixed-fraction sizing. |
| canvasRelativeHeight | number | % of canvas height (0–100) |
| strokeColor | string | #RRGGBB outline color |
| strokeWidth | number |  |
| cornerRadius | number |  |
| rotation | number | degrees |
| fadeInMs | number |  |
| fadeOutMs | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| startTime | number |  |
| duration | number |  |

## add_shape_widget

Add a shape-widget layer: rows of shapes (1–8 per row) with an animation mode. Omit rows for the default 3-row layout. Each row: {shape, count, fillColor}. animation one of: none, scroll-up, scroll-down, scroll-left, scroll-right, continue, parallel, juggling, swapping, zoom-in, zoom-shapes. Position via x/y (top-left percent), startTime/duration in seconds.

| param | type | notes |
| --- | --- | --- |
| rows | array |  |
| gap | number | spacing fraction between cells/rows (0–0.4) |
| animation | string | one of: `none`, `scroll-up`, `scroll-down`, `scroll-left`, `scroll-right`, `continue`, `parallel`, `juggling`, `swapping`, `zoom-in`, `zoom-shapes` |
| animationSpeed | number | speed multiplier (0.25–4) |
| backgroundColor | string \| null |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| startTime | number |  |
| duration | number |  |

## add_svg_layer

Add a vector (SVG) layer from raw <svg> markup — the crisp, scale-independent way to drop in a logo or icon (use your OWN artwork). The markup is sanitized (scripts / remote refs / event handlers stripped, 256 KB cap) before it is stored. Renders in the editor canvas + capture_canvas and rasterizes for native export. Preserves aspect by default; pass stretchToCanvas:true to fill the canvas.

| param | type | notes |
| --- | --- | --- |
| svgContent\* | string | Raw <svg>…</svg> markup. |
| name | string |  |
| startTime | number | seconds |
| duration | number | seconds; default 5 |
| x | number | Top-left x percent 0..100 |
| y | number | Top-left y percent 0..100 |
| scale | number |  |
| rotation | number | degrees |
| opacity | number | 0..1 |
| stretchToCanvas | boolean | Fill the canvas (default false → preserve aspect) |

## add_text_layer

Add a text layer. Defaults to fullWidth=true + textAlign="center" so the text auto-fits the canvas regardless of aspect ratio (9:16, 16:9, 1:1) — perfect for title cards. Use verticalAnchor="top|center|bottom" instead of computing y. startTime/duration are seconds. Use transitionIn/Out (e.g. "fade", "scale") for entrance/exit animations.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |
| fontSize | number |  |
| fontFamily | string |  |
| fontWeight | string | e.g. "400", "700", "bold" |
| fontItalic | boolean |  |
| textColor | string | #RRGGBB |
| textAlign | string | one of: `left`, `center`, `right`, `justify` |
| fullWidth | boolean | Default true. Layer spans full canvas width; textAlign places the glyphs. |
| verticalAnchor | string | one of: `top`, `center`, `bottom` — Convenience for y. Use this OR y, not both. |
| x | number | Top-left x percent 0..100. Ignored when fullWidth=true. |
| y | number | Top-left y percent 0..100. |
| scale | number |  |
| rotation | number | degrees |
| opacity | number | 0..1 |
| letterSpacing | number | pt tracking; 2–3 for luxe caps labels |
| textTransform | string | one of: `none`, `uppercase`, `lowercase`, `capitalize` |
| lineHeight | number | multiplier, e.g. 1.2 |
| startTime | number | seconds |
| duration | number | seconds |
| fadeInMs | number |  |
| fadeOutMs | number |  |
| transitionIn | string |  |
| transitionOut | string |  |
| transitionInDuration | number | seconds |
| transitionOutDuration | number | seconds |
| textShadowColor | string |  |
| textShadowBlur | number |  |
| textStrokeColor | string |  |
| textStrokeWidth | number |  |
| textAutoFit | object | Shrink-to-fit. Resolver picks the largest fontSize ≤ maxSize that fits the text within maxLines lines, never below minSize. |

## capture_canvas

Capture the editor canvas to a PNG (or JPG) at a given frame and return it as an MCP image block, so you can SEE the project state — layer placement, colors, overlap, final composition. The leading text block is SELF-DESCRIBING for debugging: it reports the captured time, project canvas size (aspectRatio + resolution), total length, layer/track counts, and — most useful — the list of layers actually VISIBLE at that frame (sorted top-most first, each with its computed bounding box in canvas %), so an empty/wrong frame is immediately explainable. DEBUG VIEWS: xray=true dims the composition and draws labeled layer bounding boxes on top; outlinesOnly=true hides content entirely (borders only); grid=true overlays a 10%-step coordinate grid with % labels to pin-point positions — all composable with timeSec. Requires the editor mounted on the active project (Library → tap the project). timeSec scrubs the playhead first; maxWidth defaults to 512 (cap 1024).

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |
| xray | boolean |  |
| outlinesOnly | boolean |  |
| grid | boolean |  |

## capture_export_frame

P3.1: render ONE export-accurate frame of the OPEN project at timeSec (default playhead) through the editor's real export builder in single-frame mode — ALL overlay layers composite exactly as a full export (text/shapes/images/shaders/lower-thirds/transcript). Returns an inline PNG. Needs the editor mounted (call open_project first). This is the true preview≡export still.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| format | string | one of: `png`, `jpg` |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden or scheduled outside this frame. This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## get_canvas_info

Return the canvas/preview context in one cheap call (no image, editor need not be mounted): aspectRatio + numeric aspect, pixel width/height, fps, format, quality, total duration (ms + sec), estimated frame count, layer/track counts, current playhead, isPlaying and the selected layer id. Use this to understand the frame size and timeline length before placing layers or capturing.

No parameters.

## get_layer

Return the full Layer object (every field) for a given id. Use this to diff state, then `update_layer` to patch.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## list_border_presets

List the built-in border presets (the Border panel preset row: Polaroid, Film Strip, Neon Pink, Rainbow, Cyan Breathe, …): id + name. Apply with set_layer_border({presetId}). (Distinct from border_list_presets, which lists your own custom-registered presets.)

No parameters.

## list_brushes

List all bundled brush strokes — decorative vector strokes added as layers (arrows, circles/frames, underline/highlight, sparkle, neon one-liners, comic FX, energy FX, splatter, ink, marker, paint, dry brush, spray, scribble). Returns id, display name, category, and aspect (width/height of the stroke). Pass the id to add_brush_layer as `brush`. Optionally filter by category.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `arrows`, `circles`, `underline`, `sparkle`, `neon`, `comic`, `energy`, `splatter`, `ink`, `marker`, `paint`, `drybrush`, `spray`, `scribble` |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_layouts

List the screen-layout presets (the Add Shape ▸ Layouts tab): Full Screen, Half Screen, 2 / 3 Screen, 4 Square, 5 / 10 Bars, 5 / 10 B&W Bars. Each is a compound preset that add_layout turns into rectangle shape layers tiling the canvas. Returns id + name.

No parameters.

## list_mesh_gradients

List the Mesh fill gradient presets by category (lamp, sunset, ocean, aurora, galaxy, neon, pastel, …): id + name + category. Pass an id to set_shape_fill({style:"mesh", meshPresetId}).

| param | type | notes |
| --- | --- | --- |
| category | string |  |

## list_shape_styles

List the one-tap shape style presets (the Shape Style "Pick a look" row): id + name. Apply with set_shape_style.

No parameters.

## list_shape_textures

List the Pattern fill textures (gold, marble, holographic, …): id + name. Pass an id to set_shape_fill({style:"texture", textureId}).

No parameters.

## list_shapes

List all built-in shape presets the editor can render (basic, arrows, stars, objects, lines, rulers — e.g. circle, arrow, star, burst, badge, ribbon, speech_bubble, callout). Returns id, display name, and category. Pass the id to add_shape_layer as `shape`. Optionally filter by category.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `basic`, `arrows`, `stars`, `objects`, `lines`, `rulers` |

## remove_layer

Remove the layer with the given id from the active project.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## reorder_layer

Change a layer's z-order. "front" pulls it to trackIndex 0 (top); "back" pushes it past every other layer (bottom). Pass an explicit number for fine control. Other layers are shifted to keep the trackIndex sequence dense.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| position\* | any |  |

## set_export_settings

Update the active project export settings (aspectRatio, resolution, quality, format, fps). Only the fields you pass are changed; the rest are preserved.

| param | type | notes |
| --- | --- | --- |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| resolution | string | e.g. "1080x1920" |
| quality | string |  |
| format | string |  |
| fps | number |  |

## set_layer_border

Add or tune the stroke border around a layer (separate from set_layer_border_glow). presetId applies a built-in look (Polaroid, Film Strip, Neon Pink, Rainbow, … — see list_border_presets) as the base; the other args then override it. width is px @ 1080p. pattern: solid|dashed|dotted|double. cornerRadius rounds the corners (RADIUS). sides sets per-side visibility + per-side width (the SIDES / Per-side widths controls). position: inside|outside|center. Pass enabled=false to remove the stroke (preserves any glow).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| presetId | string | Built-in border preset id (see list_border_presets). |
| enabled | boolean |  |
| width | number |  |
| color | string |  |
| pattern | string | one of: `solid`, `dashed`, `dotted`, `double` |
| cornerRadius | number |  |
| position | string | one of: `inside`, `outside`, `center` |
| sides | object | Per-side { visible?, width? } for top/right/bottom/left. |

## set_layer_border_glow

Enable or tune the halo glow around any layer. Modes: static, pulse, rainbow, chase, breathe, gradient. radius: 0..40 px @ 1080p. intensity: 0..100 %. speed: 0.25..4. For gradient mode pass colorStops=["#hex1","#hex2",...]. layers (1..3) stacks halos for the "thick neon" look. Pass enabled=false to turn the halo off.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| mode | string | one of: `static`, `pulse`, `rainbow`, `chase`, `breathe`, `gradient` |
| color | string |  |
| radius | number |  |
| intensity | number |  |
| speed | number |  |
| position | string | one of: `inside`, `outside` |
| colorStops | array |  |
| borderSpeedMultiplier | number |  |
| layers | number | one of: `1`, `2`, `3` |

## set_layer_mask

Clip a layer to a mask — the full Layer Mask panel. SHAPE: rectangle, roundedRect (corner radius rides bandWidth 0..0.5 — a squircle/pill panel), ellipse (Circle), triangle, star, heart, cross, xShape, linear, mirror, radial, angular, diamond, path, text. ADJUST: rect {x,y,width,height} in 0..1 layer space (x/y = offset, w/h = size) + rotation (degrees). EDGE: feather (px @1080p), invert (show outside the shape). EFFECT: effect {type, intensity, speed, curve} = cinematic motion on the masked content (zoomIn/Out, pulse, breathe, panLeft/Right/Up/Down, kenBurns, spin, sway, shake; type="none" clears); morph {material, intensity, detail, direction} = Shape-Morph material between shape keyframes (water/wave/sand/air/stone/particles/marbles/wires; "none" clears). shape="text" is Video-in-Text via textData {content, fontFamily?, fontWeight?, italic?, align?}. Pass enabled=false to remove the mask.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| shape | string | one of: `rectangle`, `roundedRect`, `ellipse`, `triangle`, `star`, `heart`, `cross`, `xShape`, `linear`, `mirror`, `radial`, `angular`, `diamond`, `path`, `text` |
| rect | object |  |
| rotation | number | degrees, clockwise about rect centre |
| bandWidth | number | mirror shape only, 0..1 |
| feather | number |  |
| invert | boolean |  |
| textData | object |  |
| effect | object |  |
| morph | object |  |

## set_shape

Change the silhouette of an existing shape layer (the "Change" button) — e.g. swap a 5-Point Star for a hexagon. `shape` is any id from list_shapes. Keeps the current fill / outline / glow.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| shape\* | string |  |

## set_shape_canvas_relative_size

Size a shape layer as a fraction of the canvas (widthPct + heightPct in 0..100). Use for bottom-strip bars and any shape that must keep a fixed canvas fraction at any canvas size.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| widthPct | number |  |
| heightPct | number |  |

## set_shape_fill

Set the fill of an existing shape layer (the Fill tab). style maps to the UI tiles: "solid" = Color (needs color), "transparent" = Empty, "gradient" = Blend (needs gradientColors[2+] + gradientDirection), "texture" = Pattern (needs textureId from list_shape_textures), "mesh" = Mesh (needs meshPresetId from list_mesh_gradients), "image" = Photo / "video" = Movie (needs mediaUri + optional mediaFit). Switching style clears the other fill sources. opacity 0..1 sets the shape opacity.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| style\* | string | one of: `solid`, `transparent`, `gradient`, `texture`, `mesh`, `image`, `video` |
| color | string | #RRGGBB (style="solid"). |
| gradientColors | array | 2+ stops (style="gradient"). |
| gradientDirection | string | one of: `horizontal`, `vertical`, `diagonal`, `radial` |
| textureId | string | Pattern id from list_shape_textures (style="texture"). |
| meshPresetId | string | Mesh id from list_mesh_gradients (style="mesh"). |
| mediaUri | string | Local file:// (style="image"/"video"). |
| mediaFit | string | one of: `cover`, `contain`, `fill`, `none` |
| opacity | number | 0..1 |

## set_shape_glow

Same surface as set_layer_border_glow but for shape layers — writes to shapeConfig.glow instead of border.glow. Target layer must be type="shape" (created via add_shape_layer).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| mode | string | one of: `static`, `pulse`, `rainbow`, `chase`, `breathe`, `gradient` |
| color | string |  |
| radius | number |  |
| intensity | number |  |
| speed | number |  |
| colorStops | array |  |
| borderSpeedMultiplier | number |  |
| layers | number | one of: `1`, `2`, `3` |
| placement | string | one of: `outer`, `inner`, `both` — Where the halo sits relative to the shape (Glow ▸ Placement). |

## set_shape_outline

Set the outline (stroke) of an existing shape layer (the Outline tab): color, width (px = Outline Thickness), align (inside / center / outside = Position), opacity (0..1, the shape opacity). Pass width:0 to remove the outline. Only the fields you pass change.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| color | string | #RRGGBB |
| width | number | px (Outline Thickness) |
| align | string | one of: `inside`, `center`, `outside` |
| opacity | number | 0..1 |

## set_shape_style

Apply a one-tap shape style preset (the "Pick a look" row — e.g. "clean", "neon-pink", "rainbow", "ghost"). The preset rewrites fill + outline + glow together. Discover ids with list_shape_styles.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| styleId\* | string |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |

## update_widget_config

Merge a partial config patch into a widget layer's *Config field. Routes by layer.type: clock → clockConfig, scoreboard → scoreboardConfig, poll → pollConfig, statbar → statBarConfig, quote → quoteConfig, banner → bannerConfig, newsalert → newsAlertConfig, follower → followerConfig, likeburst → likeBurstConfig, comment → commentConfig, qrcode → qrCodeConfig, weather → weatherConfig, caption → captionConfig, confetti → confettiConfig, firemeter → fireMeterConfig, ticker → tickerConfig, lowerthird → lowerThirdConfig, collage → collageConfig, shape → shapeConfig. Use get_widget_config to inspect the current shape before patching.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| config\* | object |  |
