---
name: expocut-data-widgets
description: "Builds data and overlay widgets in ExpoCut through the in-app MCP server: bar chart races from CSV or arrays, countdowns, stopwatches and live clocks, scoreboards and stat bars, polls, follower counters and like bursts, comment bubbles, news tickers, breaking banners and news alerts, QR codes, weather cards, quote cards, caption boxes, search-bar typing, confetti and fire meters, plus phone, tablet and browser device mockups for app demos. Use when the user asks for a stats video, chart race, data visualisation, timer, countdown, score bug, live ticker, subscriber counter, poll sticker, QR code, \"show my app in a phone frame\", or animated numbers. Do not use for plain titles, captions or lower thirds (expocut-kinetic-captions), for shape grids and screen layouts (expocut-shapes-layouts), or for importing Lottie files (expocut-template-import)."
license: MIT
compatibility: Works standalone as guidance; becomes hands-on when paired with the ExpoCut in-app MCP server (private/loopback network only).
metadata:
  author: ExpoCut (expocut.com)
  version: "3.0.0"
  homepage: https://expocut.com/skill.html
---

# Data videos, widgets and device mockups

You are the data storyteller. Numbers perform when they move and when one number owns each beat. Every call edits the user's open project live; edits are undoable in the app, but confirm before removing layers.

## When to use / hand off

- This skill: the 20 widget types add_widget_layer can create, bar_chart_race.set_data, get_widget_config / update_widget_config, add_device_mockup.
- Three entries of list_widgets are not created by add_widget_layer: lower-third-simple → add_lower_third_layer (expocut-kinetic-captions); shape-widget → add_shape_widget (expocut-shapes-layouts); lottie-animation → add_lottie_layer { uri or presetId, loop, playbackSpeed, startTime, duration, x, y, scale } (file import guidance in expocut-template-import).
- Titles and captions: expocut-kinetic-captions. Sound effects on number pops and beat sync: expocut-audio-post. Keyframing a widget's position or opacity: expocut-motion-graphics. Capture, export, undo: expocut-editor-ops.

## Before you start

1. A project must be open. get_canvas_info tells you the canvas size and duration; list_layers lists ids (widget ids look like clock_m0c3k1x9_7a2b4c1d, scoreboard_…, bar-chart-race_…).
2. list_widgets returns id, name, category and layerType. The widgetId goes to add_widget_layer; the layerType is what get_layer reports.
3. Every widget config has a default factory; add_widget_layer deep-merges your partial config into it, so pass only the keys you change. Read the real keys in references/widget-configs.md before guessing.
4. Widgets are auto-sized: x/y place the top-left corner in canvas percent (default 50/50, which is off-centre). Use describe_canvas after adding to read the box and re-place with update_layer.

## Core workflow

1. Add. add_widget_layer { widgetId: "countdown", config: { countdownFromMs: 10000, format: "MM:SS", fontSize: 64, showLabel: true, labelText: "STARTS IN" }, x: 25, y: 40, startTime: 0, duration: 10 }. Default duration is 5 s (2 s for confetti and like-burst). Returns { id, widgetId, layerType, trackIndex }.
2. Inspect. get_widget_config { layerId: "clock_…" } returns { field, config } with the full merged config.
3. Patch. update_widget_config { layerId: "clock_…", config: { textColor: "#FFD93D", glowEnabled: true, glowColor: "#FFD93D" } }. This is a shallow merge: nested objects and arrays (scoreboard teamA, ticker items, poll options, bar-chart-race series) are replaced wholesale, so send the complete object you want.
4. Place and time. describe_canvas { timeSec: 1 } shows the widget's box in canvas percent; update_layer { id: "clock_…", patch: { position: { x: 30, y: 8 }, scale: 1.2, startTime: 2, duration: 6 } } (seconds in the patch).
5. Stage changes over time by adding a second layer with a different config and startTime; widget configs are static per layer, and clocks, countdowns, stopwatches and animated bars run from the layer's startTime.
6. Verify. capture_canvas { timeSec } for a look; capture_export_frame { timeSec } when the render must match, since widgets are composited natively on export.

## Widgets and the config keys that matter

Shared keys on almost every widget: transition (none, fade, slideUp, slideDown, slideLeft, slideRight, zoom, bounce) with transitionDuration (ms); glowEnabled/glowColor/glowRadius; borderEnabled/borderColor/borderWidth; shadowEnabled/shadowColor/shadowOffsetX/shadowOffsetY; fontSize (pt); bgColor/bgOpacity. Full lists with defaults: references/widget-configs.md.

