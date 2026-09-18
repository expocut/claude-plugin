# Tool signatures used by expocut-asset-authoring

<!-- generated from the live MCP registry by apps/mobile/src/mcp/__tests__/skillsParity.test.ts; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_light_leak_overlay

Add a CDN Light Leak as a real-footage overlay on a new "light" track above the current content. Looks the preset up by id (use list_light_leaks to discover ids). The clip is cached locally, then tiled back-to-back to fill `duration`. intensity (0..1) overrides the preset's default opacity. Distinct from apply_fx_template's leak transition.

| param | type | notes |
| --- | --- | --- |
| presetId\* | string |  |
| category | string | one of: `warm-sunset`, `cool-window`, `cool-bokeh`, `prism-rainbow`, `prism-edge`, `vintage-filmburn`, `neon`, `soft-anamorphic`, `sun-flare` |
| startTime | number | seconds |
| duration | number | seconds |
| intensity | number |  |

## apply_global_color_grade

Apply a uniform LUT + colorAdjust to every video/image layer that overlaps the given time range. Use this for "look" passes — a teal/orange grade across all clips of a reel, a B&W look on a flashback section, etc. Calling once is equivalent to running set_layer_lut + set_layer_color_adjust on each affected layer. Layers outside the range are untouched. Returns the count and ids of layers patched. hue/saturation/brightness/intensity use the SAME scale as set_layer_color_adjust: offsets where 0 is neutral (saturation/brightness -1..+1), NOT multipliers.

| param | type | notes |
| --- | --- | --- |
| startSec | number |  |
| endSec | number |  |
| lutId | string |  |
| lutIntensity | number | 0..1; default 1 |
| hue | number | 0..360 degrees of rotation; 0 = neutral |
| saturation | number | -1 (greyscale) .. +1 (double); 0 = neutral |
| brightness | number | -1 (black) .. +1 (white); 0 = neutral |
| intensity | number | 0..1 global blend of the adjustment |
| includeImages | boolean |  |
| includeVideos | boolean |  |

## bake_cdl_to_cube

Bake an ASC-CDL into an Adobe `.cube` 3D LUT text payload (DaVinci/Premiere/FCP compatible). Sizes 17/33/65; default 33. Returns `{ cube, size }` — the text is ready to be written to a `.cube` file.

| param | type | notes |
| --- | --- | --- |
| cdl\* | object |  |
| size | number | one of: `17`, `33`, `65` |
| title | string |  |
| allowNegative | boolean |  |
| clipOutput | boolean |  |

## border_delete_preset

Remove a previously-registered border preset by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| alsoFromDisk | boolean |  |

## border_list_presets

List registered AI/user border presets. Returns metadata only.

| param | type | notes |
| --- | --- | --- |
| author | string | one of: `ai`, `user`, `any` |

## border_register_preset

Save a named BorderConfig preset under a stable id so the agent can reuse the same border across layers. Validates colour strings, width / radius caps, sides shape, and the optional glow block.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| config\* | object |  |
| persist | boolean |  |

## capture_canvas

Capture the editor canvas to a PNG (or JPG) at a given frame and return it as an MCP image block, so you can SEE the project state — layer placement, colors, overlap, final composition. The leading text block is SELF-DESCRIBING for debugging: it reports the captured time, project canvas size (aspectRatio + resolution), total length, layer/track counts, and — most useful — the list of layers actually VISIBLE at that frame (sorted top-most first, each with its computed bounding box in canvas %), so an empty/wrong frame is immediately explainable. DEBUG VIEWS: xray=true dims the composition and draws labeled layer bounding boxes on top; outlinesOnly=true hides content entirely (borders only); grid=true overlays a 10%-step coordinate grid with % labels to pin-point positions — all composable with timeSec. Requires the editor mounted on the active project (Library → tap the project). timeSec scrubs the playhead first; maxWidth defaults to 512 (cap 1024). ANDROID CAVEAT: this capture is a software view-snapshot, which does NOT include camera-based 3D — a layer with rotationX/rotationY renders FLAT here even though the real screen and the export both show the tilt. When that applies to the frame you asked for, the result carries a `warnings` entry naming the affected layers; use capture_export_frame to see the tilt. Do not read a flat capture as a tilt bug on Android.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |
| xray | boolean |  |
| outlinesOnly | boolean |  |
| grid | boolean |  |

