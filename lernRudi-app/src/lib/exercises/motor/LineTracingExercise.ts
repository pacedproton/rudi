/**
 * LineTracingExercise - Pre-writing skills: tracing lines
 *
 * Child practices drawing different types of lines:
 * - Horizontal, vertical, diagonal
 * - Wavy lines, zigzags
 * - Curves and spirals
 *
 * This builds fine motor control needed for writing
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { colors } from '$lib/data/colors';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';

export type LineType = 'horizontal' | 'vertical' | 'diagonal' | 'wavy' | 'zigzag' | 'curve' | 'spiral';

export interface LineTracingConfig {
  type: 'line_tracing';
  lineType: LineType;
}

interface Point {
  x: number;
  y: number;
}

export class LineTracingExercise extends ExercisePlugin {
  private lineType!: LineType;
  private guidePath: Point[] = [];
  private tracedPath: Point[] = [];
  private isDrawing = false;
  private doneButton = { x: 0, y: 0, w: 0, h: 0 };

  get type(): ExerciseType {
    return 'line_tracing' as ExerciseType;
  }

  initialize(config: LineTracingConfig): void {
    super.initialize(config);
    this.lineType = config.lineType;
    this.tracedPath = [];
    this.isDrawing = false;
    this.generateGuidePath();
  }

  getInstruction(): string {
    const instructions: Record<LineType, string> = {
      'horizontal': 'Ziehe eine waagerechte Linie!',
      'vertical': 'Ziehe eine senkrechte Linie!',
      'diagonal': 'Ziehe eine schräge Linie!',
      'wavy': 'Ziehe eine Wellenlinie!',
      'zigzag': 'Ziehe eine Zickzacklinie!',
      'curve': 'Ziehe eine geschwungene Linie!',
      'spiral': 'Ziehe eine Spirale!'
    };
    return instructions[this.lineType];
  }

  /**
   * Generate guide path based on line type
   */
  private generateGuidePath(): void {
    const width = 800;
    const height = 600;
    const centerY = height / 2;
    const startX = 100;
    const endX = width - 100;
    const length = endX - startX;

    this.guidePath = [];

    switch (this.lineType) {
      case 'horizontal':
        // Simple horizontal line
        this.guidePath = [
          { x: startX, y: centerY },
          { x: endX, y: centerY }
        ];
        break;

      case 'vertical':
        // Simple vertical line
        this.guidePath = [
          { x: width / 2, y: 150 },
          { x: width / 2, y: height - 150 }
        ];
        break;

      case 'diagonal':
        // Diagonal line (top-left to bottom-right)
        this.guidePath = [
          { x: startX, y: 150 },
          { x: endX, y: height - 150 }
        ];
        break;

      case 'wavy':
        // Wavy sine wave
        for (let i = 0; i <= 50; i++) {
          const t = i / 50;
          const x = startX + t * length;
          const y = centerY + Math.sin(t * Math.PI * 4) * 80;
          this.guidePath.push({ x, y });
        }
        break;

      case 'zigzag':
        // Zigzag pattern
        const zigzags = 5;
        for (let i = 0; i <= zigzags; i++) {
          const x = startX + (i / zigzags) * length;
          const y = centerY + (i % 2 === 0 ? -80 : 80);
          this.guidePath.push({ x, y });
        }
        break;

      case 'curve':
        // Smooth curve (quadratic bezier approximation)
        for (let i = 0; i <= 50; i++) {
          const t = i / 50;
          const x = startX + t * length;
          const y = centerY - Math.sin(t * Math.PI) * 150;
          this.guidePath.push({ x, y });
        }
        break;

      case 'spiral':
        // Spiral from center outward
        const turns = 3;
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const angle = t * Math.PI * 2 * turns;
          const radius = t * 120;
          const x = width / 2 + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          this.guidePath.push({ x, y });
        }
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
    ctx.ctx.fillText(this.getInstruction(), width / 2, 20 * scale);

    // Draw guide path (dashed line)
    ctx.ctx.strokeStyle = '#667eea';
    ctx.ctx.lineWidth = 6 * scale;
    ctx.ctx.lineCap = 'round';
    ctx.ctx.lineJoin = 'round';
    ctx.ctx.setLineDash([10 * scale, 10 * scale]);

    ctx.ctx.beginPath();
    this.guidePath.forEach((point, index) => {
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
    if (this.guidePath.length > 0) {
      const start = this.guidePath[0];
      ctx.ctx.fillStyle = '#4caf50';
      ctx.ctx.beginPath();
      ctx.ctx.arc(start.x * scale, start.y * scale, 15 * scale, 0, Math.PI * 2);
      ctx.ctx.fill();
    }

    // Draw end marker
    if (this.guidePath.length > 0) {
      const end = this.guidePath[this.guidePath.length - 1];
      ctx.ctx.fillStyle = '#e74c3c';
      ctx.ctx.beginPath();
      ctx.ctx.arc(end.x * scale, end.y * scale, 15 * scale, 0, Math.PI * 2);
      ctx.ctx.fill();
    }

    // Draw traced path
    if (this.tracedPath.length > 0) {
      ctx.ctx.strokeStyle = colors.wood;
      ctx.ctx.lineWidth = 5 * scale;
      ctx.ctx.lineCap = 'round';
      ctx.ctx.lineJoin = 'round';

      ctx.ctx.beginPath();
      this.tracedPath.forEach((point, index) => {
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
      fillStyle: this.tracedPath.length > 10 ? '#4caf50' : '#ccc',
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
      if (this.isInside(event.x, event.y, this.doneButton) && this.tracedPath.length > 10) {
        const accuracy = this.calculateAccuracy();
        if (accuracy <= 0.5) {
          audioEngine.playSound('wrong');
          speechEngine.speak('Versuche es noch einmal.');
          this.tracedPath = [];
          this.isDrawing = false;
          return null;
        }
        speechEngine.speak('Super gemacht!');
        return {
          correct: true,
          responseTime: this.getElapsedTime(),
          metadata: {
            accuracy,
            pointsTraced: this.tracedPath.length,
            lineType: this.lineType
          }
        };
      }

      // Start drawing
      this.isDrawing = true;
      this.tracedPath = [{ x: event.x, y: event.y }];
      return null;
    }

    if (event.type === 'move' && this.isDrawing) {
      this.tracedPath.push({ x: event.x, y: event.y });
      return null;
    }

    if (event.type === 'end') {
      this.isDrawing = false;
      return null;
    }

    return null;
  }

  /**
   * Calculate how accurately the user traced the guide path
   */
  private calculateAccuracy(): number {
    if (this.tracedPath.length === 0) return 0;

    const ctx = this.getSavedContext();
    if (!ctx) return 0;

    // Sample points along guide path and check if traced path is nearby
    let nearbyCount = 0;
    const sampleCount = Math.min(50, this.guidePath.length);
    const threshold = 50 * ctx.scale; // 50 pixels tolerance

    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.floor((i / sampleCount) * this.guidePath.length);
      const guidePoint = {
        x: this.guidePath[idx].x * ctx.scale,
        y: this.guidePath[idx].y * ctx.scale
      };

      // Check if any traced point is near this guide point
      const hasNearbyTrace = this.tracedPath.some(tp => {
        const dist = Math.sqrt(
          Math.pow(tp.x - guidePoint.x, 2) +
          Math.pow(tp.y - guidePoint.y, 2)
        );
        return dist < threshold;
      });

      if (hasNearbyTrace) nearbyCount++;
    }

    return nearbyCount / sampleCount;
  }

  reset(): void {
    super.reset();
    this.tracedPath = [];
    this.isDrawing = false;
  }
}
