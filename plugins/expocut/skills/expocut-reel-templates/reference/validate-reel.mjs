#!/usr/bin/env node
/**
 * validate-reel.mjs — offline linter for ExpoCut reel/template JSON.
 * Copyright (c) 2026 ExpoCut. Released under the MIT License (see LICENSE).
 *
 * Catches, in <1s, the mistakes that otherwise cost a 60s import+export
 * round-trip on a device (or ship broken to the CDN):
 *   unit mix-ups (seconds vs ms vs µs), duplicate trackIndex, empty tracks[],
 *   orphan slotRefs, file:// paths, duplicate SVG gradient ids, illegal
 *   field/layer-type combos (the ones that export BLANK), z-order mistakes
 *   that hide text behind full-canvas media, and generativeBg parity traps.
 *
 * Usage:
 *   node validate-reel.mjs reel.json [more.json ...]
 *   node validate-reel.mjs reels/*.json
 * Exit code 1 if any ERROR. Warnings never fail the build.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
let MATRIX = null;
try {
  MATRIX = JSON.parse(readFileSync(join(HERE, 'layer-capability-matrix.json'), 'utf8'));
} catch {
  /* matrix optional — field-legality checks are skipped without it */
}

const ACCEPTED_SCHEMA = ['1.0', '1.1'];
const MAX_DURATION_MS = 5 * 60 * 1000;

/** Classify a layer into a matrix key. */
function kindOf(l) {
  switch (l.type) {
    case 'text': return 'text';
    case 'audio': return 'audio';
    case 'video': return 'video';
    case 'generativeBg':
    case 'proceduralFilter': return 'generativeBg';
    case 'shape':
      return ['image', 'video'].includes(l.shapeConfig?.fillStyle) ? 'shape.mediaFill' : 'shape.solid';
    case 'image':
      return l.svgContent ? 'image.svg' : 'image.raster';
    default: return null;
  }
}

function overlaps(a, b) {
  const as = a.startTime ?? 0, ae = as + (a.duration ?? 0);
  const bs = b.startTime ?? 0, be = bs + (b.duration ?? 0);
  return as < be && bs < ae;
}

