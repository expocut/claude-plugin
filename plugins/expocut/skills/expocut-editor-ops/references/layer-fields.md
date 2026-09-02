# Layer fields for update_layer patches

Generated from the app's `get_layer_schema` table
(schema version 2026-05-24). Call `get_layer_schema { category }` for the live list. Fields are
merged verbatim by `update_layer { id, patch }` except `startTime` and `duration`, which the tool
converts from seconds to milliseconds. Prefer the typed setter named in the notes when one exists;
it validates ids and keeps paired fields in lockstep.

## core

| field | type | unit / range | notes |
| --- | --- | --- | --- |
| id | string | | read-only |
| type | enum | video, audio, text, image, animation, collage, lowerthird, transcript, shape, generativeBg, proceduralFilter, ticker, clock, scoreboard, poll, statbar, quote, banner, newsalert, follower, likeburst, comment, qrcode, weather, caption, confetti, firemeter | read-only |
| name | string | | timeline row label |
| content | string | | file:// uri for media, the text for text layers |
| startTime | number | ms stored; seconds in a patch | or trim_layer { startTimeSec } |
| duration | number | ms stored; seconds in a patch | or trim_layer { durationSec } |
| trackIndex | number | 0 = front | use reorder_layer, which also fixes clips and tracks |
| position | object | { x, y } canvas percent, top-left | |
| scale | number | 1 = natural | |
| scaleX / scaleY | number | negative flips | or set_layer_scale_xy |
| rotation | number | degrees | |
| opacity | number | 0..1 | |
| isLocked / isHidden | boolean | | or set_layer_visibility |
| overlayColor | string or null | #RRGGBB | or set_layer_overlay_color |

## text

fontSize (8..200), fontFamily (id from list_fonts), textColor (#RRGGBB), textAlign
(left/center/right/justify), fontWeight (string, e.g. "700"), fontItalic, letterSpacing,
lineHeight (multiplier), textTransform (none/uppercase/lowercase/capitalize), textStrokeColor,
textStrokeWidth, textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY,
textBgColor, textBgPaddingH, textBgPaddingV, textBgBorderRadius, textShadeShapeId,
textShadeOpacity (0..1), styleRuns ({start, end, bold?, italic?, color?}[]),
textGradientColors (string[]), textGradientDirection (horizontal/vertical/diagonal),
textBoxWidth (0.05..1 of canvas width), textBoxOffsetX, textFullWidth, writingDirection
(auto/ltr/rtl), textPath (CurvedTextPath), rangeStart/rangeEnd (0..1), rangeRandomize,
rangeSeed, rangeInvert, fontFeatures, fontVariations.
Typed setters: update_text, set_text_font, set_text_style, set_text_effect, set_text_shade,
set_text_wrap_box, set_text_writing_direction, set_text_path, set_text_style_runs.

## animation

animation, animationPreset (string), animationSpeed (0.1..5), animationIntensity (0..100),
animationLoop (boolean), keyframes (LayerAnimation tracks; use the keyframe tools), motionPath
(MotionPathConfig; use set_layer_motion_path).

## transition

transitionIn, transitionOut (ids from list_transitions), transitionInDuration,
transitionOutDuration (milliseconds when patched directly; seconds on add_text_layer and
set_layer_transition), transitionInEasing, transitionOutEasing, transitionInIntensity,
transitionOutIntensity, transitionInBlur, transitionOutBlur. Typed setter: set_layer_transition.

## text_animation

textAnimInId, textAnimOutId, textAnimLoopId (ids from list_text_animations), textAnimInDuration,
textAnimOutDuration (milliseconds), textAnimLoopSpeed, textAnimInParams, textAnimOutParams,
textAnimLoopParams. Typed setter: set_text_animation (seconds).

## audio

volume (0..2.5), volumeKeyframes ({timeMs, volume}[]; set_layer_volume_keyframes), fadeInMs,
fadeOutMs (set_layer_fade), audioOffset (ms, -2000..2000; set_layer_audio_offset), audioMuted
(video layers; mute_video_audio), audioDetached, detachedFromVideoLayerId (unlink_video_audio /
relink_video_audio), audioEffects (set_layer_audio_effects), audioEffectPresetId,
audioTransitionIn, audioTransitionOut (set_layer_audio_transitions).

## media

mediaOffset (ms; trim_layer { mediaOffsetSec } takes seconds), naturalWidth, naturalHeight,
fitMode (contain/cover/fill/scale-down/none; set_layer_fit_mode), stretchToCanvas (legacy
boolean kept in lockstep with fitMode = fill), stretchPan ({x, y}; set_stretch_pan), anchorX,
anchorY (0..1; set_layer_anchor), aspectLocked (set_aspect_lock), blurFill (set_blur_fill),
proxyUri and proxyState (read-only), svgContent, cropRect ({x, y, width, height} 0..1;
set_layer_crop).

## color

filterId, filterIntensity (0..100; set_layer_filter uses 0..1), lut ({id, intensity};
set_layer_lut), colorAdjust ({hue, saturation, brightness, intensity}; set_layer_color_adjust),
ascCdl ({slope, offset, power, saturation}; set_layer_cdl), alphaMode (straight/premultiplied;
set_layer_alpha_mode).

## visual_effects

videoEffects (VideoEffectInstance[]; set_layer_video_effects), effectId and fxParams
(generativeBg / proceduralFilter layers; set_layer_effect), border (BorderConfig;
set_layer_border and set_layer_border_glow).

## compositing

parentId (set_layer_parent), isNull (set_layer_is_null), trackMatte (set_track_matte),
isAdjustment, isAdjustmentDisabled (set_layer_is_adjustment), timeRemap (set_time_remap),
blendMode (normal, multiply, screen, overlay, darken, lighten, color-dodge, color-burn,
hard-light, soft-light, difference, exclusion, add, subtract; set_layer_blend_mode).

## masks

layerMask (LayerMaskConfig; set_layer_mask), chromaKey (ChromaKeyConfig; set_layer_chroma_key),
backgroundRemover (BackgroundRemoverConfig; set_layer_background_remover).

## shape

shapeConfig (fill, stroke, gradient, glow; set_shape_fill, set_shape_outline, set_shape_glow,
set_shape_style), canvasRelativeWidth, canvasRelativeHeight (0..100 percent of canvas;
set_shape_canvas_relative_size).

## widget_configs

clockConfig, scoreboardConfig, pollConfig, statBarConfig, quoteConfig, bannerConfig,
newsAlertConfig, followerConfig, likeBurstConfig, commentConfig, qrCodeConfig, weatherConfig,
captionConfig, confettiConfig, fireMeterConfig, tickerConfig, lowerThirdConfig, collageConfig.
Patch through update_widget_config, which routes by layer type; read with get_widget_config.

## lottie

lottieSource, animationPresetId, animationPlaybackSpeed, animationLayerLoop, lottieResizeMode
(contain/cover/center), lottieColorFilters, lottieTextOverrides, lottieTrimStartFrame,
lottieTrimEndFrame.

## transcript

transcriptSegments (TranscriptSegment[]), transcriptFontSize, textAnimationWords
(TimestampedWord[]), textAnimationStyleId, textAnimationFullText.

## Not in the schema but patchable

`cameraEnabled` (boolean) and `z` (-1..1) opt a layer into the project camera set by
`set_camera`; `speed` and `keepPitch` are written by set_layer_speed and should be changed
through it because it also rescales `duration`.
