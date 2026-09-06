/**
 * Four-line writing paper layout and letter-slot transforms.
 */

import type { RenderContext } from '$lib/core/CanvasManager';
import type { LetterForm, LetterPoint } from '$lib/data/letter-forms';
import { LINE } from '$lib/data/letter-forms';
import type { StrokePoint } from './scoreStrokes';

export interface PaperLayout {
  left: number;
  right: number;
  top: number;
  height: number;
  letterWidth: number;
  letterCount: number;
}

export interface LetterSlot {
  left: number;
  right: number;
  top: number;
  height: number;
}

export function getPaperLayout(
  width: number,
  height: number,
  scale: number,
  letterCount = 1
): PaperLayout {
  const top = height * 0.28;
  const paperHeight = Math.min(height * 0.42, 280 * scale);
  const sidePad = 70 * scale;
  const usable = Math.max(120 * scale, width - sidePad * 2);
  const letterWidth = Math.min(usable / Math.max(1, letterCount), 180 * scale);
  const totalWidth = letterWidth * letterCount;
  const left = (width - totalWidth) / 2;

  return {
    left,
    right: left + totalWidth,
    top,
    height: paperHeight,
    letterWidth,
    letterCount
  };
}

export function getLetterSlot(layout: PaperLayout, index: number): LetterSlot {
  return {
    left: layout.left + index * layout.letterWidth,
    right: layout.left + (index + 1) * layout.letterWidth,
    top: layout.top,
    height: layout.height
  };
}

export function letterPointToCanvas(point: LetterPoint, slot: LetterSlot): StrokePoint {
  const inset = slot.right - slot.left;
  const pad = inset * 0.12;
  return {
    x: slot.left + pad + point.x * (inset - pad * 2),
    y: slot.top + point.y * slot.height
  };
}

export function transformLetterStrokes(form: LetterForm, slot: LetterSlot): StrokePoint[][] {
  return form.strokes.map((stroke) => stroke.points.map((p) => letterPointToCanvas(p, slot)));
}

export function drawFourLinePaper(ctx: RenderContext, layout: PaperLayout): void {
  const { ctx: c } = ctx;
  const { left, right, top, height } = layout;

  const yAt = (unit: number) => top + unit * height;

  c.save();
  c.lineCap = 'butt';

  c.strokeStyle = '#d0d5dd';
  c.lineWidth = 1 * ctx.scale;
  c.setLineDash([6 * ctx.scale, 6 * ctx.scale]);

  c.beginPath();
  c.moveTo(left, yAt(LINE.ASCENDER));
  c.lineTo(right, yAt(LINE.ASCENDER));
  c.stroke();

  c.beginPath();
  c.moveTo(left, yAt(LINE.X_HEIGHT));
  c.lineTo(right, yAt(LINE.X_HEIGHT));
  c.stroke();

  c.beginPath();
  c.moveTo(left, yAt(LINE.DESCENDER));
  c.lineTo(right, yAt(LINE.DESCENDER));
  c.stroke();

  c.setLineDash([]);
  c.strokeStyle = '#8b93a7';
  c.lineWidth = 2 * ctx.scale;
  c.beginPath();
  c.moveTo(left, yAt(LINE.BASELINE));
  c.lineTo(right, yAt(LINE.BASELINE));
  c.stroke();

  c.restore();
}

export function drawLetterGuide(
  ctx: RenderContext,
  strokes: StrokePoint[][],
  alpha: number,
  color = '#667eea'
): void {
  if (alpha <= 0) return;
  const { ctx: c } = ctx;
  c.save();
  c.globalAlpha = alpha;
  c.strokeStyle = color;
  c.lineWidth = 7 * ctx.scale;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    c.beginPath();
    c.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      c.lineTo(stroke[i].x, stroke[i].y);
    }
    c.stroke();
  }
  c.restore();
}

export function pointAlongStrokes(strokes: StrokePoint[][], progress: number): StrokePoint | null {
  const all: StrokePoint[] = [];
  for (const stroke of strokes) {
    all.push(...stroke);
  }
  if (all.length === 0) return null;
  const t = ((progress % 1) + 1) % 1;
  const index = Math.min(all.length - 1, Math.floor(t * all.length));
  return all[index];
}