function validate(doc, label) {
  const E = [], W = [];
  const err = (m) => E.push(m), warn = (m) => W.push(m);

  // ── top level ─────────────────────────────────────────────────────────
  if (!ACCEPTED_SCHEMA.includes(doc.schemaVersion))
    err(`schemaVersion "${doc.schemaVersion}" — must be one of ${ACCEPTED_SCHEMA.join(', ')}`);
  for (const f of ['id', 'name', 'category', 'aspectRatio'])
    if (typeof doc[f] !== 'string' || !doc[f]) err(`${f} missing`);
  if (typeof doc.durationMs !== 'number' || !(doc.durationMs > 0)) err('durationMs missing/invalid');
  else if (doc.durationMs > MAX_DURATION_MS)
    err(`durationMs ${doc.durationMs} (~${Math.round(doc.durationMs / 60000)} min) — did you pass SECONDS to an MCP add_*_layer? A runaway duration wedges the export queue.`);

  const layers = Array.isArray(doc.layers) ? doc.layers : [];
  const slots = Array.isArray(doc.slots) ? doc.slots : [];
  const tracks = Array.isArray(doc.tracks) ? doc.tracks : [];
  if (!layers.length) err('layers[] is empty');
  // hard import error in the app
  if (!tracks.length) err('tracks[] is empty — the app rejects this: "Template must declare at least one track"');
  if (doc.mode !== 'snapshot' && !slots.length) err('template mode must declare at least one slot');
  if (!doc.previewVideoUri) warn('previewVideoUri missing — the gallery card has no hover loop');
  if (!doc.thumbnail) warn('thumbnail missing — the gallery card has no cover');

  // ── trackIndex uniqueness ("one layer = one object") ──────────────────
  // The rule targets layers STACKED on one index — two objects drawn at the
  // same instant. Clips that merely follow each other on one index are a
  // normal timeline track, and are REQUIRED by junction transitions:
  // findJunctions only pairs clips adjacent on the same trackIndex, so a
  // montage that wants `distort.warp` / `wipe.iris` cuts must share a track.
  const byTrack = new Map();
  for (const l of layers) {
    if (typeof l.trackIndex !== 'number') { err(`layer ${l.id}: trackIndex missing`); continue; }
    byTrack.set(l.trackIndex, [...(byTrack.get(l.trackIndex) ?? []), l]);
  }
  for (const [ti, group] of byTrack) {
    if (group.length < 2) continue;
    const ids = group.map((l) => l.id);
    const stacked = group.some((a, i) => group.slice(i + 1).some((b) => overlaps(a, b)));
    if (stacked) {
      err(`trackIndex ${ti} holds ${group.length} layers (${ids.join(', ')}) that OVERLAP in time — every simultaneous object needs its own trackIndex. NB: add_light_leak_overlay emits ~6 layers sharing one index; re-number after calling it.`);
    } else {
      // Sequential clips on one index are legal down the lenient reel path, and
      // ALSO down the strict path when a declared junction transition ties them
      // together — `findOneLayerPerTrackViolations` exempts junction tracks
      // (it still rejects time-OVERLAPS there). So this is only worth flagging
      // when nothing in `transitions[]` actually joins the pair.
      const joined = new Set();
      for (const t of (doc.transitions ?? [])) {
        if (t && typeof t === 'object') { joined.add(t.fromLayerId); joined.add(t.toLayerId); }
      }
      const unjoined = ids.filter((id) => !joined.has(id));
      // Fully joined = the intended shape for junction transitions. Say nothing.
      if (unjoined.length > 0) {
        warn(`trackIndex ${ti} holds ${group.length} SEQUENTIAL clips (${ids.join(', ')}), but ${unjoined.join(', ')} ${unjoined.length === 1 ? 'is' : 'are'} not joined by any entry in transitions[] — the strict import path only exempts a shared trackIndex when a declared junction ties the clips together. Add the transition, or give the unjoined clip${unjoined.length === 1 ? '' : 's'} its own trackIndex.`);
      }
    }
  }

  // ── junction transitions ───────────────────────────────────────────────
  // The ONLY route to the junction shader params (blurAngle/blurAniso,
  // originX/originY, bulge). Each one needs its two clips adjacent on ONE
  // track, or findJunctions never pairs them and the editor prunes it.
  const transitions = Array.isArray(doc.transitions) ? doc.transitions : [];
  const layerById = new Map(layers.map((l) => [l.id, l]));
  for (const t of transitions) {
    const a = layerById.get(t.fromLayerId), b = layerById.get(t.toLayerId);
    if (!a) { err(`transition ${t.id}: fromLayerId "${t.fromLayerId}" matches no layer`); continue; }
    if (!b) { err(`transition ${t.id}: toLayerId "${t.toLayerId}" matches no layer`); continue; }
    if (a.trackIndex !== b.trackIndex)
      err(`transition ${t.id}: "${a.id}" (track ${a.trackIndex}) and "${b.id}" (track ${b.trackIndex}) are on DIFFERENT tracks — a junction only forms between clips sharing a trackIndex, so this transition will be pruned on open.`);
    else {
      const gap = (b.startTime ?? 0) - ((a.startTime ?? 0) + (a.duration ?? 0));
      if (Math.abs(gap) > 40)
        err(`transition ${t.id}: "${a.id}" ends ${gap}ms before "${b.id}" starts — clips must touch (±40ms) to form a junction.`);
    }
    const p = t.params ?? {};
    // The trap that made the shipped directional blur look like a no-op.
    if ((p.blurAngle !== undefined || p.blurAniso !== undefined) && !(p.blur > 0))
      err(`transition ${t.id}: blurAngle/blurAniso set but blur is ${p.blur ?? 'unset'} — blur defaults to 0, and a 0-radius kernel is a plain sample, so the smear is invisible. Set blur (0..1).`);
    if ((p.blur !== undefined || p.blurAngle !== undefined) && !String(t.effectId ?? '').startsWith('distort.'))
      warn(`transition ${t.id}: blur params on "${t.effectId}" — blurAmt/blurAngle/blurAniso are only read by the DISTORT family; other families ignore them.`);
    if ((p.originX !== undefined || p.originY !== undefined || p.bulge !== undefined) && !String(t.effectId ?? '').startsWith('wipe.'))
      warn(`transition ${t.id}: originX/originY/bulge on "${t.effectId}" — those are only read by the WIPE family.`);
    for (const [k, lo, hi] of [['blur',0,1],['blurAniso',0,1],['originX',0,1],['originY',0,1],['bulge',0,1]])
      if (p[k] !== undefined && (p[k] < lo || p[k] > hi))
        err(`transition ${t.id}: params.${k}=${p[k]} out of range ${lo}..${hi} (it will be clamped).`);
  }

  // ── slots ─────────────────────────────────────────────────────────────
  const slotIds = new Set(slots.map((s) => s.id));
  const seen = new Set();
  for (const s of slots) {
    if (seen.has(s.id)) err(`duplicate slot id "${s.id}"`);
    seen.add(s.id);
    if (!['text', 'image', 'video', 'audio'].includes(s.kind)) err(`slot ${s.id}: bad kind "${s.kind}"`);
    if (s.kind !== 'text' && s.required && !s.defaultBinding)
      warn(`slot ${s.id}: required media slot with no defaultBinding — the gallery demo will be empty`);
  }
  for (const l of layers)
    if (l.slotRef && !slotIds.has(l.slotRef)) err(`layer ${l.id}: slotRef "${l.slotRef}" matches no declared slot`);

  // ── URLs ──────────────────────────────────────────────────────────────
  const urls = [];
  const walk = (o, path) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'string' && /^(https?|file|content|blob):/i.test(v)) urls.push([`${path}.${k}`, v]);
      else if (typeof v === 'object') walk(v, `${path}.${k}`);
    }
  };
  layers.forEach((l, i) => walk(l, `layers[${i}]`));
  slots.forEach((s, i) => walk(s, `slots[${i}]`));
  for (const [where, u] of urls) {
    if (/^file:/i.test(u)) err(`${where}: file:// path — the slot will be EMPTY on every other device. Host it on the CDN.`);
    else if (/^http:/i.test(u)) err(`${where}: plain http — must be https`);
  }

  // ── SVG gradient ids must be globally unique ──────────────────────────
  const grads = [];
  for (const l of layers)
    for (const m of String(l.svgContent ?? '').matchAll(/<(?:linear|radial)Gradient[^>]*\bid=['"]([^'"]+)['"]/g))
      grads.push([l.id, m[1]]);
  const gseen = new Map();
  for (const [lid, g] of grads) {
    if (gseen.has(g)) err(`gradient id "${g}" used by both ${gseen.get(g)} and ${lid} — ids are GLOBAL; one shape will render with no fill in the MP4`);
    gseen.set(g, lid);
  }

  // ── timing + keyframe units ───────────────────────────────────────────
  for (const l of layers) {
    if (typeof l.startTime !== 'number') err(`layer ${l.id}: startTime missing`);
    if (typeof l.duration !== 'number') err(`layer ${l.id}: duration missing`);
    if (typeof doc.durationMs === 'number' && (l.startTime + l.duration) > doc.durationMs + 1)
      warn(`layer ${l.id}: ends at ${l.startTime + l.duration}ms, past durationMs ${doc.durationMs}`);
    const tracksKf = l.keyframes?.tracks ?? [];
    for (const t of tracksKf) {
      for (const k of t.keyframes ?? []) {
        if (!Number.isFinite(k.t)) { err(`layer ${l.id}: keyframe t not a number`); continue; }
        // t is MICROSECONDS, absolute. A layer 1s+ in whose keyframes are all tiny
        // is the classic ms-instead-of-µs mistake (1000x too fast).
        if (k.t > 0 && k.t < 100000 && (l.duration ?? 0) > 1000)
          warn(`layer ${l.id}: keyframe t=${k.t} looks like MILLISECONDS — t must be MICROSECONDS (12s = 12000000)`);
      }
    }
  }

  // ── field legality per layer type (the blank-export killers) ──────────
  if (MATRIX) {
    for (const l of layers) {
      const kind = kindOf(l);
      if (!kind) { warn(`layer ${l.id}: unknown type "${l.type}"`); continue; }
      const spec = MATRIX.layerTypes[kind];
      if (!spec) continue;
      const check = (field, present) => {
        if (!present) return;
        const verdict = spec.fields?.[field];
        if (verdict === 'breaks')
          err(`layer ${l.id} (${kind}): "${field}" BREAKS this layer type in the export (renders blank/mis-sized). Remove it.`);
        else if (verdict === 'canvasOnly')
          warn(`layer ${l.id} (${kind}): "${field}" is canvas-only — it will not match the exported MP4.`);
      };
      check('colorAdjust', !!l.colorAdjust);
      check('videoEffects', Array.isArray(l.videoEffects) && l.videoEffects.length > 0);
      check('keyframes', !!(l.keyframes?.tracks?.length || l.keyframes?.positionTrack));
      // scale is only suspect on positioned (non-stretch) layers
      if (!l.stretchToCanvas && typeof l.scale === 'number' && l.scale !== 1) check('scale', true);
      if (kind === 'generativeBg')
        warn(`layer ${l.id}: generativeBg "${l.effectId}" — canvas and export DIVERGE. Prefer a real-footage light-leak overlay video (blendMode:'screen').`);
      // positioned raster sized by scale => the classic grid-sizing mistake
      if (kind === 'image.raster' && !l.stretchToCanvas && l.canvasRelativeWidth == null && (l.scale ?? 1) !== 1)
        err(`layer ${l.id}: positioned IMAGE sized by scale — the export sizes it from baseWidth*scale and will NOT match. Use a media-fill SHAPE with canvasRelativeWidth/Height instead.`);
    }
  }

  // ── z-order: text hidden behind full-canvas media ─────────────────────
  const texts = layers.filter((l) => l.type === 'text');
  const fullCanvas = layers.filter((l) => l.stretchToCanvas && ['video', 'image'].includes(l.type) && (l.name ?? '') !== 'Background');
  for (const t of texts)
    for (const m of fullCanvas)
      if (m.trackIndex < t.trackIndex && overlaps(t, m) && (m.opacity ?? 1) > 0.6) {
        warn(`text "${t.id}" (track ${t.trackIndex}) sits BEHIND full-canvas media "${m.id}" (track ${m.trackIndex}) while both are on screen — the text may be invisible. LOWER trackIndex = front.`);
        break;
      }

  // ── centered text convention ──────────────────────────────────────────
  for (const l of texts)
    if (l.textFullWidth === true && (l.position?.x ?? 0) !== 0)
      warn(`text ${l.id}: textFullWidth:true but position.x=${l.position?.x} — set x:0 (x is ignored; textAlign centers the glyphs)`);

  // ── slotCounts hygiene ────────────────────────────────────────────────
  if (doc.slotCounts) {
    const actual = {};
    for (const s of slots) actual[s.kind] = (actual[s.kind] ?? 0) + 1;
    for (const [k, v] of Object.entries(doc.slotCounts))
      if ((actual[k] ?? 0) !== v) warn(`slotCounts.${k}=${v} but slots[] has ${actual[k] ?? 0}`);
  }

  return { label, errors: E, warnings: W };
}

// ── CLI ─────────────────────────────────────────────────────────────────
const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node validate-reel.mjs <reel.json> [...]');
  process.exit(2);
}
let failed = 0;
for (const f of files) {
  let doc;
  try { doc = JSON.parse(readFileSync(f, 'utf8')); }
  catch (e) { console.log(`\n✗ ${basename(f)}  — unreadable JSON: ${e.message}`); failed++; continue; }
  const { errors, warnings } = validate(doc, f);
  const tag = errors.length ? '✗' : warnings.length ? '!' : '✓';
  console.log(`\n${tag} ${basename(f)}  (${doc.id ?? '?'}, ${((doc.durationMs ?? 0) / 1000).toFixed(1)}s, ${doc.layers?.length ?? 0} layers, ${doc.slots?.length ?? 0} slots)`);
  for (const e of errors) console.log(`   ERROR  ${e}`);
  for (const w of warnings) console.log(`   warn   ${w}`);
  if (!errors.length && !warnings.length) console.log('   clean');
  if (errors.length) failed++;
}
console.log(`\n${failed ? `${failed} file(s) with errors` : 'all files passed'}`);
process.exit(failed ? 1 : 0);