| widgetId | layer type | config keys you will actually set |
| --- | --- | --- |
| live-clock / countdown / stopwatch | clock | mode is set by the widgetId; format HH:MM:SS, HH:MM, MM:SS, MM:SS.ms, H:MM:SS, D:HH:MM:SS, "Dd HHh MMm SSs"; countdownFromMs (ms); fontSize, fontWeight regular…heavy, textColor, digitSpacing; bgEnabled/bgColor/bgRadius; showLabel/labelText/labelBgColor |
| scoreboard | scoreboard | teamA / teamB { name, fullName, score, color, secondaryColor }; sport; period; showPeriod; layout compact/standard/broadcast/minimal; scoreFontSize; useTeamColors |
| stat-bar | statbar | label, subLabel, value (0-100), unit; style standard/segmented/gradient/neon; barColor, barColorStops; animateOnPlay, animationDuration (ms); segmentCount |
| follower-counter | follower | count, label; platform youtube/instagram/tiktok/twitter/twitch/custom; customPlatformName, platformIcon; style card/pill/badge/minimal/broadcast; animated; showGrowthBadge, growthText |
| like-burst | likeburst | emojiType heart/thumbs/fire/star/clap/custom, customEmoji; particleCount, size, speed, spread; showCount, countValue |
| comment-bubble | comment | username, message; platform; style modern/chat/broadcast/minimal; avatarInitial, avatarColor; showVerified; showTimestamp, timestampText; maxWidthPct |
| news-ticker | ticker | items [{ id, text, iconType, enabled }] (iconType none/breaking/live/alert/info/sports/weather/finance/politics/tech/custom); label { enabled, text, bgColor, textColor }; direction left/right; speed (px/s); bgHeightPct (0..1); borderColor; divider { enabled, symbol, color } |
| breaking-banner | banner | text, subtext, showSubtext; badgeText, showBadge; position top/bottom; animation slide/fade/flash/none; style breaking/alert/info/sports/custom; bgColor, accentColor; uppercase |
| news-alert | newsalert | headline, subtext, icon; style card/pill/minimal/broadcast; animation slideIn/fadeIn/bounceIn/none; badgeText, showBadge; maxWidthPct |
| qr-code | qrcode | url; label, showLabel; style standard/rounded/dots/branded; fgColor, bgColor; size (pt); showLogo, logoEmoji |
| weather-card | weather | location, temperature, feelsLike, humidity, windSpeed (static values, nothing is fetched); condition sunny/cloudy/rainy/stormy/snowy/windy/foggy/partly-cloudy; unit C/F; style card/minimal/broadcast/glassmorphism; showDate, dateText |
| quote-card | quote | quote, attribution; style minimal/bold/cinematic/editorial/card/gradient; alignment; quoteFontSize; showQuoteMarks; accentColor; animateIn |
| caption-box | caption | text; style standard/broadcast/minimal/pill/gradient; position top/center/bottom; fontSize; maxWidthPct; uppercase; scrollEnabled, scrollSpeed |
| searchbar | searchbar | query, placeholder; typeSpeedMs, startDelayMs; showCursor, cursorColor; fontSize; barColor; minWidthFrac (0..1); focusGlow |
| poll | poll | question; options [{ id, label, votes, color }] (2-4); showPercentages, showVoteCounts; animateOnPlay, animationDuration (ms); headerText, showHeader |
| confetti | confetti | style classic/emoji/stars/hearts/streamers; emoji; colors []; particleCount; direction down/up/burst; loop; gravity; speed |
| fire-meter | firemeter | level (0-100); label; style bar/circular/thermometer/emoji-stack; theme fire/electric/ice/neon/custom; animateFromZero; width, height (pt) |
| bar-chart-race | bar-chart-race | see below |

## Bar chart race

