# Template theming — palettes, `@role` tokens, brand-derived themes

Read this when authoring a template that should be re-colourable, when `set_template_theme`
refuses a project, or when a swap leaves some colour untouched.

## Two systems, one entry point

| System | Where it lives | What it covers | How you pick it |
| --- | --- | --- | --- |
| Palettes (`template.palettes[]`) | any template document — bundled, CDN or `import_template_json` | every colour field: text colour / stroke / shadow / background / gradients, `shapeConfig` (fills, strokes, gradients, glow stops, mesh gradients), `border`, `lowerThirdConfig`, `fxParams`, `shaderFilters`, text-animation params | `themeId` on `apply_template` / `import_template_json`; later `set_template_theme { themeId }` |
| Legacy themes (per-layer-id overrides keyed by template id) | app code only; today `speaker-card-v1` with `original`, `cyan-wave`, `sunset`, `forest`, `crimson`, `mono` | `fillColor`, `gradientColors`, `textColor` on named layers | `themeId` on `apply_template` only — `set_template_theme` fails on these projects |

Palettes win whenever `template.palettes` is non-empty. New templates should ship palettes.

## Palette shape

```json
"palettes": [
  { "id": "original", "label": "Original",
    "roles": { "bg": "#0B1020", "surface": "#161D33", "accent": "#5EE7FF", "textPrimary": "#FFFFFF", "scrim": "#000000" },
    "pairs": { "textPrimary": "bg" } },
  { "id": "sand", "label": "Sand",
    "roles": { "bg": "#F4E9D8", "surface": "#FFFBF3", "accent": "#C2410C", "textPrimary": "#1F1300", "scrim": "#000000" },
    "pairs": { "textPrimary": "bg" } }
]
```

- `id` is what `themeId` / `set_template_theme` take. `label` is what the in-app picker shows.
- `palettes[0]` is the authored default. Selecting it is a no-op; every other palette is a remap
  from it.
- `roles` is free-form: name roles after their job (`bg`, `surface`, `accent`, `textPrimary`,
  `scrim`, `gold`, `panel`…). Values are `#RRGGBB` or `#RRGGBBAA` hex.
- `pairs` maps a text role to the background role it sits on. Before a palette is applied,
  `enforceContrast` nudges the text colour until the pair clears WCAG AA (4.5:1). Declare a pair
  for every text role that sits on a solid surface, so a user-picked palette can never wash a
  title out.

## Token grammar

Colour fields may hold a token instead of a hex:

| Token | Resolves to |
| --- | --- |
| `@accent` | `palette.roles.accent` |
| `@scrim/80` | `palette.roles.scrim` at 80 % alpha (`#RRGGBBAA`) |
| `" @bg "` | whitespace is tolerated |
| `#FFFFFF`, `rgb(…)`, named colours | left untouched (no `@`, so never a token) |

A token whose role is missing from the active palette stays as the literal string — the layer
then renders with an invalid colour, so keep every palette's `roles` keys identical.

Tokens may appear anywhere in these layer fields (deep-walked): `textColor`, `textStrokeColor`,
`textShadowColor`, `textBgColor`, `textGradientColors[]`, `overlayColor`, `shapeConfig.*`
(`fillColor`, `strokeColor`, `gradient.colors[]`, glow, mesh gradient stops), `border.*`,
`lowerThirdConfig.*`, `fxParams.*` (e.g. shader `colorStops`), `shaderFilters[].*`,
`textAnimInParams` / `textAnimOutParams` / `textAnimLoopParams`.

## Hex-authored templates still theme

If a template ships `palettes` but its layers use plain hex, `applyPalettes` remaps every colour
whose RGB equals a value in `palettes[0]` to the same role in the chosen palette, preserving any
baked alpha. Colours that do not appear in the base palette are left alone — that is the usual
reason "one shape did not change": its hex is not one of the base palette's role values.

## What the project stores

`apply_template` / `import_template_json` persist `templatePalettes` (the template's palettes, plus
the derived `my-brand` palette when that was chosen) and `activePaletteId` on the project record.
`set_template_theme` remaps `activePaletteId → themeId` with `repalette` (current colours → new
colours, contrast enforced on the target), then writes both the layers and the new
`activePaletteId` back to disk. The response `{ themeId, fromThemeId, layerCount }` tells you what
it remapped from.

Error texts you will meet:

- `Open project has no template palettes. set_template_theme only works on palette-based template projects.`
  — hex template without `palettes`, or a project not created from a template.
- `Palette <id> not found. Available: original, sand, my-brand` — pick one of the listed ids.

## `my-brand` — the palette derived from the brand profile

When the default brand profile has colours (`colors.primary`, `secondary`, `accent`, `background`,
`text` — set in the app's Settings → Brand, not through MCP), a `my-brand` option is prepended to
the picker and accepted by `themeId` / `set_template_theme`. It is derived from `palettes[0]` by
classifying each role by name:

| Role name contains | Bucket | Takes |
| --- | --- | --- |
| `text`, `ink`, `foreground` | text | `colors.text`, but only if it keeps the author's light/dark polarity (white-on-photo stays white) |
| `secondary`, `gold`, `accent2` | secondary accent | `colors.secondary` → else `accent` → else `primary` |
| `accent`, `primary`, `highlight`, `brand` | primary accent | `colors.accent` → else `primary` |
| `bg`, `surface`, `scrim`, `panel`, `overlay`, `base`, `deep`, `card` | surface | `colors.background`, shifted by each role's lightness offset from the `bg` role (depth preserved) |
| anything else | other | unchanged |

Name roles accordingly if you want brand theming to reach them.

## Authoring checklist

1. Put every colour a theme should touch behind a token; keep `palettes[0]` equal to the design.
2. Ship at least two palettes with identical role keys and a `pairs` entry per on-surface text.
3. Import with `import_template_json { template, themeId: "<second palette id>" }` and
   `capture_canvas { timeSec: 1, maxWidth: 512 }` — a colour that did not change is either not a
   token or not in the base palette.
4. Swap with `set_template_theme { themeId: "original" }` to confirm the round trip is lossless.