## clear_layer_fade_mask

Remove the spatial fade mask ("fade on edge") from a layer.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## create_mask_animation

Create a complete mask animation in one call. Select any mask shape and a built-in pattern (shape-aware samples such as mirror:sample:reveal, or core patterns such as reveal, pulse, sweep, elastic), then choose a curve/easing. For full control pass keyframes as a custom graph; each node can change mask rect, feather, expansion, rotation, bandWidth, invert, opacity, layerRotation, and filter. The result is real LayerAnimation data used by canvas preview and export, and returns a receipt.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| shape | string | one of: `rectangle`, `roundedRect`, `ellipse`, `triangle`, `star`, `heart`, `cross`, `xShape`, `linear`, `mirror`, `radial`, `angular`, `diamond`, `path`, `text` |
| rect | object |  |
| rotation | number |  |
| bandWidth | number |  |
| feather | number |  |
| expansion | number |  |
| gradientSoftness | number |  |
| invert | boolean |  |
| mirrorAxis | string | one of: `horizontal`, `vertical` |
| pattern | string | Built-in pattern id. Omit when using custom keyframes. |
| curve | any | Easing applied to scalar transitions; supports named curves or cubic bezier. |
| keyframes | array | Custom animation graph nodes, sorted automatically by timeMs. |
| replaceExisting | boolean | Clear prior mask/opacity/filter tracks (default true). |

## fx_compose_from_template

Materialize a full FxSpec from a curated template family and overrides. Templates: transition.distortion.{warp|ripple|melt|inkBleed|liquid|twirl|pinch|displace} and transition.lightLeak.{warm-sunset|cool-window|prism-rainbow|vintage-orange|neon-magenta|soft-anamorphic}. The agent never writes raw GLSL through this tool — only typed param overrides.

| param | type | notes |
| --- | --- | --- |
| templateId\* | string |  |
| name\* | string |  |
| id | string | Optional; auto-generated when omitted. |
| params | object |  |
| durationMs | number |  |
| persist | boolean |  |

## fx_delete_custom

Remove a previously-registered FxSpec by id. Refuses to touch built-ins. Pass alsoFromDisk: true to also delete the persisted file.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| alsoFromDisk | boolean |  |

## fx_dry_run

Validate + sample-evaluate a candidate FxSpec at the given times. NEVER persists, NEVER admits. Use as the first call when authoring — the returned samples let the agent verify the curve shape before paying the quota cost on register.

| param | type | notes |
| --- | --- | --- |
| spec\* | object |  |
| sampleTimes | array |  |

## fx_list_custom

List FxSpecs whose author is ai or user (never builtin). Capped at 50 entries. Use to audit prior registrations before composing a follow-up spec.

| param | type | notes |
| --- | --- | --- |
| author | string | one of: `ai`, `user`, `any` |
| kind | string | one of: `filter`, `layer-fx`, `transition`, `generator` |
| category | string | one of: `Animation`, `Distortion`, `Stylize`, `Glitch`, `Light`, `Color`, `Transition`, `Generator`, `Custom` |

## fx_register_spec

Submit a full FxSpec (declarative or shader) and admit it to the registry. Validates shape, checks id format, applies quota / rate limit, then admits. Returns the admitted id; the spec is immediately usable via set_layer_effect.

| param | type | notes |
| --- | --- | --- |
| spec\* | object |  |
| persist | boolean |  |
| overwriteIfExists | boolean |  |
| idempotencyKey | string |  |

## keyframe_add

