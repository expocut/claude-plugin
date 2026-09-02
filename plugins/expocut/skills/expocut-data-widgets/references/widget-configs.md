# Widget config reference (add_widget_layer config / update_widget_config)

Read from the app's default-config factories. add_widget_layer deep-merges your partial config into these defaults; update_widget_config shallow-merges (top-level keys only, nested objects and arrays replaced wholesale). Values shown are the defaults. Sizes are display points (about 1080-px design size / 2.7); durations in ms unless noted.

Shared "widget FX" keys (present on every widget except where noted): transition none | fade | slideUp | slideDown | slideLeft | slideRight | zoom | bounce (default none); transitionDuration 500 (ms); glowEnabled false, glowColor, glowRadius 8; borderEnabled false, borderColor #FFFFFF, borderWidth 2, borderRadius; shadowEnabled false, shadowColor #000000, shadowOffsetX 0, shadowOffsetY 3.

## live-clock / countdown / stopwatch (layer type clock, field clockConfig)

mode live-clock | countdown | stopwatch (set by the widgetId); format HH:MM:SS | HH:MM | MM:SS | MM:SS.ms | H:MM:SS | D:HH:MM:SS | "Dd HHh MMm SSs" (default HH:MM:SS); countdownFromMs 60000; fontSize 48; fontWeight regular | medium | semibold | bold | heavy (bold); fontFamily (optional); textColor #FFFFFF; digitSpacing 2; colonOpacity 1; showMilliseconds false; bgEnabled true, bgColor #000000, bgOpacity 0.7, bgRadius 12, paddingH 20, paddingV 12; borderRadius 12; showLabel false, labelText "LIVE", labelBgColor #FF3B30, labelTextColor #FFFFFF; glowColor #007AFF. Timers run from the layer's startTime.

## scoreboard (scoreboardConfig)

