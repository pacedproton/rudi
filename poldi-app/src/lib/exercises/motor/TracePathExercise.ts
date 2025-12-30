/**
 * TracePathExercise - Trace along a winding path
 *
 * Child must trace along a curvy path from start to end without lifting finger.
 * Used to assess fine motor control and graphomotor skills.
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';

export interface TracePathConfig {
  type: 'trace_path';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Point {
  x: number;
  y: number;
}

export class TracePathExercise extends ExercisePlugin {
  private difficulty!: 'easy' | 'medium' | 'hard';
  private pathPoints: Point[] = [];
  private tracePoints: Point[] = [];
  private isDrawing = false;
  private doneButton = { x: 0, y: 0, w: 0, h: 0 };

  get type(): ExerciseType {
    return 'trace_path';
  }

  initialize(config: TracePathConfig): void {
    super.initialize(config);
    this.difficulty = config.difficulty || 'medium';
    this.generatePath();
  }

  getInstruction(): string {
    return 'Fahre mit dem Finger die Straße nach!';
  }

  /**
   * Generate a curvy path based on difficulty
   */
  private generatePath(): void {
    const width = 800;
    const height = 600;
    const margin = 100;

    // Create a wavy path from left to right
    const numPoints = this.difficulty === 'easy' ? 5 : this.difficulty === 'medium' ? 8 : 12;
    this.pathPoints = [];

    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const x = margin + t * (width - 2 * margin);
      const y = height / 2 + Math.sin(t * Math.PI * 3) * (height / 4);
      this.pathPoints.push({ x, y });
    }
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${24 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'top';
    ctx.ctx.fillText('Fahre die Straße nach!', width / 2, 20 * scale);

    // Draw path (gray road)
    const pathWidth = 60 * scale;
    ctx.ctx.strokeStyle = '#bbb';
    ctx.ctx.lineWidth = pathWidth;
    ctx.ctx.lineCap = 'round';
    ctx.ctx.lineJoin = 'round';

    ctx.ctx.beginPath();
    this.pathPoints.forEach((point, index) => {
      const x = point.x * scale;
      const y = point.y * scale;
      if (index === 0) {
        ctx.ctx.moveTo(x, y);
      } else {
        ctx.ctx.lineTo(x, y);
      }
    });
    ctx.ctx.stroke();

    // Draw centerline (dashed)
    ctx.ctx.strokeStyle = '#fff';
    ctx.ctx.lineWidth = 3 * scale;
    ctx.ctx.setLineDash([10 * scale, 10 * scale]);
    ctx.ctx.beginPath();
    this.pathPoints.forEach((point, index) => {
      const x = point.x * scale;
      const y = point.y * scale;
      if (index === 0) {
        ctx.ctx.moveTo(x, y);
      } else {
        ctx.ctx.lineTo(x, y);
      }
    });
    ctx.ctx.stroke();
    ctx.ctx.setLineDash([]);

    // Draw start marker
    const startPoint = this.pathPoints[0];
    ctx.ctx.fillStyle = '#2ecc71';
    ctx.ctx.beginPath();
    ctx.ctx.arc(startPoint.x * scale, startPoint.y * scale, 20 * scale, 0, Math.PI * 2);
    ctx.ctx.fill();
    ctx.ctx.fillStyle = '#fff';
    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('⚑', startPoint.x * scale, startPoint.y * scale);

    // Draw end marker
    const endPoint = this.pathPoints[this.pathPoints.length - 1];
    ctx.ctx.fillStyle = '#e74c3c';
    ctx.ctx.beginPath();
    ctx.ctx.arc(endPoint.x * scale, endPoint.y * scale, 20 * scale, 0, Math.PI * 2);
    ctx.ctx.fill();
    ctx.ctx.fillStyle = '#fff';
    ctx.ctx.fillText('★', endPoint.x * scale, endPoint.y * scale);

    // Draw user's trace
    if (this.tracePoints.length > 0) {
      ctx.ctx.strokeStyle = '#667eea';
      ctx.ctx.lineWidth = 4 * scale;
      ctx.ctx.lineCap = 'round';
      ctx.ctx.lineJoin = 'round';

      ctx.ctx.beginPath();
      this.tracePoints.forEach((point, index) => {
        if (index === 0) {
          ctx.ctx.moveTo(point.x, point.y);
        } else {
          ctx.ctx.lineTo(point.x, point.y);
        }
      });
      ctx.ctx.stroke();
    }

    // Draw "Done" button
    const buttonWidth = 150 * scale;
    const buttonHeight = 50 * scale;
    this.doneButton = {
      x: width - buttonWidth - 20 * scale,
      y: height - buttonHeight - 20 * scale,
      w: buttonWidth,
      h: buttonHeight
    };

    this.drawRoundedRect(ctx, this.doneButton, {
      fillStyle: this.tracePoints.length > 10 ? '#2ecc71' : '#ccc',
      strokeStyle: '#333',
      lineWidth: 2 * scale
    });

    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.fillStyle = '#fff';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(
      'Fertig',
      this.doneButton.x + this.doneButton.w / 2,
      this.doneButton.y + this.doneButton.h / 2
    );

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    if (event.type === 'start') {
      // Check if clicking Done button
      if (this.isInside(event.x, event.y, this.doneButton) && this.tracePoints.length > 10) {
        // Calculate coverage score
        const coverage = this.calculateCoverage();
        const correct = coverage > 0.6;  // 60% coverage threshold
        return {
          correct,
          responseTime: this.getElapsedTime()
        };
      }

      // Start drawing
      this.isDrawing = true;
      this.tracePoints = [{ x: event.x, y: event.y }];
      return null;
    }

    if (event.type === 'move' && this.isDrawing) {
      this.tracePoints.push({ x: event.x, y: event.y });
      return null;
    }

    if (event.type === 'end') {
      this.isDrawing = false;
      return null;
    }

    return null;
  }

  /**
   * Calculate how well the user followed the path
   */
  private calculateCoverage(): number {
    if (this.tracePoints.length === 0) return 0;

    const ctx = this.getSavedContext();
    if (!ctx) return 0;

    let totalDistance = 0;
    let coveredDistance = 0;

    // Sample points along the path
    for (let i = 0; i < this.pathPoints.length - 1; i++) {
      const p1 = {
        x: this.pathPoints[i].x * ctx.scale,
        y: this.pathPoints[i].y * ctx.scale
      };
      const p2 = {
        x: this.pathPoints[i + 1].x * ctx.scale,
        y: this.pathPoints[i + 1].y * ctx.scale
      };

      const segmentDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      totalDistance += segmentDist;

      // Check if any traced point is near this segment
      const hasNearbyTrace = this.tracePoints.some(tp => {
        const distToSegment = this.pointToSegmentDistance(tp, p1, p2);
        return distToSegment < 40 * ctx.scale;  // Within 40 pixels of path
      });

      if (hasNearbyTrace) {
        coveredDistance += segmentDist;
      }
    }

    return totalDistance > 0 ? coveredDistance / totalDistance : 0;
  }

  /**
   * Calculate distance from point to line segment
   */
  private pointToSegmentDistance(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    }

    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
    const projX = a.x + t * dx;
    const projY = a.y + t * dy;

    return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
  }
}