Add or replace a scalar keyframe on a layer. Accepts image, text, shape, and video layers for the common transform/opacity/fx/border/mask/color surface. Call list_keyframe_properties to see the full property catalog and which layer types each applies to. The easing curve (interp) is optional; default is linear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `transform.x`, `transform.y`, `transform.scale`, `transform.scaleX`, `transform.scaleY`, `transform.rotation`, `transform.rotationX`, `transform.rotationY`, `transform.anchorX`, `transform.anchorY`, `opacity`, `color.hueShift`, `color.saturation`, `color.brightness`, `color.contrast`, `color.intensity`, `fx.blur`, `fx.intensity`, `mask.rect.x`, `mask.rect.y`, `mask.rect.width`, `mask.rect.height`, `mask.feather`, `mask.expansion`, `mask.rotation`, `mask.bandWidth`, `mask.gradientSoftness`, `secondaryEffect.intensity`, `audio.volume`, `filter.id`, `filter.intensity`, `transition.inIntensity`, `transition.outIntensity`, `border.width`, `border.glowIntensity`, `border.cornerRadius`, `text.color.r`, `text.color.g`, `text.color.b`, `text.stroke.color.r`, `text.stroke.color.g`, `text.stroke.color.b`, `text.stroke.width`, `border.color.r`, `border.color.g`, `border.color.b`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `rotationX`, `rotationY`, `anchorX`, `anchorY` — Animatable scalar property. Full dot-path (transform.scale) or shorthand (scale) accepted. |
| timeMs\* | number | Time on the timeline in milliseconds. |
| value\* | number | Numeric value at this keyframe. |
| interp | object | Easing leaving this keyframe. Shape: { type: "hold" \| "linear" } \| { type: "bezier", x1, y1, x2, y2 } \| { type: "preset", name: "ease" \| "easeIn" \| "easeOut" \| "easeInOut" \| "bounce" \| "elastic" \| "spring" }. Default linear. |

## list_border_presets

List the built-in border presets (the Border panel preset row: Polaroid, Film Strip, Neon Pink, Rainbow, Cyan Breathe, …): id + name. Apply with set_layer_border({presetId}). (Distinct from border_list_presets, which lists your own custom-registered presets.)

No parameters.

## list_effects

List all visual effects available for layers (aurora, plasma, glitch, springEntrance, etc). Filter by category (entrance|exit|motion|style|glitch|generative|filter|transition|text|sticker) or scope (layer|background|filter|transition). Use the returned id with set_layer_effect.

| param | type | notes |
| --- | --- | --- |
| category | string |  |
| scope | string |  |

## list_light_leaks

List Light Leak overlay presets from the CDN catalog. Without `category`, returns the curated "popular" set; pass a category to list that group. Categories: warm-sunset, cool-window, cool-bokeh, prism-rainbow, prism-edge, vintage-filmburn, neon, soft-anamorphic, sun-flare. Returns id, name, category, posterUrl, loopDurationMs, defaultBlend, defaultIntensity. Pass an id to add_light_leak_overlay. (For a leak *transition* between clips use apply_fx_template instead.)

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `warm-sunset`, `cool-window`, `cool-bokeh`, `prism-rainbow`, `prism-edge`, `vintage-filmburn`, `neon`, `soft-anamorphic`, `sun-flare` |

## lut_delete_custom

Remove a previously-registered custom LUT by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| alsoFromDisk | boolean |  |

## lut_list_custom

List registered custom LUTs (AI and user). Returns metadata only — pass the id to set_layer_lut to apply.

| param | type | notes |
| --- | --- | --- |
| author | string | one of: `ai`, `user`, `any` |

## lut_register_custom

Register a custom 3D LUT. Two variants: pass cubeText for a raw Adobe .cube file, or pass grade for a declarative {whiteBalance, toneCurve, lift} descriptor that gets baked to a Lut3d on demand. The new id is callable from set_layer_lut.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| cubeText | string | Raw Adobe .cube text. Max 1 MB. |
| grade | object |  |
| persist | boolean |  |

## mask_delete_custom

Remove a previously-registered custom mask shape by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| alsoFromDisk | boolean |  |

## mask_list_custom

List registered AI/user custom mask shapes (metadata only).

| param | type | notes |
| --- | --- | --- |
| author | string | one of: `ai`, `user`, `any` |

## mask_register_shape

Register a custom mask shape. Geometry kinds: rect | ellipse (rx, ry in (0,1]) | polygon (3..256 points, normalized) | path (limited SVG d — M L Q C Z only, ≤2048 chars). Runs a 64×64 bake probe to verify non-empty / non-trivial coverage before admitting.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| name\* | string |  |
| geometry\* | object |  |
| feather | number |  |
| invert | boolean |  |
| persist | boolean |  |

## parse_cube_lut

Parse an Adobe `.cube` LUT text file. Returns the parsed metadata (size, domain, title) and the data length. The data buffer itself is not serialized — call `apply_global_color_grade` or future LUT tools to use the LUT in the editor.

| param | type | notes |
| --- | --- | --- |
| text\* | string |  |

## set_junction_transition

