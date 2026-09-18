# Worked example — "Droplet Lens Montage" (from a reference video)

`droplet-lens-montage-v1.json` was rebuilt frame-by-frame from a 3.87 s landscape
montage. It is the reference example for **junction transitions** — the blend that
sits ON a cut — and for the three shader options that have no other route in.

## What the source does (analysis)

Measured, not eyeballed. `ffmpeg`'s scene detector finds **zero** cuts in the file,
because every cut is buried under a gradual blend; the structure came out of a
per-frame difference pass instead (centroid + covered-area of the changed region).

- **Format:** 1920×1080, 30 fps, 3.87 s, H.264 + AAC music bed.
- **Structure:** four landscape clips, ~1.3 s each — rice terraces → aerial
  shoreline → river over pebbles → sunset mountain road.
- **The transition, in two stages:**
  1. **Droplet flight (~0.35 s)** — a small teardrop enters from the top edge and
     arcs down across the frame, shrinking as it travels. It is filled with the
     *incoming* clip, heavily magnified and defocused (in clip 1 it reads as flat
     blue because the incoming shot is open ocean; before clip 4 you can clearly
     see the orange sunset clouds inside it).
  2. **Radial burst (~0.6 s)** — the blob expands from wherever it landed, with a
     feathered edge, while the content inside relaxes back to 1:1. Growth is
     ease-out: fast, then settling.
- **The origin moves every time** — that is the detail that makes it read as a
  droplet landing rather than an iris wipe:

  | cut | droplet flight | burst | origin (normalised) |
  | --- | -------------- | ----- | ------------------- |
  | 1   | 0.00–0.37 s    | 0.40–1.00 s | (0.81, 0.69) |
  | 2   | 1.27–1.57 s    | 1.60–2.20 s | (0.38, 0.55) |
  | 3   | 2.53–2.77 s    | 2.80–3.47 s | (0.62, 0.40) |

- **Overlay:** a small italic serif watermark, bottom-centre, revealed with a
  typewriter cadence over frames 4–9.
- **Not reproduced:** the source carries a 60 px black band on the bottom edge from
  t = 1.0 s onward (clips 2–4 are scaled to 1020 px tall while clip 1 is full-bleed).
  That is a defect in how the file was assembled, not a design choice.

## How it is rebuilt

| Source element | ExpoCut |
| --- | --- |
| Radial burst from a moving point | `wipe.iris` junction transition + `originX` / `originY` |
| Rim bending the picture like a lens | the same transition's `bulge` (rim refraction) |
| Ease-out growth | `ease: "out"` on the junction |
| Droplet flight | a `circle` shape with absolute `transform.x` / `transform.y` + `opacity` keyframes |
| Typewriter watermark | text layer, `in-tw-classic`, `didot` italic |

Each droplet's landing point is the **same coordinate** its burst opens from — the
JSON derives one from the other, so they cannot drift apart.

## Design rationale

**Beats.** Four 1.3 s beats (5.2 s total), cuts at 1300 / 2600 / 3900 ms. The 1.3 s
snap is the source's character; slowing it loses the montage feel.

**One motion family.** The droplet *is* the motion. No zoom punches, no slides, no
per-clip animation competing with it — the only other movement in the whole template
is the watermark typing on once.

**Type.** A single italic serif (`didot`) at 13 px, letter-spaced, bottom-centre,
uppercase. It is a maker's mark, not a headline; it should be the last thing you
notice. One font, one weight.

**Colour.** The footage carries all of it. The droplet is a near-white cool tint
(`#DCEEFF`) rather than a sampled colour, so it reads as water over *any* clip a user
drops in — the source could tint its blobs because it knew its own footage.

**Geometry.** Positions are top-left, so each droplet's box is offset by half its
canvas-relative size to centre it on the origin. Sizing is canvas-relative rather
than base-box because `transform.scale` keyframes are ignored on canvas-relative
shapes (hard-won rule 5) — the flight animates position and opacity only.

## Verification

- `validate-reel.mjs` — clean (the remaining warnings are CDN gallery assets:
  `previewVideoUri`, `thumbnail`, and per-clip `defaultBinding`).
- The app's own `validateTemplate(doc, { strictOneLayerPerTrack: true })` returns
  **`ok: true`, zero errors, zero warnings**. The four clips share one `trackIndex`
  — required, since a junction only forms between clips touching on one track — and
  the strict path exempts a track whose clips a declared junction ties together.
- Geometry asserted: each droplet's centre at the end of its flight equals its
  transition's `originX/Y` to one decimal; opacity is 0 before the burst is
  underway; clips are exactly back-to-back; z-order is watermark → droplets → clips.

**Not device-verified.** No on-device import or export has been run against this file.

## Adapting it

- **Aspect:** ships 9:16 for Reels. The source was 16:9 — switch `aspectRatio` and
  the percentages carry over unchanged.
- **Fewer / more beats:** add a clip layer on the same `trackIndex`, keep the clips
  back-to-back, and add a matching entry to `transitions[]`. A cut with no entry is
  a straight cut, and an unjoined clip sharing a `trackIndex` will fail strict import.
- **Calmer look:** drop `bulge` toward 0.3 and shorten the junctions to ~400 ms.
- **Centred iris:** omit `originX` / `originY` — they default to 0.5 / 0.5.
