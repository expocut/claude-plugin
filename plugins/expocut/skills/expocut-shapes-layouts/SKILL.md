---
name: expocut-shapes-layouts
description: "Draws and styles vector graphics in ExpoCut through the in-app MCP server: 91 shape presets, fills (solid, gradient, 16 pattern textures, 130 mesh gradients, photo or video), outlines, glow, 9 one-tap shape styles, canvas-relative sizing for bars and plates, 12 screen layouts that tile the canvas into panels, 134 brush strokes (arrows, circles, underlines, sparkles, neon, comic, splatter, ink, marker, paint, spray, scribble) as tintable vector layers, raw SVG logos and icons, animated shape-widget grids, and borders and glow on any layer. Use when the user asks for a background plate, colour block, gradient or mesh backdrop, pill, bar, strip, divider, frame, badge, arrow, doodle, underline, scribble, sticker, SVG logo, split screen, collage grid, slanted panels, neon outline or glowing border. Do not use for text (expocut-kinetic-captions), counters and charts (expocut-data-widgets), masks and mattes (expocut-compositing), or keyframe animation (expocut-motion-graphics)."
license: Free to use and redistribute with attribution to expocut.com.
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expotechin.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# Shapes, layouts, brushes and SVG

You are the graphic designer for an ExpoCut project: plates under titles, split-screen panels, hand-drawn annotations, logos. Every call edits the user's open project live; edits are undoable in the app, but confirm before removing layers.

## When to use / hand off

- This skill: add_shape_layer and the shape style family, add_layout, add_brush_layer, add_svg_layer, add_shape_widget, set_layer_border, set_layer_border_glow, set_shape_glow, list_border_presets.
- Text on the plate: expocut-kinetic-captions. Device mockups and data widgets: expocut-data-widgets. Registering your own border presets and mask shapes: expocut-asset-authoring. Clipping a layer to a shape (set_layer_mask) or using a shape as a matte: expocut-compositing. Moving, scaling or fading shapes over time: expocut-motion-graphics. Capture, export, undo: expocut-editor-ops.

## Before you start

1. A project must be open. get_canvas_info gives the aspect ratio (layout tiles and canvas-relative sizes follow it); list_layers gives ids. Shape ids look like shape_m0c3k1x9_7a2b4c1d; SVG and mockup layers are image_….
2. Discover ids before setting them: list_shapes { category } (basic, arrows, stars, objects, lines, rulers), list_layouts, list_brushes { category }, list_shape_styles, list_shape_textures, list_mesh_gradients { category }, list_border_presets. Unknown ids throw with a hint back to the list tool.
3. Know the sizing model. A shape without canvas-relative sizing renders in a base box (about a third of the canvas width) multiplied by scale, and scale is applied about the box centre. Passing both canvasRelativeWidth and canvasRelativeHeight (0-100 percent of the canvas) makes the box a fixed canvas fraction anchored at position (top-left percent), which is the predictable way to build bars, plates and tiles.
4. Colours are #RRGGBB; stroke and glow radii are px at 1080p; opacity is 0..1.

## Core workflow

1. Add. add_shape_layer { shape: "rounded_rect", fillColor: "#111111", opacity: 0.85, cornerRadius: 24, canvasRelativeWidth: 90, canvasRelativeHeight: 18, x: 5, y: 64, startTime: 0, duration: 6 }. Default shape is rectangle, duration 5 s, position 50/50. Gradient at creation: gradientColors: ["#FF6B6B", "#4ECDC4"], gradientDirection horizontal/vertical/diagonal/radial. Full-canvas background: stretchToCanvas: true.
2. Restyle. set_shape_fill { layerId: "shape_…", style: "mesh", meshPresetId: "aurora-violet" }; set_shape_outline { layerId: "shape_…", color: "#FFFFFF", width: 3, align: "inside" }; set_shape_glow { layerId: "shape_…", mode: "breathe", color: "#7C3AED", radius: 18, intensity: 80, speed: 1, placement: "outer" }; or one tap: set_shape_style { layerId: "shape_…", styleId: "neon-pink" }. set_shape { layerId: "shape_…", shape: "hexagon" } swaps the silhouette and keeps fill, outline and glow.
3. Size and place. set_shape_canvas_relative_size { layerId: "shape_…", widthPct: 100, heightPct: 8 } then update_layer { id: "shape_…", patch: { position: { x: 0, y: 92 }, rotation: 0 } }.
4. Stack. New layers land on top (trackIndex 0). Add backgrounds first, or reorder_layer { layerId: "shape_…", position: "back" } (also "front" or a numeric trackIndex; lower renders on top).
5. Check. describe_canvas { timeSec: 1 } lists boxes in canvas percent (cheap, no image); capture_canvas { timeSec: 1 } to see it.

