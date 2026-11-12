'use client';

import * as React from 'react';

import { ART_PRESETS, createArtJob } from './glass-folder-art';

import type { ArtJob } from './glass-folder-art';
import type { ArtPreset, ArtRecipe } from './glass-folder-types';

const recipeOf = (art: ArtPreset | ArtRecipe): ArtRecipe =>
  typeof art === 'string' ? ART_PRESETS[art] : art;

type Painted = HTMLCanvasElement;
const artCache = new Map<string, Promise<Painted>>();
const queue: QueueItem[] = [];
let pumping = false;

type QueueItem = { job: ArtJob; priority: number; done: (c: Painted) => void };

function rasterizeJob(head: QueueItem) {
  const c = document.createElement('canvas');
  c.width = head.job.width;
  c.height = head.job.height;
  c.getContext('2d')?.putImageData(
    new ImageData(new Uint8ClampedArray(head.job.pixels), c.width, c.height),
    0,
    0
  );
  head.done(c);
}

function drainQueueSlice() {
  const until = performance.now() + 7;
  while (queue.length && performance.now() < until) {
    const head = queue[0]!;
    if (!head.job.step({ rows: 4 })) continue;
    queue.shift();
    rasterizeJob(head);
  }
}

function pump() {
  if (pumping) return;
  pumping = true;
  const tick = () => {
    drainQueueSlice();
    if (queue.length) requestAnimationFrame(tick);
    else pumping = false;
  };
  requestAnimationFrame(tick);
}

type PaintRequest = {
  recipe: ArtRecipe;
  seed: number;
  w: number;
  h: number;
  priority: number;
};

function paint(req: PaintRequest): Promise<Painted> {
  const { recipe, seed, w, h, priority } = req;
  const key = JSON.stringify([recipe, seed, w, h]);
  let p = artCache.get(key);
  if (!p) {
    p = new Promise<Painted>((done) => {
      let at = queue.length;
      while (at > 1 && queue[at - 1]!.priority > priority) at--;
      queue.splice(at, 0, {
        job: createArtJob({ width: w, height: h, recipe, seed }),
        priority,
        done,
      });
      pump();
    });
    artCache.set(key, p);
  }
  return p;
}

export function ArtCanvas({
  art,
  seed,
  w,
  h,
  density,
  priority,
  className,
}: Readonly<{
  art: ArtPreset | ArtRecipe;
  seed: number;
  w: number;
  h: number;
  density: number;
  priority: number;
  className?: string;
}>) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = React.useState(false);
  const recipe = recipeOf(art);
  const key = JSON.stringify(recipe);
  const pw = Math.round(w * density);
  const ph = Math.round(h * density);

  React.useEffect(() => {
    let live = true;
    setReady(false);
    void paint({ recipe: JSON.parse(key) as ArtRecipe, seed, w: pw, h: ph, priority })
      .then((src) => {
        const c = ref.current;
        if (!live || !c) return;
        c.width = src.width;
        c.height = src.height;
        c.getContext('2d')?.drawImage(src, 0, 0);
        setReady(true);
      })
      .catch(() => {
        /* paint queue cancelled / unmounted — ignore */
      });
    return () => {
      live = false;
    };
  }, [key, seed, pw, ph, priority]);

  return (
    <canvas
      ref={ref}
      className={className}
      data-ready={ready || undefined}
      style={{ width: w, height: h, maxWidth: 'none' }}
    />
  );
}