teamA { name "HME", fullName "Home Team", score 0, color #007AFF, secondaryColor #FFFFFF }; teamB { name "AWY", fullName "Away Team", score 0, color #FF3B30, secondaryColor #FFFFFF }; sport "BASKETBALL"; period "Q1"; showPeriod true; showSport false; layout compact | standard | broadcast | minimal (standard); bgColor #1C1C1E, bgOpacity 0.92; dividerColor #48484A; scoreColor #FFFFFF; scoreFontSize 28; nameFontSize 13; periodFontSize 11; borderRadius 12; borderWidth 1; useTeamColors true.

## stat-bar (statbar, statBarConfig)

label "STAT"; subLabel "Player Name"; value 75; unit "%"; showValue, showLabel, showSubLabel true; style standard | segmented | gradient | neon (standard); barColor #007AFF; barColorStops (string[], gradient style); barBgColor rgba(255,255,255,0.15); textColor #FFFFFF; labelColor #AAAAAA; barHeight 16; barRadius 8; fontSize 13; valueFontSize 22; bgEnabled true, bgColor #1C1C1E, bgOpacity 0.9, bgRadius 12; padding 14; animateOnPlay true; animationDuration 1000; segmentCount 10; borderRadius 12.

## follower-counter (follower, followerConfig)

count 125400; label "Subscribers"; platform youtube | instagram | tiktok | twitter | twitch | custom; customPlatformName "My Channel"; platformIcon (emoji); style card | pill | badge | minimal | broadcast (card); animated true; bgColor #1C1C1E, bgOpacity 0.92; textColor #FFFFFF; accentColor #FF3B30; showIcon true; showLabel true; showGrowthBadge false; growthText "+1.2K today"; fontSize 28; labelFontSize; borderRadius.

## like-burst (likeburst, likeBurstConfig)

emojiType heart | thumbs | fire | star | clap | custom (heart); customEmoji; color #FF2D55; particleCount 10; size 24; speed 1.5; spread 60; showCount true; countValue 1247; countColor #FFFFFF; countBgColor #FF2D55; countFontSize 14; borderRadius 12. Default layer duration 2 s.

## comment-bubble (comment, commentConfig)

username "user_name"; message; platform youtube | instagram | tiktok | twitter | twitch | generic; style modern | chat | broadcast | minimal (modern); avatarColor #FF3B30; avatarInitial "U"; bgColor #1C1C1E, bgOpacity 0.92; textColor #FFFFFF; usernameColor #FFCC00; accentColor #FF3B30; fontSize 14; usernameFontSize 13; borderRadius 14; maxWidthPct 75; showPlatformBadge true; showTimestamp false; timestampText "just now"; animateIn true; showVerified false; showAvatar true.

## news-ticker (ticker, tickerConfig)

items: [{ id, text, iconType none | breaking | live | alert | info | sports | weather | finance | politics | tech | custom, customIcon (when custom), enabled }] (default sample items); divider { enabled true, symbol "●", color #FF3B30, spacingLeft 16, spacingRight 16 }; loopGapPx 120; itemSpacingPx 0; direction left | right; speed 400 (px/s at a 390-px baseline, scaled to the canvas); loop true; label { enabled true, text "BREAKING NEWS", bgColor #FF3B30, textColor #FFFFFF, fontWeight "800", paddingH 10, paddingV 5, borderRadius 2, pulse false }; fontSize 14; fontWeight "500"; textColor #FFFFFF; textUppercase false; letterSpacing 0.3; glow { enabled false, color, radius 6, intensity 60 }; stroke { enabled false, color #000000, width 1 }; bgEnabled true, bgColor #1A1A1A, bgOpacity 0.92, bgHeightPct 0.065 (fraction of canvas height), bgGradient false, bgGradientColors [2 stops]; borderEnabled true, borderColor #FF3B30, borderWidth 2, borderSides "top"; stripGlowEnabled false, stripGlowColor, stripGlowRadius 12, stripGlowIntensity 50. remoteFeed { enabled, url, jsonField, pollIntervalMs } and schedule { enabled, visibleMs, hiddenMs, fadeDurationMs } exist for the in-app live mode only. No shared transition key.

## breaking-banner (banner, bannerConfig)

text "Breaking News Headline Goes Here"; subtext; showSubtext false; badgeText "BREAKING"; showBadge true; icon (emoji); showIcon false; position top | bottom (bottom); animation slide | fade | flash | none (slide); style breaking | alert | info | sports | custom; bgColor #1C1C1E; textColor #FFFFFF; badgeBgColor #FF3B30; badgeTextColor #FFFFFF; accentColor #FF3B30; fontSize 16; subtextFontSize 12; badgeFontSize 10; borderRadius 0; paddingV 14; uppercase false.

## news-alert (newsalert, newsAlertConfig)

headline; subtext; showSubtext true; icon (emoji); showIcon true; style card | pill | minimal | broadcast (card); animation slideIn | fadeIn | bounceIn | none (slideIn); bgColor #1C1C1E, bgOpacity 0.95; textColor #FFFFFF; subtextColor #AEAEB2; iconBgColor #FF3B30; accentColor #FF3B30; borderRadius 14; fontSize 15; subtextFontSize 12; maxWidthPct 80; showTimestamp false; timestampText "just now"; badgeText "BREAKING"; showBadge true.

## qr-code (qrcode, qrCodeConfig)

url "https://example.com"; label "Scan to visit"; showLabel true; labelPosition "bottom"; style standard | rounded | dots | branded; fgColor #FFFFFF; bgColor #000000; bgOpacity 1; size 140; borderRadius 8; paddingEnabled true; logoEmoji; showLogo false; borderEnabled true, borderColor #FFFFFF, borderWidth 2.

## weather-card (weather, weatherConfig)

location "New York, NY"; temperature 72; feelsLike 68; showFeelsLike true; humidity 55; showHumidity true; windSpeed 12; showWind true; condition sunny | cloudy | rainy | stormy | snowy | windy | foggy | partly-cloudy; unit C | F (F); style card | minimal | broadcast | glassmorphism; bgColor #1C1C1E, bgOpacity 0.92; textColor #FFFFFF; accentColor #32ADE6; borderRadius 16; fontSize 42; locationFontSize 14; showDate false; dateText "Today". Static values only; nothing is fetched.

## quote-card (quote, quoteConfig)

quote "Your quote here"; attribution ""; style minimal | bold | cinematic | editorial | card | gradient (card); alignment left | center | right; quoteColor #FFFFFF; attributionColor rgba(255,255,255,0.7); bgColor #1C1C1E, bgOpacity 0.9, bgRadius 16; accentColor #007AFF; showQuoteMarks true; quoteFontSize 18; attributionFontSize 13; quoteFontWeight regular | medium | semibold | bold | heavy; padding 20; showAccentLine false; accentLineWidth 3; showTopBadge false; topBadgeText "QUOTE"; topBadgeBgColor; topBadgeTextColor; animateIn true; animationDuration 500; lineHeight 1.4; borderRadius 12.

## caption-box (caption, captionConfig)

text "Caption text goes here"; style standard | broadcast | minimal | pill | gradient; position top | center | bottom; bgColor #000000; bgOpacity 0.7; textColor #FFFFFF; accentColor #007AFF; fontSize 18; fontWeight normal | bold; textAlign left | center | right; borderRadius 6; paddingH 16; paddingV 10; maxWidthPct 90; uppercase false; letterSpacing 0; lineHeight 1.4; showBackground true; scrollEnabled false; scrollSpeed 1.

## searchbar (searchbarConfig)

query "Who is the best?"; placeholder "Search…"; typeSpeedMs 90; startDelayMs 300; showCursor true; cursorColor #3B5BDB; fontSize 30; fontWeight regular | medium | semibold | bold; textColor #1A2233; letterSpacing 0; barColor #FFFFFF; barOpacity 1; cornerRadius 44; paddingH 28; paddingV 16; minWidthFrac 0.46; borderEnabled true, borderColor #E3E7EE, borderWidth 2; showMagnifier true; magnifierColor #9AA1AE; focusGlow true; glowColor #3B5BDB; glowRadius 22; accentColor #3B5BDB; transition, transitionDuration 400. No shadow keys.

## poll (pollConfig)

question "What do you think?"; options [{ id, label, votes, color }] (2-4; default Yes/No); showVoteCounts false; showPercentages true; animateOnPlay true; animationDuration 800; questionFontSize 15; optionFontSize 13; barHeight 24; barRadius 6; bgColor #1C1C1E, bgOpacity 0.92, bgRadius 16; textColor #FFFFFF; questionColor #FFFFFF; defaultBarColor #007AFF; showHeader true; headerText "POLL"; headerBgColor #FF9500; headerTextColor #FFFFFF; padding 16; borderRadius 16.

## confetti (confettiConfig)

style classic | emoji | stars | hearts | streamers; emoji; colors (string[], 7 defaults); particleCount 20; speed 1.5; size 10; direction down | up | burst; spreadWidth 80; showCount 20; loop true; gravity 1.0; borderRadius 12. Default layer duration 2 s.

## fire-meter (firemeter, fireMeterConfig)

level 75 (0-100); label "Hype"; showLabel true; showPercentage true; style bar | circular | thermometer | emoji-stack; theme fire | electric | ice | neon | custom; bgColor #1C1C1E, bgOpacity 0.92; trackColor #2C2C2E; fillColor, fillColorEnd (from theme); textColor #FFFFFF; accentColor; fontSize 14; labelFontSize 12; borderRadius 8; width 200; height 20; animated true; animateFromZero true; showEmoji true; emoji.

## bar-chart-race (barChartRaceConfig)

Content: title "", subtitle "", source "", axisLabel "Frame", valueLabel "Value", valuePrefix "", valueSuffix "", decimals 1, sortDirection desc | asc. Timeline: frames (string[], set via bar_chart_race.set_data), showTimeline true, showPlayhead true, showFrameLabel true. Animation: secondsPerFrame 1.0, rankEaseMs 500, axisEaseMs 700, valueInterp linear | step | smoothstep, matchHostDuration false (true = fit the layer duration). Layout: topN 10, barHeight 28, barGap 6, showIcon true, iconShape circle | square | none, labelPlacement auto | insideRight | outsideRight. theme { background, titleFont, valueFont, frameFont, titleColor, subtitleColor, axisColor, gridColor, sourceColor }. series [{ id, label, color, icon { kind emoji | image | none, value | uri }, values (number | null)[] }] — set via bar_chart_race.set_data only. source_meta is provenance written by the tool. Give the layer canvasRelativeWidth/Height via update_layer so the plot has room.

CSV contract for bar_chart_race.set_data { csv }: row 0 = frame labels (leading empty cells skipped); each following row = series label, optional #hex or rgb() colour cell, optional single-emoji icon cell, then one value per frame (empty = null; ragged rows are padded with null). Handles BOM, CRLF, quoted fields. Provide exactly one of data or csv; source may be sample | csv-paste | csv-file | csv-url | manual.

## Layers update_widget_config also routes

lowerthird → lowerThirdConfig (see expocut-kinetic-captions), collage → collageConfig, shape → shapeConfig (raw escape hatch; prefer the set_shape_* family in expocut-shapes-layouts). Not routed: shapeWidget (patch shapeWidgetConfig with update_layer), text, media, SVG.
