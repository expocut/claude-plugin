# Tool signatures used by expocut-video-creating

<!-- generated from the app's live MCP registry by ExpoCut's skill-parity test; do not edit by hand -->

Exact names, parameters and enums of every tool this skill mentions. `*` marks a required parameter.
Time arguments named startTime / duration / *Sec are seconds; keyframe timeMs is milliseconds.

## add_audio_layer

Add an audio layer from any local file:// URI (music, SFX, recordings). For TTS narration specifically use tts_add_audio_layer which generates the WAV first. duration is required (the audio file's length is not auto-detected here).

| param | type | notes |
| --- | --- | --- |
| uri\* | string |  |
| name | string |  |
| mediaOffsetSec | number |  |
| startTime | number |  |
| duration\* | number |  |
| volume | number |  |

## add_clip_sequence

Place N clips in order on the timeline as one call — the "room tour" / multi-scene composite. For each clip: imports the media (local uri, Pexels videoId, or a stockQuery that auto-picks the first landscape result), places it back-to-back on the timeline, adds a slow push-in (transform.scale keyframes scaled to that clip's own duration), sets an out-transition into the next clip, and — if `label` is given — adds a slide-in/hold/fade text label. Returns each clip's real layer ids (never guess ids like "video0") plus non-blocking warnings (e.g. a clip with no transition into the next one, or a label clamped to fit its clip).

| param | type | notes |
| --- | --- | --- |
| clips\* | array |  |
| startTimeSec | number |  |
| pushIn | any |  |
| transitionStyle | string \| null |  |
| transitionDurationSec | number |  |
| labelPosition | object |  |
| labelFontSize | number |  |
| labelFontFamily | string |  |
| labelDurationSec | number |  |

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

## add_stock_image_layer

Download a Pexels photo and add it as an image layer in the active project. Pass either photoId (recommended — picks the optimal URL) or a direct url. Defaults: full canvas size, 5s duration. trackIndex 0 (front) — the bg gradient ends up behind it.

| param | type | notes |
| --- | --- | --- |
| photoId | number |  |
| url | string |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| startTime | number |  |
| duration | number |  |
| stretchToCanvas | boolean |  |

## add_stock_music_layer

Download a Freesound clip and add it as an audio layer in the active project. Pass either soundId (recommended — picks the best preview MP3) or a direct preview url. Layer duration defaults to the full clip length reported by Freesound. Uses preview-hq-mp3 (no OAuth required); original-quality download needs OAuth2 which the app does not configure.

| param | type | notes |
| --- | --- | --- |
| soundId | number |  |
| url | string |  |
| startTime | number |  |
| duration | number |  |
| volume | number | 0..1 layer volume |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## add_stock_video_layer

Download a Pexels video and add it as a video layer. Pass videoId (recommended — picks HD or SD per qualityHint) or a direct url. Layer duration defaults to the clip duration reported by Pexels (in seconds). The layer is fit-to-screen (full-canvas) by default; pass stretchToCanvas:false to letterbox.

| param | type | notes |
| --- | --- | --- |
| videoId | number |  |
| url | string |  |
| qualityHint | string | one of: `best`, `sd` |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| startTime | number |  |
| duration | number |  |
| stretchToCanvas | boolean |  |

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

## add_video_layer

Add a video layer from any local file:// URI (camera roll exports, downloaded clips, TTS-generated screens, etc). For Pexels stock specifically use add_stock_video_layer. mediaOffsetSec sets the source in-point (e.g. mediaOffsetSec=8 to skip first 8s of source). The layer is fit-to-screen (full-canvas) by default; pass stretchToCanvas:false to letterbox.

| param | type | notes |
| --- | --- | --- |
| uri\* | string | file:// or absolute path |
| name | string |  |
| mediaOffsetSec | number |  |
| startTime | number |  |
| duration | number |  |
| x | number |  |
| y | number |  |
| scale | number |  |
| rotation | number |  |
| opacity | number |  |
| stretchToCanvas | boolean |  |
| volume | number |  |

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

## create_project

Create a new empty project. Returns the project id so subsequent calls can target it. aspectRatio defaults to 9:16 (vertical). fps stored on exportSettings.

| param | type | notes |
| --- | --- | --- |
| name\* | string |  |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| fps | number |  |

## delete_project

Permanently delete a project from disk + the Library store. If the deleted project is currently open in the editor, the editor session is cleared (projectId set to null). This is destructive — there is no undo.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## describe_canvas

Describe — as structured TEXT, no image — exactly what is composited at a given frame. Returns, for the requested time (default = current playhead): every VISIBLE layer sorted top-most first, each with its resolved bounding box in canvas % (x/y/w/h, top-left anchored; approx=true when the size is estimated), paint order (lower trackIndex paints on top), opacity and type; plus how many layers are hidden or scheduled outside this frame. This is the cheap, mount-free companion to capture_canvas — use it to reason about layout, overlap and z-order without spending an image. timeSec scrubs the described frame only.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |

## export_project

Render and encode the active project to a video file. Reuses the in-editor export pipeline — the editor must be mounted on this project (open_project auto-navigates so this normally just works). Encoder settings come from set_export_settings + the editor's defaults. Returns the local file:// path of the rendered video on success. Long timelines can take minutes; client should be patient (10-minute internal timeout).

No parameters.

## get_active_project

Return the currently-open project id, layer count, and export settings.

No parameters.

## get_canvas_info

Return the canvas/preview context in one cheap call (no image, editor need not be mounted): aspectRatio + numeric aspect, pixel width/height, fps, format, quality, total duration (ms + sec), estimated frame count, layer/track counts, current playhead, isPlaying and the selected layer id. Use this to understand the frame size and timeline length before placing layers or capturing.

No parameters.

## get_layer

Return the full Layer object (every field) for a given id. Use this to diff state, then `update_layer` to patch.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |

## get_render_status

Report render state without starting one: { isExporting, lastExportUri, exportSettings, estimatedFrames, totalDurationSec }. export_project blocks until the file is written, so use this from a second call/connection to see whether a render is in flight or to fetch the most recent output uri.

No parameters.

## keyframe_add

Add or replace a scalar keyframe on a layer. Accepts image, text, shape, and video layers for the common transform/opacity/fx/border/mask/color surface. Call list_keyframe_properties to see the full property catalog and which layer types each applies to. The easing curve (interp) is optional; default is linear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| property\* | string | one of: `transform.x`, `transform.y`, `transform.scale`, `transform.scaleX`, `transform.scaleY`, `transform.rotation`, `transform.anchorX`, `transform.anchorY`, `opacity`, `color.hueShift`, `color.saturation`, `color.brightness`, `color.contrast`, `color.intensity`, `fx.blur`, `fx.intensity`, `mask.rect.x`, `mask.rect.y`, `mask.rect.width`, `mask.rect.height`, `mask.feather`, `mask.expansion`, `mask.rotation`, `mask.bandWidth`, `mask.gradientSoftness`, `secondaryEffect.intensity`, `audio.volume`, `filter.id`, `filter.intensity`, `transition.inIntensity`, `transition.outIntensity`, `border.width`, `border.glowIntensity`, `border.cornerRadius`, `text.color.r`, `text.color.g`, `text.color.b`, `text.stroke.color.r`, `text.stroke.color.g`, `text.stroke.color.b`, `text.stroke.width`, `border.color.r`, `border.color.g`, `border.color.b`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `anchorX`, `anchorY` — Animatable scalar property. Full dot-path (transform.scale) or shorthand (scale) accepted. |
| timeMs\* | number | Time on the timeline in milliseconds. |
| value\* | number | Numeric value at this keyframe. |
| interp | object | Easing leaving this keyframe. Shape: { type: "hold" \| "linear" } \| { type: "bezier", x1, y1, x2, y2 } \| { type: "preset", name: "ease" \| "easeIn" \| "easeOut" \| "easeInOut" \| "bounce" \| "elastic" \| "spring" }. Default linear. |

## list_fonts

List the bundled text fonts (the Fonts tab): id, label, category, source (system / google / rtl) and isRTL. Filter by category (sans-serif, serif, display, handwriting, monospace, rounded, condensed, arabic, urdu, …) or source. Pass an id to set_text_font or add_text_layer({fontFamily}). Google Fonts beyond this set load at runtime.

| param | type | notes |
| --- | --- | --- |
| category | string | one of: `sans-serif`, `serif`, `display`, `handwriting`, `monospace`, `rounded`, `condensed`, `arabic`, `urdu` |
| source | string | one of: `system`, `google`, `rtl` |

## list_layers

List all layers in the active project. Returns a compact summary per layer.

No parameters.

## list_projects

List all projects with id, name, aspectRatio, and updatedAt.

No parameters.

## list_transitions

List all entrance/exit transitions (fadeIn, slideUp, lightCinematic, …). Use the returned id at creation time with add_text_layer / add_shape_layer transitionIn or transitionOut, or on an existing layer with set_layer_transition. Shader-category ids are cover-and-reveal GPU transitions. Durations are in seconds.

No parameters.

## mute_video_audio

Mute or unmute the embedded audio on a video layer (does not detach the audio into its own track).

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| muted\* | boolean |  |

## open_project

Load a project into the active editor session by id.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## preview_filmstrip

Capture a STRIP of evenly-spaced frames across a time range and return them as labeled MCP image blocks — so you can SEE motion, a transition or pacing instead of one still. Args: fromSec (default 0), toSec (default project end), frames (1..12, default 6), maxWidth (64..512, default 320), format ("jpg" default / "png"), quality. The leading text block lists each frame index and time. Requires the editor mounted on the active project (same as capture_canvas). For a single high-detail frame use capture_canvas instead.

| param | type | notes |
| --- | --- | --- |
| fromSec | number |  |
| toSec | number |  |
| frames | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |

## remove_layer

Remove the layer with the given id from the active project.

| param | type | notes |
| --- | --- | --- |
| id\* | string |  |

## render_still

Render the current frame to an image FILE on disk and return its file:// uri (plus width/height/atMs). Unlike capture_canvas (which returns an inline preview image for you to look at), this writes a reusable file — e.g. a poster/thumbnail, or a frame to re-import with add_image_layer. timeSec scrubs the playhead first; maxWidth defaults to the canvas pixel width (cap 2160). Requires the editor mounted on the active project.

| param | type | notes |
| --- | --- | --- |
| timeSec | number |  |
| maxWidth | number |  |
| format | string | one of: `png`, `jpg` |
| quality | number |  |

## reorder_layer

Change a layer's z-order. "front" pulls it to trackIndex 0 (top); "back" pushes it past every other layer (bottom). Pass an explicit number for fine control. Other layers are shifted to keep the trackIndex sequence dense.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| position\* | any |  |

## save_history_checkpoint

Push a session-scoped checkpoint of the editor state onto the undo stack. Returns the checkpoint id. Use undo() to revert to the previous checkpoint or undo_to_checkpoint({id}) for direct jump.

| param | type | notes |
| --- | --- | --- |
| label | string |  |

## save_project

Persist the active editor session to projects.json. Call after any sequence of layer mutations to make them durable across app restarts.

No parameters.

## set_export_settings

Update the active project export settings (aspectRatio, resolution, quality, format, fps). Only the fields you pass are changed; the rest are preserved.

| param | type | notes |
| --- | --- | --- |
| aspectRatio | string | e.g. "9:16", "16:9", "1:1" |
| resolution | string | e.g. "1080x1920" |
| quality | string |  |
| format | string |  |
| fps | number |  |

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

## set_layer_fade

Set per-layer fade-in and/or fade-out (milliseconds). Works on every layer type. For video/audio it ducks the alpha + volume envelope; for text/shape it cross-fades the rendered alpha. Pass 0 to clear.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| fadeInMs | number |  |
| fadeOutMs | number |  |

## set_layer_speed

Set a video/audio layer's playback speed (slow-mo / fast-forward). speed=2 plays twice as fast and halves the clip's timeline duration; speed=0.5 is slow motion and doubles it. The source in/out points are preserved (only the timeline length changes). keepPitch (default true) keeps the audio pitch natural; set false for the classic varispeed effect. Video / audio layers only. Presets: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| speed\* | number | 0.1..100 (e.g. 0.5 = slow-mo, 2 = 2× faster) |
| keepPitch | boolean | preserve audio pitch (default true) |

## set_layer_transition

Set or change the entrance (in) / exit (out) transition on an EXISTING layer. Each role takes a transition id from list_transitions plus optional durationSec/easing/intensity/blur. Classic and Shader-category ids are mutually exclusive per role — picking one clears the other automatically. For Shader-category ids (liquidwipe, slicewipe, …) you can also "Customize" the look via preset (a named preset like "Pink Boards" / "Cyan Shards") and shaderParams (fxParams such as fillColors / angle / transparentBg / revealOnly / useTexture — see get_effect_schema). Pass {id:null} (or "none") to clear a role. Provide at least one of in/out.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| in | object |  |
| out | object |  |

## split_layer

Cut a layer into two halves at atSec (relative to the layer's startTime). The first half keeps the original id; the second half is a fresh layer with its mediaOffset advanced by atSec so it continues playing the source seamlessly. Both halves keep all styling, effects, color settings.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| atSec\* | number |  |

## stock_curated_photos

Pexels curated/featured photo feed. Same return shape as stock_search_photos.

| param | type | notes |
| --- | --- | --- |
| page | number |  |
| perPage | number |  |

## stock_popular_videos

Pexels popular video feed. Duration filters are post-filtered client-side.

| param | type | notes |
| --- | --- | --- |
| page | number |  |
| perPage | number |  |
| minDuration | number |  |
| maxDuration | number |  |

## stock_search_music

Search Freesound for music / audio clips. Returns id, name, username, duration (seconds), tags, waveform url, and a preview url for each result. Use the returned id with add_stock_music_layer to drop the sound onto the timeline. category buckets: music | sfx | ambient | vocals | nature | electronic | cinematic | all. minDuration / maxDuration are post-filtered client-side. Default sort downloads_desc (most popular first).

| param | type | notes |
| --- | --- | --- |
| query | string |  |
| category | string | one of: `all`, `music`, `sfx`, `ambient`, `vocals`, `nature`, `electronic`, `cinematic` |
| page | number |  |
| perPage | number | Default 15 |
| sort | string | one of: `score`, `duration_desc`, `duration_asc`, `created_desc`, `created_asc`, `downloads_desc`, `downloads_asc`, `rating_desc`, `rating_asc` |
| minDuration | number | seconds |
| maxDuration | number | seconds |

## stock_search_photos

Search Pexels photos. Returns id, photographer, alt, width/height and a thumbnail url for each result. Use the returned id with add_stock_image_layer to drop the photo onto the canvas. orientation: landscape|portrait|square. color: red|orange|yellow|green|turquoise|blue|violet|pink|brown|black|gray|white.

| param | type | notes |
| --- | --- | --- |
| query\* | string |  |
| orientation | string | one of: `landscape`, `portrait`, `square` |
| size | string | one of: `large`, `medium`, `small` |
| color | string |  |
| page | number |  |
| perPage | number | Default 20, max 80 |

## stock_search_videos

Search Pexels videos. Returns id, photographer, duration (seconds), width/height and a preview thumbnail url. Use the returned id with add_stock_video_layer. minDuration / maxDuration are post-filtered client-side (Pexels search has no native duration filter).

| param | type | notes |
| --- | --- | --- |
| query\* | string |  |
| orientation | string | one of: `landscape`, `portrait`, `square` |
| size | string | one of: `large`, `medium`, `small` |
| page | number |  |
| perPage | number |  |
| minDuration | number | seconds |
| maxDuration | number | seconds |

## stock_trending_music

Freesound trending feed (sorted by all-time downloads, no query). Same return shape as stock_search_music. Duration filters are post-filtered client-side.

| param | type | notes |
| --- | --- | --- |
| perPage | number |  |
| minDuration | number |  |
| maxDuration | number |  |

## trim_layer

Trim a video/audio (or any) layer. mediaOffsetSec moves the in-point into the source media; durationSec sets how long the clip plays for on the timeline; startTimeSec moves where on the timeline the clip starts. Pass any subset — omitted fields stay put.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| mediaOffsetSec | number |  |
| durationSec | number |  |
| startTimeSec | number |  |

## update_text

Edit the core properties of an EXISTING text layer (the Edit Text ▸ Text tab): text content, fontSize (pt), lineHeight (multiplier), fontWeight ("400"/"700"/"bold"), fontItalic, textTransform (none/uppercase/lowercase/capitalize = the Abc/ABC/abc case toggles), textAlign (left/center/right/justify), letterSpacing (pt), textColor (#RRGGBB), opacity (0..1). Only the fields you pass change. For the one-tap look presets use set_text_style; for the font use set_text_font.

| param | type | notes |
| --- | --- | --- |
| layerId\* | string |  |
| text | string |  |
| fontSize | number |  |
| lineHeight | number |  |
| fontWeight | string | e.g. "400", "700", "bold" |
| fontItalic | boolean |  |
| textTransform | string | one of: `none`, `uppercase`, `lowercase`, `capitalize` |
| textAlign | string | one of: `left`, `center`, `right`, `justify` |
| letterSpacing | number |  |
| textColor | string | #RRGGBB |
| opacity | number | 0..1 |
