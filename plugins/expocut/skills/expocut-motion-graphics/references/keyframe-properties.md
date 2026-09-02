# Keyframeable properties (58)

Generated from list_keyframe_properties and the app's keyframe type definitions.
Scalar properties go through keyframe_add (numeric `value`, optional `interp`); discrete
properties go through keyframe_add_discrete (string or boolean `value`, held-step, no
interpolation). All times are timeline milliseconds on the tool calls (`timeMs`) and
microseconds in the stored animation (`t`).

Layer-type key: I = image, T = text, S = shape, V = video, A = audio.

## Transform (scalar; I T S V)

| property | unit / range | notes |
| --- | --- | --- |
| transform.x | canvas percent 0..100 | top-left corner of the layer box, same as `position.x` |
| transform.y | canvas percent 0..100 | top-left corner, same as `position.y` |
| transform.scale | multiplier, 1 = authored size | uniform; pivots on the anchor |
| transform.scaleX | multiplier | negative mirrors horizontally; multiplies with scale |
| transform.scaleY | multiplier | negative flips vertically |
| transform.rotation | degrees clockwise | shortest-arc interpolation, so 350 to 10 turns 20 degrees |
| transform.anchorX | 0..1 layer-local | 0 = left edge, 0.5 = centre (default) |
| transform.anchorY | 0..1 layer-local | 0 = top edge, 0.5 = centre (default) |

A grouped 2D `positionTrack` (keyframes `{ t, v: [x, y], to, ti }`) also exists inside
keyframe_set_animation; when present it overrides transform.x/transform.y. Motion paths
bake into it at export.

## Opacity (scalar; I T S V)

| property | unit / range |
| --- | --- |
| opacity | 0..1 |

## Colour grade offsets (scalar; I T S V)

Offsets where 0 is neutral, same scale as set_layer_color_adjust.

| property | unit / range |
| --- | --- |
| color.hueShift | degrees of hue rotation |
| color.saturation | -1 (greyscale) .. +1 |
| color.brightness | -1 (black) .. +1 (white) |
| color.contrast | -1 .. +1 |
| color.intensity | 0..1 blend of the whole adjustment |

## FX (scalar; I T S V)

| property | unit / range | notes |
| --- | --- | --- |
| fx.blur | px gaussian radius | fake motion blur, focus pulls |
| fx.intensity | 0..1 | strength of the layer's current effect (set_layer_effect) |
| secondaryEffect.intensity | 0..1 | strength of the layer's secondary effect |

## Mask (scalar; I T S V)

Geometry matches set_layer_mask; keyframes only take effect while a mask is enabled.

| property | unit / range | notes |
| --- | --- | --- |
| mask.rect.x | 0..1 layer-local | offset of the mask rect |
| mask.rect.y | 0..1 layer-local | |
| mask.rect.width | 0..1 layer-local | 1 = full layer width |
| mask.rect.height | 0..1 layer-local | |
| mask.feather | px at 1080p, 0..100 | edge softness |
| mask.expansion | signed px at 1080p | grow (+) or shrink (-) the shape |
| mask.rotation | degrees | about the rect centre |
| mask.bandWidth | 0..1 | mirror band half-width; roundedRect corner radius (0..0.5) |
| mask.gradientSoftness | 0..1 | linear / radial / angular gradient masks |

## Filter and transition strength (scalar; I T S V)

| property | unit / range | notes |
| --- | --- | --- |
| filter.id | numeric filter index (held) | prefer create_mask_animation's `filterId` string or set_layer_filter |
| filter.intensity | 0..1 | blend of the current filter |
| transition.inIntensity | 0..1 | strength of the entrance transition |
| transition.outIntensity | 0..1 | strength of the exit transition |

## Border (scalar; I T S V)

Only visible when set_layer_border or set_layer_border_glow is enabled.

| property | unit / range |
| --- | --- |
| border.width | px at 1080p |
| border.glowIntensity | 0..100 |
| border.cornerRadius | px |
| border.color.r, border.color.g, border.color.b | 0..255 per channel (recomposed to #RRGGBB) |

## Audio (scalar; V A)

| property | unit / range | notes |
| --- | --- | --- |
| audio.volume | 0..1 | set_layer_volume_keyframes is the simpler route for ducking |

## Text colour and stroke (scalar; T only)

| property | unit / range |
| --- | --- |
| text.color.r, text.color.g, text.color.b | 0..255 per channel |
| text.stroke.color.r, text.stroke.color.g, text.stroke.color.b | 0..255 per channel |
| text.stroke.width | px |

Animate all three channels together; a missing channel falls back to the static colour.

## Discrete, held-step (keyframe_add_discrete)

| property | applies to | value |
| --- | --- | --- |
| text.fontWeight | T | "100".."900", "normal", "bold" |
| text.italic | T | true / false |
| text.fontFamily | T | font id from list_fonts |
| text.align | T | left, center, right, justify |
| text.transform | T | none, uppercase, lowercase, capitalize |
| border.pattern | I T S V | solid, dashed, dotted, double |
| border.glowMode | I T S V | static, pulse, rainbow, chase, breathe, gradient |
| mask.shape | I T S V | rectangle, roundedRect, ellipse, triangle, star, heart, cross, xShape, linear, mirror, radial, angular, diamond, path, text |
| mask.invert | I T S V | true / false |
| mask.mirrorAxis | I T S V | horizontal, vertical |
| transition.in.id | I T S V | id from list_transitions; re-triggers the entrance from that time |
| transition.out.id | I T S V | id from list_transitions |
| shape.fillStyle | S | fill style id (solid, gradient, ...) |
| lut.id | none | listed by the catalog but rejected for every layer type today |

## Interp reference

| interp | meaning |
| --- | --- |
| `{ type: "linear" }` | default |
| `{ type: "hold" }` | value jumps at the next keyframe |
| `{ type: "bezier", x1, y1, x2, y2 }` | CSS cubic-bezier; x in 0..1, y may overshoot |
| `{ type: "preset", name }` | ease (0.25,0.1,0.25,1), easeIn (0.42,0,1,1), easeOut (0,0,0.58,1), easeInOut (0.42,0,0.58,1), bounce, elastic, spring |

create_mask_animation additionally accepts the mask curves flow, jumper and discer by name.