## Tools you will use

| Tool | What for | Key params |
| --- | --- | --- |
| add_shape_layer | new shape | shape (list_shapes id); fillColor; gradientColors [2+], gradientDirection; opacity; stretchToCanvas; canvasRelativeWidth + canvasRelativeHeight (%); strokeColor, strokeWidth (px); cornerRadius; rotation (deg); x, y (%); scale; startTime, duration (s); fadeInMs, fadeOutMs |
| set_shape | change silhouette | layerId*; shape* |
| set_shape_fill | Fill tab | layerId*; style* solid/transparent/gradient/texture/mesh/image/video; color (solid); gradientColors + gradientDirection (gradient); textureId (list_shape_textures); meshPresetId (list_mesh_gradients); mediaUri (local file://) + mediaFit cover/contain/fill/none (image/video); opacity. Switching style clears the other fill sources |
| set_shape_outline | Outline tab | layerId*; color; width (px, 0 removes); align inside/center/outside; opacity |
| set_shape_glow | halo on a shape (shapeConfig.glow) | layerId*; enabled; mode static/pulse/rainbow/chase/breathe/gradient; color; radius 0..40; intensity 0..100; speed 0.25..4; colorStops (gradient mode); layers 1/2/3; placement outer/inner/both |
| set_shape_style | one-tap look | layerId*; styleId* clean, neon-pink, rainbow, cyan-breathe, sunset, ghost, chase-yellow, pulse-violet, hot-flame |
| set_shape_canvas_relative_size | fixed canvas fraction | layerId*; widthPct, heightPct (0..100). Shape layers only |
| add_layout | tile the canvas with rectangles | layoutId* (list_layouts); startTime, duration (s). Returns layerIds in reading order |
| add_brush_layer | decorative vector stroke | brush* (list_brushes id); fillColor or gradientColors + gradientDirection; strokeColor, strokeWidth; opacity; canvasRelativeWidth + canvasRelativeHeight; rotation; x, y; scale; startTime, duration; fadeInMs, fadeOutMs |
| add_svg_layer | your own vector artwork | svgContent* (raw svg markup, 256 KB cap); name; x, y; scale; rotation; opacity; startTime, duration; stretchToCanvas |
| add_shape_widget | animated grid of shapes | rows [{ shape, count (1-8), fillColor }]; gap 0..0.4; animation none/scroll-up/scroll-down/scroll-left/scroll-right/continue/parallel/juggling/swapping/zoom-in/zoom-shapes; animationSpeed 0.25..4; backgroundColor; x, y; scale; rotation; opacity; startTime, duration |
| set_layer_border | stroke border on any layer | layerId*; presetId (list_border_presets); enabled; width (px); color; pattern solid/dashed/dotted/double; cornerRadius; position inside/outside/center; sides { top/right/bottom/left: { visible, width } } |
| set_layer_border_glow | halo on any layer (border.glow) | layerId*; enabled; mode; color; radius; intensity; speed; position inside/outside; colorStops; layers 1/2/3 |
| list_border_presets | 12 built-in border looks | polaroid, film-strip, neon-pink, rainbow-glow, breath-cyan, chase-yellow, dashed-outline, dotted-outline, ocean-sunset, aurora, vapor-wave, mint-neon |
| update_layer / reorder_layer / describe_canvas | place, stack, verify | id + patch (position, scale, rotation, opacity, startTime/duration in s) / layerId + position / timeSec |

## Layouts

add_layout { layoutId: "split3", startTime: 0, duration: 6 } drops one rectangle shape layer per tile, sized in canvas percent so the split follows the project aspect. Ids: full (1 tile, fills the canvas), half, split2, split3 (bands: top-to-bottom on portrait, left-to-right on landscape), split4 (2 × 2), bars5, bars10, bars5_bw, bars10_bw (vertical bars), slant3, slant4, slant5 (parallelograms rotated -24 degrees, 210 percent tall so only the slanted edges show). Each tile gets a distinct palette colour and is an ordinary shape layer: recolour with set_shape_fill, drop a photo into it with set_shape_fill { layerId: "shape_…", style: "image", mediaUri: "/…/photo.jpg", mediaFit: "cover" }, or turn tiles transparent to use them as guides. The last tile added is on top.

## Brushes

add_brush_layer { brush: "brush-circles-02", fillColor: "#FFD93D", canvasRelativeWidth: 60, canvasRelativeHeight: 34, x: 20, y: 30, rotation: -4, startTime: 1, duration: 3 }. A brush is a shape layer of type custom_path, so every shape tool applies afterwards: set_shape_fill (gradient, texture, mesh), set_shape_outline, set_shape_glow for the neon one-liners, set_shape_style. Do not call set_shape on a brush; it replaces the stroke with a preset silhouette. list_brushes returns aspect (width/height of the stroke): keep canvasRelativeHeight = canvasRelativeWidth × canvasAspect / aspect so the stroke is not squashed (on 9:16 canvasAspect is 0.5625). Categories: arrows, circles, underline, sparkle, neon, comic, energy, splatter, ink, marker, paint, drybrush, spray, scribble. Catalog: references/brushes.md.

## SVG layers

add_svg_layer { svgContent: "<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><circle cx='200' cy='200' r='180' fill='#FFD93D'/></svg>", x: 35, y: 40, scale: 1, startTime: 0, duration: 5 } stores sanitized markup on an image layer and rasterises it for export. Rules learned the hard way:

- The layer renders in an aspect-fitted 150-point box (about a third of a phone-width canvas) multiplied by scale, and scale is applied about the box centre. The visual top-left is position + baseBox × (1 - scale) / 2 per axis, so compensate: for a target visual top-left (vx, vy) pass position (vx - uw × (1 - scale) / 2, vy - uh × (1 - scale) / 2) where uw/uh are the unscaled box size in canvas percent (read them from describe_canvas once at scale 1). Position keyframes carry the same constant offset.
- Sanitizer strips scripts, event handlers, remote references and embedded raster (<image href="data:…"> comes back empty). Use add_image_layer for bitmaps. No <filter>; fake glows with radialGradient fills.
- Give every gradient a unique id across all SVGs in the project (plateG, pillG …). Shared ids collide in the native export and the fill drops out.
- <tspan> children each centre independently at the parent x; use separate <text> elements with absolute x for multi-colour lines.
- Full-bleed artwork: match the viewBox to the canvas aspect and leave stretchToCanvas false, or size explicitly (see Pitfalls).

## Shape widget

add_shape_widget { rows: [{ shape: "circle", count: 4, fillColor: "#FF6B6B" }, { shape: "square", count: 3, fillColor: "#4ECDC4" }], animation: "scroll-left", animationSpeed: 1, gap: 0.08, backgroundColor: null, x: 0, y: 30, scale: 2, startTime: 0, duration: 8 } creates a shapeWidget layer (default: three rows of one rectangle). Per-shape styling lives in shapeWidgetConfig.rows[].shapes[] (each a full shape config); patch it with update_layer { id: "shapeWidget_…", patch: { shapeWidgetConfig: { … } } } after reading it with get_layer, because update_widget_config does not route shapeWidget layers. Vertical scrolls use a slower base period than the other modes.

## Recipes

### 1. Glowing mesh card behind a title

```
add_shape_layer { shape: "rounded_rect", cornerRadius: 28, canvasRelativeWidth: 84, canvasRelativeHeight: 22, x: 8, y: 39, startTime: 0, duration: 6, fadeInMs: 300 }
set_shape_fill { layerId: "shape_…", style: "mesh", meshPresetId: "galaxy-nebula", opacity: 0.95 }
set_shape_outline { layerId: "shape_…", color: "#FFFFFF", width: 2, align: "inside" }
set_shape_glow { layerId: "shape_…", mode: "breathe", color: "#A78BFA", radius: 22, intensity: 70, speed: 0.8, placement: "outer" }
add_text_layer { text: "NEW DROP", verticalAnchor: "center", textAutoFit: { maxSize: 72, minSize: 24, maxLines: 1 }, startTime: 0, duration: 6 }   // lands on top of the card
describe_canvas { timeSec: 1 }
```

### 2. Three-panel slant collage

```
add_layout { layoutId: "slant3", startTime: 0, duration: 8 }   // returns layerIds [a, b, c]
set_shape_fill { layerId: "shape_a", style: "image", mediaUri: "/…/left.jpg", mediaFit: "cover" }
set_shape_fill { layerId: "shape_b", style: "video", mediaUri: "/…/middle.mp4", mediaFit: "cover" }
set_shape_fill { layerId: "shape_c", style: "image", mediaUri: "/…/right.jpg", mediaFit: "cover" }
set_shape_outline { layerId: "shape_b", color: "#FFFFFF", width: 6, align: "center" }
capture_canvas { timeSec: 2, maxWidth: 540 }
```

Media fills need local paths (file:// or absolute; stock downloads and camera-roll copies qualify); remote URLs do not export.

### 3. Hand-drawn annotation with a neon arrow

```
add_brush_layer { brush: "brush-circles-01", fillColor: "#FFD93D", canvasRelativeWidth: 56, canvasRelativeHeight: 32, x: 22, y: 34, startTime: 2, duration: 3, fadeInMs: 150 }
add_brush_layer { brush: "brush-arrows-04", gradientColors: ["#FF3CAC", "#784BA0"], gradientDirection: "horizontal", canvasRelativeWidth: 40, canvasRelativeHeight: 10, x: 8, y: 70, rotation: -20, startTime: 2.3, duration: 2.7 }
set_shape_glow { layerId: "shape_…", mode: "static", color: "#FF3CAC", radius: 16, intensity: 90 }
```

For "draw-on" motion, hand the brush id to expocut-motion-graphics for a mask reveal or opacity keyframes.

### 4. Bottom strip bar that survives aspect changes

```
add_shape_layer { shape: "rectangle", fillColor: "#0B0B0F", opacity: 0.8, canvasRelativeWidth: 100, canvasRelativeHeight: 9, x: 0, y: 91, startTime: 0, duration: 10 }
set_layer_border { layerId: "shape_…", enabled: true, width: 2, color: "#FFD93D", pattern: "solid", position: "inside", sides: { top: { visible: true }, right: { visible: false }, bottom: { visible: false }, left: { visible: false } } }
```

## Pitfalls

- Pass both canvasRelativeWidth and canvasRelativeHeight; one alone is ignored and the shape falls back to the 150-point box.
- stretchToCanvas draws full-bleed on the canvas, but some native encoders have rendered such layers at their unstretched size (black background, offset block). If an exported background comes out wrong, size it explicitly instead: canvasRelativeWidth 104, canvasRelativeHeight 103, position x -2, y -1.5, so the edges bleed off-frame. Verify with capture_export_frame { timeSec }.
- set_shape_fill switches the whole fill: choosing "solid" drops a mesh, choosing "mesh" drops a media fill. gradient needs 2 or more colours; texture and mesh ids are validated; image/video needs mediaUri.
- opacity in set_shape_fill and set_shape_outline is the shape's own opacity (shapeConfig.opacity), separate from the layer opacity in update_layer.
- set_shape_glow, set_shape_canvas_relative_size, set_shape, set_shape_fill, set_shape_outline and set_shape_style refuse layers that are not shapes (SVG and mockup layers are images). Use set_layer_border and set_layer_border_glow on those.
- A border glow made with set_layer_border_glow lives inside the layer's border; set_layer_border enabled: false keeps the glow, and a preset via presetId replaces the base border but keeps its glow.
- Layout tiles and shapes with a rotation (slant panels) report an axis-aligned box in describe_canvas; the visible parallelogram is narrower.
- add_layout uses the project aspect at call time; change the aspect first (set_export_settings) or the bands run the wrong way.
- The Add Layer tray can pop open on the phone when MCP adds layers; harmless.
- Units: startTime and duration are seconds everywhere here (a duration of 5000 is 83 minutes); fadeInMs/fadeOutMs are milliseconds; widths and radii are px at 1080p.
- Confirm before remove_layer; recover with undo (expocut-editor-ops).

## Reference

- references/shapes.md — all 91 shape ids by category, the 12 layouts with tile counts and orientation rules, 9 shape styles, 16 textures, 12 border presets.
- references/mesh-gradients.md — all 130 mesh gradient ids in 16 categories.
- references/brushes.md — all 134 brush ids by category with their aspect ratios.
- https://expocut.com/mcp.html — tool reference. Siblings: expocut-kinetic-captions, expocut-data-widgets, expocut-compositing, expocut-motion-graphics, expocut-fx-looks, expocut-asset-authoring, expocut-editor-ops.
