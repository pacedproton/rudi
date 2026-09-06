/**
 * Druckschrift letter-form catalog for the post-reading writing track.
 *
 * Coordinates are normalized to a four-line page:
 *   y = 0     Oberlinie (ascender)
 *   y = 1/3   Mittellinie (x-height)
 *   y = 2/3   Grundlinie (baseline)
 *   y = 1     Unterlinie (descender)
 *   x = 0..1  left to right of one letter slot
 */

export interface LetterPoint {
  x: number;
  y: number;
}

export interface LetterStroke {
  points: LetterPoint[];
}

export type LetterBox = 'x-height' | 'ascender' | 'descender';

export interface LetterForm {
  glyph: string;
  family: number;
  box: LetterBox;
  strokes: LetterStroke[];
}

export interface LetterFamily {
  id: number;
  letters: string[];
  title: string;
}

export const LINE = {
  ASCENDER: 0,
  X_HEIGHT: 1 / 3,
  BASELINE: 2 / 3,
  DESCENDER: 1
} as const;

export const LETTER_FAMILIES: LetterFamily[] = [
  { id: 1, letters: ['c', 'o', 'a', 'd', 'g'], title: 'Runde Buchstaben' },
  { id: 2, letters: ['i', 'u', 'l', 't'], title: 'Strichbuchstaben' },
  { id: 3, letters: ['n', 'm', 'h'], title: 'Bruckenbuchstaben' }
];

function ellipseArc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  start: number,
  end: number,
  steps = 16
): LetterPoint[] {
  const points: LetterPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps;
    points.push({
      x: cx + rx * Math.cos(t),
      y: cy + ry * Math.sin(t)
    });
  }
  return points;
}

function line(x1: number, y1: number, x2: number, y2: number, steps = 8): LetterPoint[] {
  const points: LetterPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t
    });
  }
  return points;
}

function polyline(points: LetterPoint[]): LetterPoint[] {
  const result: LetterPoint[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const segment = line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 6);
    if (i > 0) segment.shift();
    result.push(...segment);
  }
  return result;
}

const MID_Y = 0.5;
const BOWL_CX = 0.42;
const BOWL_RX = 0.26;
const BOWL_RY = 0.155;
const STEM_X = 0.7;

function bowl(closedRight = false): LetterPoint[] {
  if (closedRight) {
    return ellipseArc(BOWL_CX, MID_Y, BOWL_RX, BOWL_RY, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2, 18);
  }
  return ellipseArc(BOWL_CX, MID_Y, BOWL_RX, BOWL_RY, 0.55, 0.55 - Math.PI * 2 + 0.2, 16);
}

const LETTER_FORMS: Record<string, LetterForm> = {
  c: {
    glyph: 'c',
    family: 1,
    box: 'x-height',
    strokes: [
      {
        points: ellipseArc(0.5, MID_Y, 0.3, BOWL_RY, -0.45, -Math.PI * 2 + 0.55, 18)
      }
    ]
  },
  o: {
    glyph: 'o',
    family: 1,
    box: 'x-height',
    strokes: [
      {
        points: ellipseArc(0.5, MID_Y, 0.28, BOWL_RY, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2, 20)
      }
    ]
  },
  a: {
    glyph: 'a',
    family: 1,
    box: 'x-height',
    strokes: [
      { points: bowl() },
      { points: line(STEM_X, LINE.X_HEIGHT, STEM_X, LINE.BASELINE) }
    ]
  },
  d: {
    glyph: 'd',
    family: 1,
    box: 'ascender',
    strokes: [
      { points: bowl() },
      { points: line(STEM_X, 0.06, STEM_X, LINE.BASELINE, 12) }
    ]
  },
  g: {
    glyph: 'g',
    family: 1,
    box: 'descender',
    strokes: [
      { points: bowl() },
      {
        points: polyline([
          { x: STEM_X, y: LINE.X_HEIGHT },
          { x: STEM_X, y: 0.82 },
          { x: 0.5, y: 0.95 },
          { x: 0.28, y: 0.88 }
        ])
      }
    ]
  },
  i: {
    glyph: 'i',
    family: 2,
    box: 'x-height',
    strokes: [
      { points: line(0.5, LINE.X_HEIGHT, 0.5, LINE.BASELINE) },
      { points: line(0.5, 0.16, 0.5, 0.2, 2) }
    ]
  },
  u: {
    glyph: 'u',
    family: 2,
    box: 'x-height',
    strokes: [
      {
        points: [
          ...line(0.22, LINE.X_HEIGHT, 0.22, 0.58),
          ...ellipseArc(0.5, 0.58, 0.28, 0.09, Math.PI, 0, 10).slice(1),
          ...line(0.78, 0.58, 0.78, LINE.X_HEIGHT).slice(1),
          ...line(0.78, LINE.X_HEIGHT, 0.78, LINE.BASELINE).slice(1)
        ]
      }
    ]
  },
  l: {
    glyph: 'l',
    family: 2,
    box: 'ascender',
    strokes: [{ points: line(0.5, 0.06, 0.5, LINE.BASELINE, 12) }]
  },
  t: {
    glyph: 't',
    family: 2,
    box: 'ascender',
    strokes: [
      { points: line(0.5, 0.16, 0.5, LINE.BASELINE, 10) },
      { points: line(0.22, 0.36, 0.78, 0.36, 6) }
    ]
  },
  n: {
    glyph: 'n',
    family: 3,
    box: 'x-height',
    strokes: [
      { points: line(0.22, LINE.X_HEIGHT, 0.22, LINE.BASELINE) },
      {
        points: polyline([
          { x: 0.22, y: 0.38 },
          { x: 0.45, y: LINE.X_HEIGHT },
          { x: 0.72, y: 0.38 },
          { x: 0.72, y: LINE.BASELINE }
        ])
      }
    ]
  },
  m: {
    glyph: 'm',
    family: 3,
    box: 'x-height',
    strokes: [
      { points: line(0.12, LINE.X_HEIGHT, 0.12, LINE.BASELINE) },
      {
        points: polyline([
          { x: 0.12, y: 0.38 },
          { x: 0.32, y: LINE.X_HEIGHT },
          { x: 0.48, y: 0.4 },
          { x: 0.48, y: LINE.BASELINE }
        ])
      },
      {
        points: polyline([
          { x: 0.48, y: 0.38 },
          { x: 0.68, y: LINE.X_HEIGHT },
          { x: 0.86, y: 0.4 },
          { x: 0.86, y: LINE.BASELINE }
        ])
      }
    ]
  },
  h: {
    glyph: 'h',
    family: 3,
    box: 'ascender',
    strokes: [
      { points: line(0.22, 0.06, 0.22, LINE.BASELINE, 12) },
      {
        points: polyline([
          { x: 0.22, y: 0.4 },
          { x: 0.48, y: LINE.X_HEIGHT },
          { x: 0.75, y: 0.4 },
          { x: 0.75, y: LINE.BASELINE }
        ])
      }
    ]
  }
};

export function getLetterForm(glyph: string): LetterForm | undefined {
  return LETTER_FORMS[glyph];
}

export function requireLetterForm(glyph: string): LetterForm {
  const form = getLetterForm(glyph);
  if (!form) {
    throw new Error(`No letter form for "${glyph}"`);
  }
  return form;
}

export function listLetterGlyphs(): string[] {
  return LETTER_FAMILIES.flatMap((family) => family.letters);
}

export function getFamilyForLetter(glyph: string): number | undefined {
  return getLetterForm(glyph)?.family;
}

export function getFamilyById(id: number): LetterFamily | undefined {
  return LETTER_FAMILIES.find((family) => family.id === id);
}
