import type { ArtPreset, ArtRecipe } from './glass-folder-types';

export const ART_PRESETS: Record<ArtPreset, ArtRecipe> = {
  // a long exposure: blush, oxblood and steel pulled across the frame
  aurora: {
    style: 'streak',
    colors: ['#f4efe9', '#e9c2b8', '#c2433f', '#2a1e2a', '#22395e', '#6f97c2', '#e5edf4'],
    scale: 0.7,
    warp: 1.4,
    angle: -0.62,
    gloss: 0.18,
    veins: 0,
  },
  // red ink folding through teal-black water
  ember: {
    style: 'marble',
    colors: ['#07090c', '#16252c', '#3d5f68', '#1a1416', '#a3201a', '#ef4a2b', '#ff8a5c'],
    scale: 0.62,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.55,
    veins: 0.6,
  },
  // plum and rust, swirled
  dusk: {
    style: 'marble',
    colors: ['#120c18', '#3e2850', '#8f6c9c', '#2b1a24', '#b3502f', '#eab08a', '#fbe7d2'],
    scale: 0.75,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.5,
  },
  // cold, pale, nearly white
  glacier: {
    style: 'streak',
    colors: ['#f7f8fa', '#d9e2ea', '#9fb4c7', '#e8edf2', '#bccbd8', '#ffffff'],
    scale: 0.7,
    warp: 1.6,
    angle: 0.35,
    gloss: 0.25,
    veins: 0,
  },
  // moss and brass
  verdant: {
    style: 'marble',
    colors: ['#070b08', '#173024', '#4f7a5a', '#141812', '#a7843a', '#e9cf87', '#fbf3d6'],
    scale: 0.7,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },
};

export type HexColor = { hex: string };
export type ArtSeed = { seed: number };
export type ArtText = { text: string };
export type FanSlotQuery = { index: number; count: number };
export type ArtJobSpec = {
  width: number;
  height: number;
  recipe: ArtRecipe;
  seed: number;
};
export type ArtStepBatch = { rows: number };

