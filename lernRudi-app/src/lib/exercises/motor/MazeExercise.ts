/**
 * MazeExercise - Navigate through a simple maze
 *
 * Child draws a path from start to finish through a maze.
 * Tests fine motor control, planning, and spatial awareness.
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { colors } from '$lib/data/colors';

export type MazeDifficulty = 'easy' | 'medium' | 'hard';

export interface MazeConfig {
  type: 'maze';
  difficulty?: MazeDifficulty;
}

interface Point {
  x: number;
  y: number;
}

interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export class MazeExercise extends ExercisePlugin {
  private difficulty!: MazeDifficulty;
  private walls: Wall[] = [];
  private startPoint!: Point;
  private endPoint!: Point;
  private path: Point[] = [];
  private isDrawing = false;
  private doneButton = { x: 0, y: 0, w: 0, h: 0 };
  private hitWall = false;

  get type(): ExerciseType {
    return 'maze' as ExerciseType;
  }

  initialize(config: MazeConfig): void {
    super.initialize(config);
    this.difficulty = config.difficulty || 'easy';
    this.path = [];
    this.isDrawing = false;
    this.hitWall = false;
    this.generateMaze();
  }

  getInstruction(): string {
    return 'Finde den Weg durch das Labyrinth!';
  }

  /**
   * Generate a simple maze based on difficulty
   */
  private generateMaze(): void {
    const width = 800;
    const height = 600;
    const margin = 100;

    this.walls = [];

    // Set start and end points
    this.startPoint = { x: margin, y: height / 2 };
    this.endPoint = { x: width - margin, y: height / 2 };

    switch (this.difficulty) {
      case 'easy':
        // Simple S-curve maze
        this.walls = [
          // Top wall
          { x1: margin, y1: 200, x2: 500, y2: 200 },
          // Bottom wall (offset)
          { x1: 300, y1: 400, x2: width - margin, y2: 400 }
        ];
        break;

      case 'medium':
        // Zigzag maze
        this.walls = [
          { x1: margin, y1: 200, x2: 400, y2: 200 },
          { x1: 400, y1: 200, x2: 400, y2: 350 },
          { x1: 400, y1: 350, x2: 600, y2: 350 },
          { x1: 200, y1: 250, x2: 200, y2: 400 },
          { x1: 200, y1: 400, x2: 500, y2: 400 }
        ];
        break;

      case 'hard':
        // Complex maze with multiple barriers
        this.walls = [
          { x1: margin, y1: 180, x2: 350, y2: 180 },
          { x1: 350, y1: 180, x2: 350, y2: 280 },
          { x1: 250, y1: 220, x2: 250, y2: 420 },
          { x1: 250, y1: 420, x2: 450, y2: 420 },
          { x1: 450, y1: 300, x2: 450, y2: 420 },
          { x1: 450, y1: 300, x2: 650, y2: 300 },
          { x1: 550, y1: 200, x2: 550, y2: 300 },
          { x1: 550, y1: 200, x2: width - margin, y2: 200 }
        ];
        break;
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
    ctx.ctx.fillText('Finde den Weg!', width / 2, 20 * scale);

    // Draw maze walls
    ctx.ctx.strokeStyle = '#333';
    ctx.ctx.lineWidth = 8 * scale;
    ctx.ctx.lineCap = 'round';

    this.walls.forEach(wall => {
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(wall.x1 * scale, wall.y1 * scale);
      ctx.ctx.lineTo(wall.x2 * scale, wall.y2 * scale);
      ctx.ctx.stroke();
    });

    // Draw start point
    ctx.ctx.fillStyle = '#4caf50';
    ctx.ctx.beginPath();
    ctx.ctx.arc(
      this.startPoint.x * scale,
      this.startPoint.y * scale,
      20 * scale,
      0,
      Math.PI * 2
    );
    ctx.ctx.fill();
    ctx.ctx.fillStyle = '#fff';
    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(
      '⚑',
      this.startPoint.x * scale,
      this.startPoint.y * scale
    );

    // Draw end point
    ctx.ctx.fillStyle = '#e74c3c';
    ctx.ctx.beginPath();
    ctx.ctx.arc(
      this.endPoint.x * scale,
      this.endPoint.y * scale,
      20 * scale,
      0,
      Math.PI * 2
    );
    ctx.ctx.fill();
    ctx.ctx.fillStyle = '#fff';
    ctx.ctx.fillText(
      '★',
      this.endPoint.x * scale,
      this.endPoint.y * scale
    );

    // Draw user's path
    if (this.path.length > 0) {
      ctx.ctx.strokeStyle = this.hitWall ? '#e74c3c' : colors.wood;
      ctx.ctx.lineWidth = 4 * scale;
      ctx.ctx.lineCap = 'round';
      ctx.ctx.lineJoin = 'round';

      ctx.ctx.beginPath();
      this.path.forEach((point, index) => {
        if (index === 0) {
          ctx.ctx.moveTo(point.x, point.y);
        } else {
          ctx.ctx.lineTo(point.x, point.y);
        }
      });
      ctx.ctx.stroke();
    }

    // Draw "Fertig" button
    const buttonWidth = 150 * scale;
    const buttonHeight = 50 * scale;
    this.doneButton = {
      x: width - buttonWidth - 20 * scale,
      y: height - buttonHeight - 20 * scale,
      w: buttonWidth,
      h: buttonHeight
    };

    this.drawRoundedRect(ctx, this.doneButton, {
      fillStyle: this.path.length > 10 ? '#4caf50' : '#ccc',
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
      if (this.isInside(event.x, event.y, this.doneButton) && this.path.length > 10) {
        const reachedEnd = this.checkReachedEnd();
        const correct = reachedEnd && !this.hitWall;

        return {
          correct,
          responseTime: this.getElapsedTime(),
          metadata: {
            reachedEnd,
            hitWall: this.hitWall,
            pathLength: this.path.length
          }
        };
      }

      // Start drawing path
      this.isDrawing = true;
      this.path = [{ x: event.x, y: event.y }];
      this.hitWall = false;
      return null;
    }

    if (event.type === 'move' && this.isDrawing) {
      const lastPoint = this.path[this.path.length - 1];
      const newPoint = { x: event.x, y: event.y };

      // Check if crossing a wall
      if (this.crossesWall(lastPoint, newPoint)) {
        this.hitWall = true;
      }

      this.path.push(newPoint);
      return null;
    }

    if (event.type === 'end') {
      this.isDrawing = false;
      return null;
    }

    return null;
  }

  /**
   * Check if line segment crosses any wall
   */
  private crossesWall(p1: Point, p2: Point): boolean {
    const ctx = this.getSavedContext();
    if (!ctx) return false;

    return this.walls.some(wall => {
      const w1 = { x: wall.x1 * ctx.scale, y: wall.y1 * ctx.scale };
      const w2 = { x: wall.x2 * ctx.scale, y: wall.y2 * ctx.scale };
      return this.lineSegmentsIntersect(p1, p2, w1, w2);
    });
  }

  /**
   * Check if two line segments intersect
   */
  private lineSegmentsIntersect(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point
  ): boolean {
    const ccw = (A: Point, B: Point, C: Point) => {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    };

    return (
      ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
      ccw(p1, p2, p3) !== ccw(p1, p2, p4)
    );
  }

  /**
   * Check if path reached the end point
   */
  private checkReachedEnd(): boolean {
    if (this.path.length === 0) return false;

    const ctx = this.getSavedContext();
    if (!ctx) return false;

    const lastPoint = this.path[this.path.length - 1];
    const endScaled = {
      x: this.endPoint.x * ctx.scale,
      y: this.endPoint.y * ctx.scale
    };

    const dist = Math.sqrt(
      Math.pow(lastPoint.x - endScaled.x, 2) +
      Math.pow(lastPoint.y - endScaled.y, 2)
    );

    return dist < 30 * ctx.scale; // Within 30 pixels of end
  }

  reset(): void {
    super.reset();
    this.path = [];
    this.isDrawing = false;
    this.hitWall = false;
  }
}
