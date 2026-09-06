/**
 * Stroke scoring for Druckschrift letters and words.
 *
 * Compares user strokes to expected letter-form paths:
 * - waypoint hit rate along each expected stroke (order + coverage)
 * - overlap of user ink with the glyph
 * - vertical placement on the four-line page
 */

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeScore {
  overlap: number;
  waypointHitRate: number;
  placement: number;
  strokeCoverage: number;
  overall: number;
  passed: boolean;
}

export interface ScoreOptions {
  hitRadius: number;
  waypointThreshold?: number;
  overlapThreshold?: number;
  overallThreshold?: number;
}

const DEFAULT_WAYPOINT = 0.5;
const DEFAULT_OVERLAP = 0.4;
const DEFAULT_OVERALL = 0.52;

function distance(a: StrokePoint, b: StrokePoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function flatten(strokes: StrokePoint[][]): StrokePoint[] {
  return strokes.flat();
}

function densify(points: StrokePoint[], spacing: number): StrokePoint[] {
  if (points.length === 0) return [];
  const result: StrokePoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    const len = distance(prev, next);
    const steps = Math.max(1, Math.ceil(len / spacing));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      result.push({
        x: prev.x + (next.x - prev.x) * t,
        y: prev.y + (next.y - prev.y) * t
      });
    }
  }
  return result;
}

function nearestDistance(point: StrokePoint, cloud: StrokePoint[]): number {
  let best = Infinity;
  for (const other of cloud) {
    const d = distance(point, other);
    if (d < best) best = d;
  }
  return best;
}

function bounds(points: StrokePoint[]): { minX: number; maxX: number; minY: number; maxY: number } | null {
  if (points.length === 0) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

function placementScore(user: StrokePoint[], expected: StrokePoint[]): number {
  const userBox = bounds(user);
  const expectedBox = bounds(expected);
  if (!userBox || !expectedBox) return 0;

  const expectedHeight = Math.max(8, expectedBox.maxY - expectedBox.minY);
  const topError = Math.abs(userBox.minY - expectedBox.minY) / expectedHeight;
  const bottomError = Math.abs(userBox.maxY - expectedBox.maxY) / expectedHeight;
  const heightRatio = (userBox.maxY - userBox.minY) / expectedHeight;

  const heightScore = 1 - Math.min(1, Math.abs(heightRatio - 1));
  const alignScore = 1 - Math.min(1, (topError + bottomError) / 2);
  const reachedTop = userBox.minY <= expectedBox.minY + expectedHeight * 0.35;
  const reachedBottom = userBox.maxY >= expectedBox.maxY - expectedHeight * 0.35;
  const extentScore = (reachedTop ? 0.5 : 0) + (reachedBottom ? 0.5 : 0);
  const raw = heightScore * 0.35 + alignScore * 0.25 + extentScore * 0.4;
  if (!reachedTop || !reachedBottom) {
    return Math.min(0.35, Math.max(0, raw));
  }
  return Math.max(0, raw);
}

/**
 * Score user strokes against expected letter-form strokes in the same pixel space.
 */
export function scoreStrokes(
  userStrokes: StrokePoint[][],
  expectedStrokes: StrokePoint[][],
  options: ScoreOptions
): StrokeScore {
  const user = flatten(userStrokes);
  const expectedRaw = flatten(expectedStrokes);

  if (user.length < 4 || expectedRaw.length === 0) {
    return {
      overlap: 0,
      waypointHitRate: 0,
      placement: 0,
      strokeCoverage: 0,
      overall: 0,
      passed: false
    };
  }

  const spacing = Math.max(4, options.hitRadius * 0.6);
  const expected = densify(expectedRaw, spacing);
  const userDense = densify(user, spacing);
  const strokeCoverages = expectedStrokes.map((stroke) => {
    const dense = densify(stroke, spacing);
    if (dense.length === 0) return 1;
    const strokeHits = dense.filter((waypoint) => nearestDistance(waypoint, userDense) <= options.hitRadius)
      .length;
    return strokeHits / dense.length;
  });
  const strokeCoverage =
    strokeCoverages.length > 0
      ? strokeCoverages.reduce((sum, value) => sum + value, 0) / strokeCoverages.length
      : 0;
  const weakestStroke = strokeCoverages.length > 0 ? Math.min(...strokeCoverages) : 0;

  let hits = 0;
  for (const waypoint of expected) {
    if (nearestDistance(waypoint, userDense) <= options.hitRadius) {
      hits += 1;
    }
  }
  const waypointHitRate = hits / expected.length;

  let near = 0;
  for (const point of userDense) {
    if (nearestDistance(point, expected) <= options.hitRadius * 1.2) {
      near += 1;
    }
  }
  const overlap = near / userDense.length;
  const placement = placementScore(userDense, expected);
  const overall = waypointHitRate * 0.4 + overlap * 0.25 + placement * 0.2 + strokeCoverage * 0.15;

  const waypointThreshold = options.waypointThreshold ?? DEFAULT_WAYPOINT;
  const overlapThreshold = options.overlapThreshold ?? DEFAULT_OVERLAP;
  const overallThreshold = options.overallThreshold ?? DEFAULT_OVERALL;

  const passed =
    overall >= overallThreshold &&
    waypointHitRate >= waypointThreshold &&
    overlap >= overlapThreshold &&
    weakestStroke >= 0.35 &&
    placement >= 0.4;

  return { overlap, waypointHitRate, placement, strokeCoverage, overall, passed };
}

/**
 * Score a word by splitting user ink into letter slots and averaging letter scores.
 */
export function scoreWord(
  userStrokes: StrokePoint[][],
  letterExpected: StrokePoint[][][],
  slotRanges: Array<{ left: number; right: number }>,
  options: ScoreOptions
): StrokeScore & { letterScores: StrokeScore[] } {
  const letterScores = letterExpected.map((expected, index) => {
    const range = slotRanges[index];
    const slotted = userStrokes
      .map((stroke) => stroke.filter((p) => p.x >= range.left && p.x <= range.right))
      .filter((stroke) => stroke.length > 0);
    return scoreStrokes(slotted, expected, options);
  });

  if (letterScores.length === 0) {
    return {
      overlap: 0,
      waypointHitRate: 0,
      placement: 0,
      strokeCoverage: 0,
      overall: 0,
      passed: false,
      letterScores
    };
  }

  const overlap = letterScores.reduce((s, l) => s + l.overlap, 0) / letterScores.length;
  const waypointHitRate =
    letterScores.reduce((s, l) => s + l.waypointHitRate, 0) / letterScores.length;
  const placement = letterScores.reduce((s, l) => s + l.placement, 0) / letterScores.length;
  const strokeCoverage =
    letterScores.reduce((s, l) => s + l.strokeCoverage, 0) / letterScores.length;
  const overall = letterScores.reduce((s, l) => s + l.overall, 0) / letterScores.length;
  const passedCount = letterScores.filter((l) => l.passed).length;
  const passed = overall >= (options.overallThreshold ?? DEFAULT_OVERALL) && passedCount / letterScores.length >= 0.6;

  return { overlap, waypointHitRate, placement, strokeCoverage, overall, passed, letterScores };
}
