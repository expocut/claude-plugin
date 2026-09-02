# Filters, LUT ids and light-zone tone ranges

Read this when you need a `filterId` for `set_layer_filter` or `add_light_region`, a LUT id for `set_layer_lut` / `apply_global_color_grade`, or the exact numeric ranges of a Light / LUT Zone tone block.

## LUT ids (set_layer_lut { id }, apply_global_color_grade { lutId })

There is no LUT list tool for the bundled set. Ids come from three places:

1. Built-in LUTs compiled into the canvas and both encoders: `warm`, `cool`, `cinematic`, `vintage`, `bw`, `noir`.
2. Custom LUTs already on the phone: call `lut_list_custom { author: "any" }`. It returns user-imported `.cube` files, LUTs the user downloaded from the in-app CDN library (ids prefixed `cdn-`), and LUTs registered by an agent (ids prefixed `ai.`). Only records with `kind: "cube"` render; a `kind: "grade"` record is stored but no render path reads it yet.
3. A LUT you register now: `bake_cdl_to_cube` then `lut_register_custom { id, name, cubeText }` (see SKILL.md recipe C).

`set_layer_lut` does not validate the id. A typo is accepted and silently renders as no LUT, so read the id back from one of the sources above.

## Filter ids (set_layer_filter { filterId }, add_light_region { filterId })

134 preset filters, grouped by the app's Filters tabs. `set_layer_filter` does not validate the id either; copy it exactly. `intensity` is 0..1 on both tools (a light region stores it as 0..100 internally).


### Instagram (25)

`clarendon` (Clarendon), `gingham` (Gingham), `moon` (Moon), `lark` (Lark), `reyes` (Reyes), `juno` (Juno), `slumber` (Slumber), `crema` (Crema), `ludwig` (Ludwig), `aden` (Aden), `perpetua` (Perpetua), `amaro` (Amaro), `mayfair` (Mayfair), `rise` (Rise), `hudson` (Hudson), `valencia` (Valencia), `xpro2` (X-Pro II), `sierra` (Sierra), `willow` (Willow), `lofi` (Lo-Fi), `earlybird` (Earlybird), `inkwell` (Inkwell), `nashville` (Nashville), `stinson` (Stinson), `walden` (Walden)

### VSCO (15)

`vsco-a4` (A4), `vsco-a6` (A6), `vsco-c1` (C1), `vsco-c7` (C7), `vsco-e5` (E5), `vsco-f2` (F2), `vsco-g3` (G3), `vsco-hb1` (HB1), `vsco-j1` (J1), `vsco-k2` (K2), `vsco-k3` (K3), `vsco-m5` (M5), `vsco-p5` (P5), `vsco-s2` (S2), `vsco-t1` (T1)

### Cinematic (12)

`cin-teal-orange` (Teal & Orange), `cin-blockbuster` (Blockbuster), `cin-noir` (Film Noir), `cin-matrix` (Matrix), `cin-bladerunner` (Blade Runner), `cin-wesanderson` (Wes Anderson), `cin-nolan` (Nolan Dark), `cin-tarantino` (Tarantino), `cin-scorsese` (Scorsese), `cin-kubrick` (Kubrick), `cin-villeneuve` (Villeneuve), `cin-fincher` (Fincher)

### Portrait (10)

`port-soft-skin` (Soft Skin), `port-golden-hour` (Golden Hour), `port-peach` (Peach Glow), `port-rose-gold` (Rose Gold), `port-ivory` (Ivory), `port-cream` (Cream), `port-natural` (Natural Beauty), `port-studio` (Studio Light), `port-glamour` (Glamour), `port-bronze` (Bronze)

### Landscape (10)

`land-emerald` (Emerald), `land-azure` (Azure), `land-autumn` (Autumn), `land-desert` (Desert Gold), `land-ocean` (Ocean Blue), `land-forest` (Forest), `land-alpine` (Alpine), `land-sunset` (Sunset), `land-misty` (Misty), `land-tropical` (Tropical)

### B&W (10)

`bw-classic` (Classic B&W), `bw-high-contrast` (High Contrast B&W), `bw-silver` (Silver), `bw-platinum` (Platinum), `bw-tintype` (Tin Type), `bw-graphite` (Graphite), `bw-charcoal` (Charcoal), `bw-selenium` (Selenium), `bw-infrared` (Infrared), `bw-cyanotype` (Cyanotype)

### Vintage (10)

`vint-70s` (70s), `vint-80s` (80s Retro), `vint-polaroid` (Polaroid), `vint-faded-memory` (Faded Memory), `vint-old-film` (Old Film), `vint-daguerreotype` (Daguerreotype), `vint-retro-fade` (Retro Fade), `vint-analog` (Analog), `vint-disposable` (Disposable), `vint-1977` (1977)

### Modern (10)

`mod-clean` (Clean), `mod-minimal` (Minimal), `mod-nordic` (Nordic), `mod-tokyo` (Tokyo), `mod-moody-blue` (Moody Blue), `mod-copper` (Copper), `mod-dusty-rose` (Dusty Rose), `mod-sage` (Sage), `mod-lavender` (Lavender), `mod-terracotta` (Terracotta)

### Color Pop (10)

`pop-candy` (Candy), `pop-electric` (Electric), `pop-sunshine` (Sunshine), `pop-neon` (Neon), `pop-tropical-punch` (Tropical Punch), `pop-bubblegum` (Bubblegum), `pop-lime` (Lime), `pop-cherry` (Cherry), `pop-aqua` (Aqua), `pop-golden` (Golden)

### Seasonal (8)

`season-spring` (Spring), `season-summer` (Summer), `season-autumn` (Fall), `season-winter` (Winter), `season-christmas` (Christmas), `season-halloween` (Halloween), `season-valentine` (Valentine), `season-golden-autumn` (Golden Autumn)

### Duotone (4)

`duotone-gray` (Gray), `duotone-light-gray` (Light Gray), `duotone-bw` (Black & White), `duotone-black-red` (Black & Red)

### Film (10)

`film-gold200` (Gold 200), `film-pastel400` (Pastel 400), `film-cine500t` (Cine 500T), `film-cine250d` (Cine 250D), `film-chrome64` (Chrome 64), `film-velvet50` (Velvet 50), `film-mono400` (Mono 400), `film-push3200` (Push 3200), `film-expired` (Expired Roll), `film-matteprint` (Matte Print)


## Light / LUT Zone tone ranges (add_light_region { tone })

The tone block is Lightroom-style and is compiled to an ASC CDL inside the region. Ranges are validated by the schema; contrast and saturation are multipliers (1 = neutral), everything else is an offset (0 = neutral).

| key | range | neutral |
| --- | --- | --- |
| exposure | -1..1 | 0 |
| contrast | 0.25..2 | 1 |
| brightness | -0.5..0.5 | 0 |
| highlights | -1..1 | 0 |
| shadows | -1..1 | 0 |
| whites | -1..1 | 0 |
| blacks | -1..1 | 0 |
| vibrance | -1..1 | 0 |
| saturation | 0..2 | 1 |

Seed geometry per shape (override with `rect`, `feather`, `invert`, `rotation`): area = rect {x 0.15, y 0.15, w 0.7, h 0.7}, feather 24; gradient = a band over the top {x -0.1, y -0.1, w 1.2, h 0.55}, feather 90; radial = centred spot {x 0.22, y 0.15, w 0.56, h 0.7}, feather 40, seeded with `invert: true` so the surroundings are graded; object = {x 0.3, y 0.3, w 0.4, h 0.4}, feather 18; trident = two gradient bands (Sky + Ground) added in one call.