/** `#rgb` or `#rrggbb` to a triple. Anything unreadable comes back mid-grey. */
export function hexToRgb(color: HexColor): [number, number, number] {
  let h = color.hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  const n = /^[0-9a-f]{6}$/i.test(h) ? Number.parseInt(h, 16) : 0x808080;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A small, fast, seedable PRNG (mulberry32). */
export function rng(source: ArtSeed): () => number {
  let a = source.seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable small integer for a string, so a file's art follows its name. */
export function hashString(input: ArtText): number {
  let h = 2166136261;
  for (let i = 0; i < input.text.length; i++) {
    h = Math.imul(h ^ (input.text.codePointAt(i) ?? 0), 16777619);
  }
  return h >>> 0;
}

/** Seeded gradient noise, summed into fractal octaves with a rotation between each. */
function makeFbm(source: ArtSeed): (point: { x: number; y: number; octaves: number }) => number {
  const r = rng(source);
  const perm = new Uint8Array(512);
  const grad = new Float32Array(512);
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = p[i]!;
    p[i] = p[j]!;
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]!;
  for (let i = 0; i < 256; i++) {
    const a = r() * Math.PI * 2;
    grad[i * 2] = Math.cos(a);
    grad[i * 2 + 1] = Math.sin(a);
  }
  const noise = (point: { x: number; y: number }): number => {
    const xi = Math.floor(point.x);
    const yi = Math.floor(point.y);
    const xf = point.x - xi;
    const yf = point.y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const h00 = perm[X + perm[Y]!]! * 2;
    const h10 = perm[X + 1 + perm[Y]!]! * 2;
    const h01 = perm[X + perm[Y + 1]!]! * 2;
    const h11 = perm[X + 1 + perm[Y + 1]!]! * 2;
    const d00 = grad[h00]! * xf + grad[h00 + 1]! * yf;
    const d10 = grad[h10]! * (xf - 1) + grad[h10 + 1]! * yf;
    const d01 = grad[h01]! * xf + grad[h01 + 1]! * (yf - 1);
    const d11 = grad[h11]! * (xf - 1) + grad[h11 + 1]! * (yf - 1);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    return d00 + u * (d10 - d00) + v * (d01 - d00 + u * (d11 - d01 - d10 + d00));
  };
  return (point) => {
    let { x, y } = point;
    let sum = 0;
    let amp = 0.5;
    for (let i = 0; i < point.octaves; i++) {
      sum += amp * noise({ x, y });
      const nx = 1.6 * x + 1.2 * y + 7.1;
      y = -1.2 * x + 1.6 * y + 3.3;
      x = nx;
      amp *= 0.5;
    }
    return sum;
  };
}

export type ArtJob = {
  width: number;
  height: number;
  /** RGBA, ready for `new ImageData(pixels, width, height)`. */
  pixels: Uint8ClampedArray;
  /** Paint up to `rows` more rows. Returns true once the picture is finished. */
  step: (batch: ArtStepBatch) => boolean;
};

type UpsampleCtx = {
  G: Float32Array;
  GQ: Float32Array;
  F: Float32Array;
  Q: Float32Array;
  w: number;
  h: number;
  gw: number;
  gh: number;
};

/** 4-tap Catmull-Rom along one axis (half-pixel odd samples). */
function catmullRom1D(taps: readonly [number, number, number, number]): number {
  const [a, b, c, d] = taps;
  return (-a + 9 * b + 9 * c - d) / 16;
}

function sampleGridOrInterp(sample: {
  isOdd: boolean;
  taps: readonly [number, number, number, number];
}): number {
  if (!sample.isOdd) return sample.taps[1];
  return catmullRom1D(sample.taps);
}

function lerpHalf(pair: { a: number; b: number }): number {
  return (pair.a + pair.b) / 2;
}

/** Horizontal sample on one coarse GQ row. */
function sampleQAtRow(query: {
  GQ: Float32Array;
  rowBase: number;
  gx: number;
  xOdd: boolean;
}): number {
  const q0 = query.GQ[query.rowBase + query.gx]!;
  if (!query.xOdd) return q0;
  return lerpHalf({ a: q0, b: query.GQ[query.rowBase + query.gx + 1]! });
}

function sampleQForPixel(query: {
  ctx: UpsampleCtx;
  rowC: number;
  gx: number;
  odd: { x: boolean; y: boolean };
}): number {
  const { GQ, gw } = query.ctx;
  const qx = sampleQAtRow({ GQ, rowBase: query.rowC * gw, gx: query.gx, xOdd: query.odd.x });
  if (!query.odd.y) return qx;
  return lerpHalf({
    a: qx,
    b: sampleQAtRow({ GQ, rowBase: (query.rowC + 1) * gw, gx: query.gx, xOdd: query.odd.x }),
  });
}

/** Upsample coarse field G → full-res F, and warp energy GQ → Q. */
function upsampleField(ctx: UpsampleCtx): void {
  const T = upsampleHorizontal(ctx);
  upsampleVertical({ ctx, T });
}

function upsampleHorizontal(ctx: UpsampleCtx): Float32Array {
  const T = new Float32Array(ctx.w * ctx.gh);
  for (let gy = 0; gy < ctx.gh; gy++) fillUpsampledRow({ ctx, T, gy });
  return T;
}

function fillUpsampledRow(args: { ctx: UpsampleCtx; T: Float32Array; gy: number }): void {
  const { ctx, T, gy } = args;
  const { G, w, gw } = ctx;
  const row = gy * gw;
  const dest = gy * w;
  for (let x = 0; x < w; x++) {
    const c = (x >> 1) + 1;
    T[dest + x] = sampleGridOrInterp({
      isOdd: (x & 1) !== 0,
      taps: [G[row + c - 1]!, G[row + c]!, G[row + c + 1]!, G[row + c + 2]!],
    });
  }
}

function upsampleVertical(args: { ctx: UpsampleCtx; T: Float32Array }): void {
  const { ctx, T } = args;
  for (let y = 0; y < ctx.h; y++) {
    const c = (y >> 1) + 1;
    for (let x = 0; x < ctx.w; x++) {
      writeUpsampledPixel({ ctx, T, pos: { c, y, x, yOdd: (y & 1) !== 0 } });
    }
  }
}

function writeUpsampledPixel(args: {
  ctx: UpsampleCtx;
  T: Float32Array;
  pos: { c: number; y: number; x: number; yOdd: boolean };
}): void {
  const { ctx, T, pos } = args;
  const { F, Q, w } = ctx;
  const { c, y, x, yOdd } = pos;
  const i = y * w + x;
  const xOdd = (x & 1) !== 0;
  F[i] = sampleGridOrInterp({
    isOdd: yOdd,
    taps: [T[(c - 1) * w + x]!, T[c * w + x]!, T[(c + 1) * w + x]!, T[(c + 2) * w + x]!],
  });
  Q[i] = sampleQForPixel({ ctx, rowC: c, gx: (x >> 1) + 1, odd: { x: xOdd, y: yOdd } });
}

type ColorStop = { t: number; c: [number, number, number] };

type ColorizeCtx = {
  F: Float32Array;
  Q: Float32Array;
  pixels: Uint8ClampedArray;
  w: number;
  h: number;
  m: number;
  stops: ColorStop[];
  gloss: number;
  veins: number;
};

type ColorizeNorm = { lo: number; k: number; slope: number };

function clamp01(value: { v: number }): number {
  if (value.v < 0) return 0;
  if (value.v > 1) return 1;
  return value.v;
}

/** Percentile stretch so every seed spans the palette. */
function fieldPercentileNorm(args: { F: Float32Array; m: number }): ColorizeNorm {
  const sample: number[] = [];
  const stride = Math.max(1, Math.floor(args.F.length / 4096));
  for (let i = 0; i < args.F.length; i += stride) sample.push(args.F[i]!);
  sample.sort((a, b) => a - b);
  const lo = sample[Math.floor(sample.length * 0.02)]!;
  const hi = sample[Math.floor(sample.length * 0.98)]!;
  const k = 1 / (hi - lo || 1);
  return { lo, k, slope: k * args.m * 0.012 };
}

function findStopPair(args: { stops: ColorStop[]; t: number }): { a: ColorStop; b: ColorStop } {
  let j = 1;
  while (j < args.stops.length - 1 && args.stops[j]!.t < args.t) j++;
  return { a: args.stops[j - 1]!, b: args.stops[j]! };
}

function smoothstepBetween(args: { t: number; a: ColorStop; b: ColorStop }): number {
  const f = clamp01({ v: (args.t - args.a.t) / (args.b.t - args.a.t || 1) });
  return f * f * (3 - 2 * f);
}

function fieldSlopeX(args: {
  F: Float32Array;
  pos: { i: number; x: number; w: number };
  slope: number;
}): number {
  const { F, pos, slope } = args;
  const { i, x, w } = pos;
  const right = x < w - 1 ? F[i + 1]! : F[i]!;
  const left = x > 0 ? F[i - 1]! : F[i]!;
  return (right - left) * slope;
}

function fieldSlopeY(args: {
  F: Float32Array;
  pos: { i: number; y: number; w: number; h: number };
  slope: number;
}): number {
  const { F, pos, slope } = args;
  const { i, y, w, h } = pos;
  const down = y < h - 1 ? F[i + w]! : F[i]!;
  const up = y > 0 ? F[i - w]! : F[i]!;
  return (down - up) * slope;
}

function shadePixel(s: {
  t: number;
  q: number;
  gx: number;
  gy: number;
  gloss: number;
  veins: number;
}): { lit: number; spec: number } {
  const lx = -0.55;
  const ly = -0.65;
  const lz = 0.52;
  const nd = (-s.gx * lx - s.gy * ly + lz) / Math.hypot(s.gx, s.gy, 1);
  const spec = Math.pow(Math.max(0, nd), 24) * s.gloss * 255;
  const silk = 1 + 0.035 * Math.sin(s.t * 150 + s.q * 24);
  const vein = s.veins * Math.max(0, 1 - Math.abs(s.q - 0.42) * 14) * 0.6;
  return { lit: (0.82 + 0.28 * nd) * silk * (1 - vein), spec };
}

function writeRgbaLit(args: {
  pixels: Uint8ClampedArray;
  i: number;
  mix: { a: ColorStop; b: ColorStop; f: number; lit: number; spec: number };
}): void {
  const { pixels, i, mix } = args;
  const { a, b, f, lit, spec } = mix;
  const o = i * 4;
  pixels[o] = (a.c[0]! + (b.c[0]! - a.c[0]!) * f) * lit + spec;
  pixels[o + 1] = (a.c[1]! + (b.c[1]! - a.c[1]!) * f) * lit + spec;
  pixels[o + 2] = (a.c[2]! + (b.c[2]! - a.c[2]!) * f) * lit + spec;
  pixels[o + 3] = 255;
}

function writeColorizedPixel(args: {
  ctx: ColorizeCtx;
  norm: ColorizeNorm;
  pos: { x: number; y: number };
}): void {
  const { ctx, norm, pos } = args;
  const { F, Q, pixels, w, h, stops, gloss, veins } = ctx;
  const { x, y } = pos;
  const i = y * w + x;
  const t = clamp01({ v: (F[i]! - norm.lo) * norm.k });
  const pair = findStopPair({ stops, t });
  const f = smoothstepBetween({ t, a: pair.a, b: pair.b });
  const gx = fieldSlopeX({ F, pos: { i, x, w }, slope: norm.slope });
  const gy = fieldSlopeY({ F, pos: { i, y, w, h }, slope: norm.slope });
  const { lit, spec } = shadePixel({ t, q: Q[i]!, gx, gy, gloss, veins });
  writeRgbaLit({ pixels, i, mix: { a: pair.a, b: pair.b, f, lit, spec } });
}

function colorizeField(ctx: ColorizeCtx): void {
  const norm = fieldPercentileNorm({ F: ctx.F, m: ctx.m });
  for (let y = 0; y < ctx.h; y++) {
    for (let x = 0; x < ctx.w; x++) writeColorizedPixel({ ctx, norm, pos: { x, y } });
  }
}

/**
 * The artwork, as a job that can be spread over several frames.
 *
 * A field is domain-warped twice (each fold feeding the next), then
 * normalised by its own percentiles so every seed spans the whole palette.
 * The field is then treated as the height of a liquid surface: its slope
 * gives a normal, the normal gives diffuse light and a tight specular, and
 * fine striations run along the contours like combed ink. `streak` squeezes
 * the coordinates along one axis first, which turns the same folds into a
 * long-exposure smear.
 */
export function createArtJob(spec: ArtJobSpec): ArtJob {
  const w = Math.max(1, Math.round(spec.width));
  const h = Math.max(1, Math.round(spec.height));
  const colors = spec.recipe.colors.length >= 2 ? spec.recipe.colors : ['#111111', '#eeeeee'];
  const stops = colors.map((c, i) => ({ t: i / (colors.length - 1), c: hexToRgb({ hex: c }) }));
  const scale = spec.recipe.scale ?? 0.7;
  const warp = spec.recipe.warp ?? 3;
  const gloss = spec.recipe.gloss ?? 0.4;
  const veins = spec.recipe.veins ?? 0;
  const streak = spec.recipe.style === 'streak';
  const fbm = makeFbm({ seed: spec.seed * 977 + 13 });
  const r = rng({ seed: spec.seed + 1 });
  const ox = r() * 50;
  const oy = r() * 50;
  const angle = (spec.recipe.angle ?? 0) + (r() - 0.5) * 0.5;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const m = Math.min(w, h);
  const gw = Math.ceil(w / 2) + 3;
  const gh = Math.ceil(h / 2) + 3;
  const G = new Float32Array(gw * gh);
  const GQ = new Float32Array(gw * gh);
  const F = new Float32Array(w * h);
  const Q = new Float32Array(w * h);
  const pixels = new Uint8ClampedArray(w * h * 4);
  let row = 0;

  const field = (cell: { gy: number }) => {
    for (let gx = 0; gx < gw; gx++) {
      const u = ((gx - 1) * 2 - w / 2) / m;
      const v = ((cell.gy - 1) * 2 - h / 2) / m;
      let px = (u * ca - v * sa) * scale;
      let py = (u * sa + v * ca) * scale;
      if (streak) {
        px *= 0.14;
        py *= 2.2;
      }
      px += ox;
      py += oy;
      const qx = fbm({ x: px, y: py, octaves: 3 });
      const qy = fbm({ x: px + 5.2, y: py + 1.3, octaves: 3 });
      const rx = fbm({ x: px + warp * qx + 1.7, y: py + warp * qy + 9.2, octaves: 3 });
      const ry = fbm({ x: px + warp * qx + 8.3, y: py + warp * qy + 2.8, octaves: 3 });
      G[cell.gy * gw + gx] = fbm({ x: px + warp * rx, y: py + warp * ry, octaves: 4 });
      GQ[cell.gy * gw + gx] = Math.hypot(qx, qy);
    }
  };

  const upsample = () => {
    upsampleField({ G, GQ, F, Q, w, h, gw, gh });
  };

  const colorize = () => {
    colorizeField({ F, Q, pixels, w, h, m, stops, gloss, veins });
  };

  const step = (batch: ArtStepBatch): boolean => {
    if (row >= gh) return true;
    const end = Math.min(gh, row + Math.max(1, batch.rows));
    while (row < end) field({ gy: row++ });
    if (row < gh) return false;
    upsample();
    colorize();
    return true;
  };

  return { width: w, height: h, pixels, step };
}

export function fanSlot(query: FanSlotQuery): number {
  return query.count <= 1 ? 0 : (query.index / (query.count - 1)) * 2 - 1;
}