1. add_widget_layer { widgetId: "bar-chart-race", config: { title: "Streaming subscribers", valueSuffix: "M", decimals: 0, topN: 8, secondsPerFrame: 1.5, matchHostDuration: true }, x: 5, y: 15, startTime: 0, duration: 30 } then update_layer { id: "bar-chart-race_…", patch: { canvasRelativeWidth: 90, canvasRelativeHeight: 55 } } so the plot gets a real box (the default box is far too small for axis, labels and timeline).
2. Load data with the dedicated tool, never with update_widget_config: bar_chart_race.set_data { layerId: "bar-chart-race_…", data: { frames: ["2019", "2020", "2021"], series: [{ id: "netflix", label: "Netflix", color: "#E50914", values: [167, 204, 222] }, { id: "disney", label: "Disney+", color: "#113CCF", values: [null, 87, 130] }] } }. It validates that every series.values.length equals frames.length (null = missing, interpolated through) and records provenance; a shallow merge would corrupt the parallel arrays.
3. CSV alternative: bar_chart_race.set_data { layerId: "bar-chart-race_…", csv: ",2019,2020,2021\nNetflix,#E50914,167,204,222\nDisney+,#113CCF,,87,130", source: "csv-paste" }. Row 0 is the frame labels (leading empty cells skipped); column 0 is the series label; an optional hex/rgb cell becomes the colour and an optional single-emoji cell becomes the icon; the rest are values (empty = null). Pass exactly one of data or csv.
4. Pace it: the race lasts frames × secondsPerFrame unless matchHostDuration is true (then it fits the layer duration). rankEaseMs / axisEaseMs (ms) soften overtakes; valueInterp linear/step/smoothstep. Content keys: title, subtitle, source, axisLabel, valueLabel, valuePrefix, valueSuffix, decimals, sortDirection desc/asc; layout keys: topN, barHeight, barGap, showIcon, iconShape circle/square/none, labelPlacement auto/insideRight/outsideRight; showTimeline, showPlayhead, showFrameLabel; theme { background, titleFont, valueFont, frameFont, titleColor, subtitleColor, axisColor, gridColor, sourceColor }.
5. Craft: 8-12 bars, one protagonist bar in a distinct colour, a big frame label as the anchor, let the race resolve by 80 percent of the runtime and hold the end state. Check with preview_filmstrip { fromSec: 0, toSec: 30, frames: 8 }.

## Device mockups

add_device_mockup { device: "phone", color: "#1A1A1F", widthFrac: 40, startTime: 0, duration: 8 } adds an SVG image layer (id image_…) with a transparent screen and returns screenRect { x, y, widthFrac, heightFrac } in canvas percent. device: phone (9:19.5), tablet (4:3), browser (16:10). Defaults centre the frame; x/y are top-left percent.

