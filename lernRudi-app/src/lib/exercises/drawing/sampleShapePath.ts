/**
 * Sampled guide paths for SES grafomotor scoring.
 * Coordinates match the on-canvas templates in Drawing, Trace, and Handwriting.
 */

export interface PathPoint {
  x: number;
  y: number;
}

function line(x1: number, y1: number, x2: number, y2: number, steps = 12): PathPoint[] {
  const points: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return points;
}

function polyline(vertices: PathPoint[], stepsPerSeg = 10): PathPoint[] {
  const points: PathPoint[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const seg = line(vertices[i].x, vertices[i].y, vertices[i + 1].x, vertices[i + 1].y, stepsPerSeg);
    if (i > 0) seg.shift();
    points.push(...seg);
  }
  return points;
}

function circle(cx: number, cy: number, radius: number, steps = 48): PathPoint[] {
  const points: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    points.push({ x: cx + Math.cos(t) * radius, y: cy + Math.sin(t) * radius });
  }
  return points;
}

function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  start: number,
  end: number,
  steps = 20
): PathPoint[] {
  const points: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps;
    points.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry });
  }
  return points;
}

function mapBox(
  strokes: PathPoint[][],
  left: number,
  top: number,
  width: number,
  height: number
): PathPoint[][] {
  return strokes.map((stroke) =>
    stroke.map((p) => ({
      x: left + p.x * width,
      y: top + p.y * height
    }))
  );
}

function starPoints(cx: number, cy: number, spikes: number, outer: number, inner: number): PathPoint[] {
  const vertices: PathPoint[] = [];
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  vertices.push({ x: cx, y: cy - outer });
  for (let i = 0; i < spikes; i++) {
    vertices.push({ x: cx + Math.cos(rot) * outer, y: cy + Math.sin(rot) * outer });
    rot += step;
    vertices.push({ x: cx + Math.cos(rot) * inner, y: cy + Math.sin(rot) * inner });
    rot += step;
  }
  vertices.push({ x: cx, y: cy - outer });
  return polyline(vertices, 6);
}

function heartPoints(cx: number, cy: number, size: number): PathPoint[] {
  const points: PathPoint[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Match the four cubic segments in DrawingExercise.drawHeart
    let x: number;
    let y: number;
    if (t < 0.25) {
      const u = t / 0.25;
      x = cubic(cx, cx, cx - size / 2, cx - size / 2, u);
      y = cubic(cy + size / 4, cy, cy - size / 2, cy - size / 4, u);
    } else if (t < 0.5) {
      const u = (t - 0.25) / 0.25;
      x = cubic(cx - size / 2, cx - size / 2, cx, cx, u);
      y = cubic(cy - size / 4, cy, cy + size / 2, cy + size, u);
    } else if (t < 0.75) {
      const u = (t - 0.5) / 0.25;
      x = cubic(cx, cx, cx + size / 2, cx + size / 2, u);
      y = cubic(cy + size, cy + size / 2, cy, cy - size / 4, u);
    } else {
      const u = (t - 0.75) / 0.25;
      x = cubic(cx + size / 2, cx + size / 2, cx, cx, u);
      y = cubic(cy - size / 4, cy - size / 2, cy, cy + size / 4, u);
    }
    points.push({ x, y });
  }
  return points;
}

