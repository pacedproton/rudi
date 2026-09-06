import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';

export interface DrawingConfig {
  type: 'drawing';
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  instruction: string;
}

/**
 * Drawing Exercise - Tablet/stylus optimized
 * Children draw shapes with their finger or stylus
 */
export class DrawingExercise extends ExercisePlugin {
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private drawnPoints: Array<{ x: number; y: number }> = [];
  private minPointsRequired = 20;
  private matchThreshold = 0.6; // 60% accuracy required

  get type(): ExerciseType {
    return 'drawing';
  }

  getInstruction(): string {
    return (this.config as DrawingConfig).instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);

    const config = this.config as DrawingConfig;
    const { width, height, scale } = ctx;

    // Clear canvas
    ctx.ctx.clearRect(0, 0, width, height);

    // Draw instruction
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${32 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText(config.instruction, width / 2, 60 * scale);

    // Draw template outline (dashed)
    this.drawTemplate(ctx, true);

    // Draw user's drawing
    if (this.drawnPoints.length > 0) {
      ctx.ctx.strokeStyle = '#667eea';
      ctx.ctx.lineWidth = 8 * scale;
      ctx.ctx.lineCap = 'round';
      ctx.ctx.lineJoin = 'round';

      ctx.ctx.beginPath();
      ctx.ctx.moveTo(this.drawnPoints[0].x, this.drawnPoints[0].y);
      for (let i = 1; i < this.drawnPoints.length; i++) {
        ctx.ctx.lineTo(this.drawnPoints[i].x, this.drawnPoints[i].y);
      }
      ctx.ctx.stroke();
    }

    // Draw control buttons
    this.drawButtons(ctx);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  private drawTemplate(ctx: RenderContext, dashed: boolean): void {
    const config = this.config as DrawingConfig;
    const { width, height, scale } = ctx;
    const centerX = width / 2;
    const centerY = height / 2 + 20 * scale;
    const size = Math.min(width, height) * 0.4;

    if (dashed) {
      ctx.ctx.setLineDash([10 * scale, 10 * scale]);
      ctx.ctx.strokeStyle = '#ccc';
      ctx.ctx.lineWidth = 3 * scale;
    } else {
      ctx.ctx.setLineDash([]);
      ctx.ctx.strokeStyle = '#333';
      ctx.ctx.lineWidth = 2 * scale;
    }

    ctx.ctx.beginPath();

    switch (config.shape) {
      case 'circle':
        ctx.ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        break;

      case 'square':
        ctx.ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
        break;

      case 'triangle':
        ctx.ctx.moveTo(centerX, centerY - size / 2);
        ctx.ctx.lineTo(centerX + size / 2, centerY + size / 2);
        ctx.ctx.lineTo(centerX - size / 2, centerY + size / 2);
        ctx.ctx.closePath();
        break;

      case 'star':
        this.drawStar(ctx, centerX, centerY, 5, size / 2, size / 4);
        break;

      case 'heart':
        this.drawHeart(ctx, centerX, centerY, size / 2);
        break;
    }

    ctx.ctx.stroke();
    ctx.ctx.setLineDash([]);
  }

  private drawStar(
    ctx: RenderContext,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.ctx.closePath();
  }

  private drawHeart(ctx: RenderContext, cx: number, cy: number, size: number): void {
    ctx.ctx.moveTo(cx, cy + size / 4);
    ctx.ctx.bezierCurveTo(cx, cy, cx - size / 2, cy - size / 2, cx - size / 2, cy - size / 4);
    ctx.ctx.bezierCurveTo(cx - size / 2, cy, cx, cy + size / 2, cx, cy + size);
    ctx.ctx.bezierCurveTo(cx, cy + size / 2, cx + size / 2, cy, cx + size / 2, cy - size / 4);
    ctx.ctx.bezierCurveTo(cx + size / 2, cy - size / 2, cx, cy, cx, cy + size / 4);
  }

  private drawButtons(ctx: RenderContext): void {
    const { width, height, scale } = ctx;

    // Clear button
    ctx.ctx.fillStyle = '#ff9800';
    ctx.ctx.fillRect(width - 120 * scale, height - 80 * scale, 100 * scale, 60 * scale);
    ctx.ctx.fillStyle = 'white';
    ctx.ctx.font = `bold ${18 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('Löschen', width - 70 * scale, height - 45 * scale);

    // Check button if enough points drawn
    if (this.drawnPoints.length >= this.minPointsRequired) {
      ctx.ctx.fillStyle = '#4caf50';
      ctx.ctx.fillRect(20 * scale, height - 80 * scale, 100 * scale, 60 * scale);
      ctx.ctx.fillStyle = 'white';
      ctx.ctx.fillText('Fertig', 70 * scale, height - 45 * scale);
    }
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    const { x, y, type } = event;

    const ctx = this.getRenderContext();
    const { width, height, scale } = ctx;

    if (type === 'end') {
      // Check clear button
      if (
        x >= width - 120 * scale &&
        x <= width - 20 * scale &&
        y >= height - 80 * scale &&
        y <= height - 20 * scale
      ) {
        this.drawnPoints = [];
        audioEngine.playSound('pop');
        return null;
      }

      // Check finish button
      if (
        this.drawnPoints.length >= this.minPointsRequired &&
        x >= 20 * scale &&
        x <= 120 * scale &&
        y >= height - 80 * scale &&
        y <= height - 20 * scale
      ) {
        return this.checkDrawing();
      }

      this.isDrawing = false;
      return null;
    }

    if (type === 'start') {
      // Ignore if clicking buttons
      if (
        (x >= width - 120 * scale && x <= width - 20 * scale && y >= height - 80 * scale && y <= height - 20 * scale) ||
        (x >= 20 * scale && x <= 120 * scale && y >= height - 80 * scale && y <= height - 20 * scale)
      ) {
        return null;
      }

      this.isDrawing = true;
      this.lastX = x;
      this.lastY = y;
      this.drawnPoints.push({ x, y });
      return null;
    }

    if (type === 'move' && this.isDrawing) {
      // Add point if moved enough distance (smoother lines)
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 3 * scale) {
        this.drawnPoints.push({ x, y });
        this.lastX = x;
        this.lastY = y;
      }
    }

    return null;
  }

  private checkDrawing(): ExerciseResult {
    const accuracy = this.calculateAccuracy();
    const correct = accuracy >= this.matchThreshold;

    if (correct) {
      audioEngine.playSound('success');
      speechEngine.speak('Super gemacht!');
    } else {
      audioEngine.playSound('wrong');
      speechEngine.speak('Versuche es noch einmal.');
      this.drawnPoints = [];
    }

    return {
      correct,
      responseTime: Date.now() - this.startTime,
      metadata: { accuracy, pointsDrawn: this.drawnPoints.length }
    };
  }

  private calculateAccuracy(): number {
    if (this.drawnPoints.length < this.minPointsRequired) return 0;

    // Simple heuristic: if they drew enough points, consider it good
    // A better implementation would use shape recognition algorithms
    if (this.drawnPoints.length >= this.minPointsRequired * 2) {
      return 0.8; // Good coverage
    } else if (this.drawnPoints.length >= this.minPointsRequired) {
      return 0.65; // Acceptable coverage
    }

    return 0.5;
  }

  cleanup(): void {
    super.cleanup();
    this.drawnPoints = [];
    this.isDrawing = false;
  }
}