Put a transition on the CUT between two adjacent clips (the joiner), or change the one already there. Address the cut by the pair of layers that meet at it — call list_junctions first to find them. effectId comes from list_transitions (e.g. wipe.iris, slide.push-left, distort.warp, dissolve.cross). durationSec is clamped to what the cut can actually hold at the chosen alignment. params carries the family options, and is the ONLY route to several of them: wipe.iris takes originX / originY (0..1, where the circle grows from; 0.5/0.5 = centre) and bulge (0..1 rim refraction — a water-droplet lens riding the advancing edge); the distort family takes blur, blurAniso (0 = even blur, 1 = a directional streak), blurAngle (degrees) and blurStreak; wipes take angle / softness / borderWidth; dissolve.film takes gamma. Unknown params are ignored, out-of-range values are clamped.

| param | type | notes |
| --- | --- | --- |
| fromLayerId\* | string | Outgoing clip — the one that ends at the cut. |
| toLayerId\* | string | Incoming clip — the one that starts at the cut. |
| effectId\* | string | Transition id from list_transitions. |
| durationSec | number | Clamped to the cut's capacity. Default 1s. |
| alignment | string | one of: `center`, `start`, `end` |
| ease | string | one of: `none`, `in`, `out`, `inOut`, `custom` |
| reverse | boolean | Play the effect backwards. |
| endRatio | number | Progress reached on the final frame, 0..1. Below 1 the incoming clip never fully resolves. |
| params | object | Family options — see the description. |

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

## set_layer_cdl

Apply an ASC CDL grade (slope/offset/power + saturation) to a layer. Each of slope/offset/power is an RGB triplet. Partial inputs merge with existing values; identity = [1,1,1]/[0,0,0]/[1,1,1] sat=1.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| slope | array |  |
| offset | array |  |
| power | array |  |
| saturation | number |  |

## set_layer_effect

Apply (or clear) a visual effect on an existing layer. Use list_effects to discover valid effectIds and which params each accepts. Pass effectId=null or "" to remove the effect.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| effectId | string \| null |  |
| params | object |  |

## set_layer_fade_mask

Apply a spatial gradient alpha fade ("fade on edge") to an image/video/shape layer. mode: linear (directional gradient via angle 0=left,90=top,180=right,270=bottom), radial (vignette outward from center), or inset (feather inward from all four edges). position/softness/floor are 0..1; invert flips opaque/transparent; curve eases the ramp. Fields you omit keep their current value (or the default on first apply). Distinct from the time-based fadeInMs/fadeOutMs ramps. Use clear_layer_fade_mask to remove.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| enabled | boolean |  |
| mode | string | one of: `linear`, `radial`, `inset` |
| angle | number |  |
| position | number |  |
| softness | number |  |
| floor | number |  |
| invert | boolean |  |
| curve | string | one of: `linear`, `easeIn`, `easeOut`, `easeInOut` |

## set_layer_lut

Apply a 3D LUT (color lookup table) to an image or video layer. `id` is the LUT id from the app's registered LUTs. intensity blends 0..1 (1 = full LUT, 0 = no change). Pass id=null or "" to remove the LUT.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| id | string \| null |  |
| intensity | number |  |

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

## set_layer_transition

Set or change the entrance (in) / exit (out) transition on an EXISTING layer. Each role takes a transition id from list_transitions plus optional durationSec/easing/intensity/blur. Classic and Shader-category ids are mutually exclusive per role — picking one clears the other automatically. For Shader-category ids (liquidwipe, slicewipe, …) you can also "Customize" the look via preset (a named preset like "Pink Boards" / "Cyan Shards") and shaderParams (fxParams such as fillColors / angle / transparentBg / revealOnly / useTexture — see get_effect_schema). Pass {id:null} (or "none") to clear a role. Provide at least one of in/out.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object |  |
| out | object |  |

## update_layer

Merge a partial patch into the layer with the given id. Use this for tweaks like changing position, opacity, scale, fontSize, transitionIn etc. without rebuilding the layer. rotationX / rotationY tilt the layer out of plane in degrees (0 = flat, clamped to ±75) — that is the card-in-3D-space move; plain `rotation` remains the in-plane spin. Supported on every visual layer type that can rotate at all — image, video, base video, text, shape, shape-widget, collage and Lottie — on canvas and at export. Android adds transcript and lower-third; on iOS those two carry no layer rotation in the encoder at all, so they stay flat there.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |
| patch\* | object |  |