The screen is a hole: the content must sit behind the frame (higher trackIndex). New layers land on top, so either add the content first and the mockup second, or reorder_layer { layerId: "video_…", position: "back" } (or a numeric position larger than the frame's trackIndex). Size the content to the hole from screenRect. The phone bezel is 4.5 percent of the frame width on every side (tablet 5 percent; the browser is full width below a title bar 8.5 percent of the frame height), so: screenW = widthFrac × 0.91; screenX = x + widthFrac × 0.045; inset = widthFrac × 0.045 × canvasAspect (canvas width / height, 0.5625 on 9:16) because the vertical inset must be expressed in canvas-height percent; screenH = heightFrac − 2 × inset; screenY = y + inset. On a 9:16 canvas a phone at widthFrac 40 returns heightFrac 48.75 (widthFrac × 0.5625 / 0.4615), so the hole is update_layer { id: "video_…", patch: { canvasRelativeWidth: 36.4, canvasRelativeHeight: 46.7, position: { x: 31.8, y: 26.6 } } }. Add the video (uri is a file:// or absolute local path) with stretchToCanvas: false so it is not stretched to the canvas first, then confirm the boxes with describe_canvas.

## Recipes

### 1. Countdown reveal with confetti

```
add_widget_layer { widgetId: "countdown", config: { countdownFromMs: 5000, format: "MM:SS", fontSize: 72, fontWeight: "heavy", textColor: "#FFFFFF", bgEnabled: false, glowEnabled: true, glowColor: "#FF2D55", glowRadius: 14 }, x: 32, y: 40, startTime: 0, duration: 5 }
add_widget_layer { widgetId: "confetti", config: { style: "classic", direction: "burst", particleCount: 40, loop: false, transition: "fade", transitionDuration: 200 }, x: 20, y: 20, startTime: 5, duration: 2.5 }
add_text_layer { text: "WE ARE LIVE", verticalAnchor: "center", textAutoFit: { maxSize: 90, minSize: 30, maxLines: 1 }, startTime: 5, duration: 3 }
describe_canvas { timeSec: 2.5 }
```

### 2. Score bug that changes between beats

```
add_widget_layer { widgetId: "scoreboard", config: { teamA: { name: "LAL", fullName: "Lakers", score: 98, color: "#552583", secondaryColor: "#FDB927" }, teamB: { name: "BOS", fullName: "Celtics", score: 101, color: "#007A33", secondaryColor: "#FFFFFF" }, sport: "BASKETBALL", period: "Q4", layout: "broadcast" }, x: 20, y: 4, startTime: 0, duration: 6 }
add_widget_layer { widgetId: "scoreboard", config: { teamA: { name: "LAL", fullName: "Lakers", score: 101, color: "#552583", secondaryColor: "#FDB927" }, teamB: { name: "BOS", fullName: "Celtics", score: 101, color: "#007A33", secondaryColor: "#FFFFFF" }, sport: "BASKETBALL", period: "Q4", layout: "broadcast", transition: "bounce", transitionDuration: 400 }, x: 20, y: 4, startTime: 6, duration: 6 }
```

Two layers back to back read as one bug updating; the second one's transition sells the change. Pair the cut with a pop SFX (expocut-audio-post).

### 3. App demo in a phone frame

```
add_video_layer { uri: "/…/screen-recording.mp4", stretchToCanvas: false, startTime: 0, duration: 8 }   // content first → video_…
add_device_mockup { device: "phone", widthFrac: 42, startTime: 0, duration: 8 }   // 9:16 canvas → screenRect { x: 29, y: 24.4, widthFrac: 42, heightFrac: 51.2 }
update_layer { id: "video_…", patch: { canvasRelativeWidth: 38.2, canvasRelativeHeight: 49.1, position: { x: 30.9, y: 25.5 } } }   // hole = frame inset by 4.5% of its width
describe_canvas { timeSec: 1 }   // the video box must sit inside the frame box, frame listed first (on top)
```

### 4. Ticker plus QR call to action

```
add_widget_layer { widgetId: "news-ticker", config: { label: { enabled: true, text: "TONIGHT", bgColor: "#FFD93D", textColor: "#000000", fontWeight: "800", paddingH: 10, paddingV: 5, borderRadius: 2, pulse: false }, items: [{ id: "i1", text: "Doors open 7pm", iconType: "live", enabled: true }, { id: "i2", text: "Tickets at the link", iconType: "info", enabled: true }], speed: 320, bgHeightPct: 0.06 }, x: 0, y: 92, startTime: 0, duration: 15 }
add_widget_layer { widgetId: "qr-code", config: { url: "https://example.com/tickets", label: "Scan for tickets", style: "rounded", size: 120 }, x: 70, y: 70, startTime: 3, duration: 12 }
```

## Pitfalls

- update_widget_config is shallow: patching { teamA: { score: 5 } } drops name/colour; patching items or options replaces the whole array. get_widget_config first, edit, send back complete objects. Never patch frames or series this way on a bar chart race.
- update_widget_config and get_widget_config work on widget layers, lower thirds, collages and plain shape layers (shapeConfig); they throw "has no widget config" for text, media, SVG and shape-widget layers. Patch a shape widget's shapeWidgetConfig with update_layer.
- Units: startTime/duration in add and patch calls are seconds; countdownFromMs, transitionDuration, animationDuration, typeSpeedMs are milliseconds; fontSize and size are display points (about 1080-px design size / 2.7).
- Countdowns and stopwatches start at the layer's startTime, not at the project start. A countdown shorter than the layer duration sits at 00:00 for the remainder.
- Weather, follower and comment widgets show the values you type; nothing is fetched live. The ticker's remoteFeed and schedule blocks are for the in-app live mode and do not export.
- Widgets are auto-sized; scale them with the layer scale (update_layer patch scale) rather than expecting canvasRelativeWidth to apply. The bar chart race is the exception and needs canvasRelativeWidth/Height.
- Keep widgets inside the safe zone (about the central 900 × 1400 of a 1080 × 1920 canvas): capture_canvas { timeSec: 1, grid: true } draws the guides.
- Export composites widgets natively; if capture_canvas and capture_export_frame disagree, trust the export frame and simplify the config (fewer particles, no glow) before blaming the data.
- Confirm before remove_layer; there is no MCP-side undo other than undo / undo_to_checkpoint (expocut-editor-ops).

## Reference

- references/widget-configs.md — every widget config key with its default and enum values, the ticker and bar-chart-race shapes, CSV contract.
- https://expocut.com/mcp.html — tool reference. Siblings: expocut-kinetic-captions (lower thirds, captions), expocut-shapes-layouts (shape widget, plates), expocut-motion-graphics (keyframes), expocut-audio-post (pops and beat sync), expocut-template-import (Lottie files), expocut-editor-ops (capture, export, undo).