function cubic(a: number, b: number, c: number, d: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

/** Template used by DrawingExercise. */
export function sampleDrawingShape(
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart',
  width: number,
  height: number,
  scale: number
): PathPoint[][] {
  const centerX = width / 2;
  const centerY = height / 2 + 20 * scale;
  const size = Math.min(width, height) * 0.4;

  switch (shape) {
    case 'circle':
      return [circle(centerX, centerY, size / 2)];
    case 'square': {
      const left = centerX - size / 2;
      const top = centerY - size / 2;
      return [
        polyline(
          [
            { x: left, y: top },
            { x: left + size, y: top },
            { x: left + size, y: top + size },
            { x: left, y: top + size },
            { x: left, y: top }
          ],
          10
        )
      ];
    }
    case 'triangle':
      return [
        polyline(
          [
            { x: centerX, y: centerY - size / 2 },
            { x: centerX + size / 2, y: centerY + size / 2 },
            { x: centerX - size / 2, y: centerY + size / 2 },
            { x: centerX, y: centerY - size / 2 }
          ],
          12
        )
      ];
    case 'star':
      return [starPoints(centerX, centerY, 5, size / 2, size / 4)];
    case 'heart':
      return [heartPoints(centerX, centerY, size / 2)];
  }
}

/** Template used by TraceExercise. */
export function sampleTraceShape(
  shape: 'circle' | 'cross' | 'triangle',
  width: number,
  height: number,
  scale: number
): PathPoint[][] {
  const centerX = width / 2;
  const centerY = height / 2 - 30 * scale;
  const radius = 80 * scale;

  switch (shape) {
    case 'circle':
      return [circle(centerX, centerY, radius)];
    case 'cross':
      return [
        line(centerX, centerY - radius, centerX, centerY + radius, 16),
        line(centerX - radius, centerY, centerX + radius, centerY, 16)
      ];
    case 'triangle':
      return [
        polyline(
          [
            { x: centerX, y: centerY - radius },
            { x: centerX + radius, y: centerY + radius },
            { x: centerX - radius, y: centerY + radius },
            { x: centerX, y: centerY - radius }
          ],
          12
        )
      ];
  }
}

const LETTER_STROKES: Record<string, PathPoint[][]> = {
  A: [
    polyline([{ x: 0.08, y: 1 }, { x: 0.5, y: 0 }, { x: 0.92, y: 1 }], 14),
    line(0.28, 0.58, 0.72, 0.58, 8)
  ],
  B: [
    line(0.18, 0, 0.18, 1, 14),
    [...arc(0.18, 0.22, 0.42, 0.22, -Math.PI / 2, Math.PI / 2, 12), { x: 0.18, y: 0.44 }],
    [...arc(0.18, 0.72, 0.5, 0.28, -Math.PI / 2, Math.PI / 2, 12), { x: 0.18, y: 1 }]
  ],
  C: [arc(0.55, 0.5, 0.42, 0.48, 0.7, Math.PI * 2 - 0.7, 24)],
  L: [polyline([{ x: 0.22, y: 0 }, { x: 0.22, y: 1 }, { x: 0.82, y: 1 }], 14)],
  M: [
    polyline(
      [
        { x: 0.08, y: 1 },
        { x: 0.08, y: 0 },
        { x: 0.5, y: 0.55 },
        { x: 0.92, y: 0 },
        { x: 0.92, y: 1 }
      ],
      10
    )
  ],
  O: [circle(0.5, 0.5, 0.42, 36)],
  S: [
    [
      ...arc(0.5, 0.28, 0.32, 0.26, Math.PI * 0.85, Math.PI * 2.15, 14),
      ...arc(0.5, 0.72, 0.34, 0.26, Math.PI * 1.15, Math.PI * 0.15, 14)
    ]
  ],
  T: [line(0.08, 0.06, 0.92, 0.06, 10), line(0.5, 0.06, 0.5, 1, 14)],
  '1': [polyline([{ x: 0.32, y: 0.22 }, { x: 0.5, y: 0 }, { x: 0.5, y: 1 }], 14), line(0.28, 1, 0.72, 1, 6)],
  '2': [
    [
      ...arc(0.5, 0.28, 0.32, 0.26, Math.PI * 1.15, Math.PI * 2.05, 14),
      { x: 0.22, y: 1 },
      { x: 0.82, y: 1 }
    ]
  ],
  '3': [
    [
      ...arc(0.48, 0.26, 0.34, 0.24, Math.PI * 0.85, Math.PI * 2.2, 12),
      ...arc(0.48, 0.74, 0.36, 0.26, Math.PI * 1.2 + Math.PI, Math.PI * 0.2, 12)
    ]
  ],
  '5': [
    polyline(
      [
        { x: 0.78, y: 0.04 },
        { x: 0.28, y: 0.04 },
        { x: 0.24, y: 0.42 },
        { x: 0.5, y: 0.4 }
      ],
      8
    ),
    arc(0.48, 0.68, 0.36, 0.3, Math.PI * 1.15, Math.PI * 0.15, 16)
  ]
};

/** Guide box for the faded handwriting character. */
export function sampleLetterStrokes(
  character: string,
  width: number,
  height: number,
  scale: number
): PathPoint[][] {
  const size = 300 * scale;
  const left = width / 2 - size * 0.32;
  const top = height / 2 - size * 0.42;
  const boxW = size * 0.64;
  const boxH = size * 0.78;
  const key = character.toUpperCase();
  const strokes = LETTER_STROKES[key] ?? [circle(0.5, 0.5, 0.4, 28)];
  return mapBox(strokes, left, top, boxW, boxH);
}

export const GRAFOMOTOR_SCORE_OPTIONS = {
  hitRadius: 48,
  waypointThreshold: 0.38,
  overlapThreshold: 0.28,
  overallThreshold: 0.42
};
