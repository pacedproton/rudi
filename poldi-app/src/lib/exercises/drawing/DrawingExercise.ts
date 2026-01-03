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

    // Draw accuracy progress bar
    this.drawProgressBar(ctx);

    // Draw control buttons
    this.drawButtons(ctx);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  private drawProgressBar(ctx: RenderContext): void {
    const { height, scale } = ctx;

    // Vertical progress bar dimensions - on left side
    const barWidth = 30 * scale;
    const barHeight = height * 0.5;
    const barX = 20 * scale;
    const barY = (height - barHeight) / 2;

    // Calculate current accuracy
    const accuracy = this.drawnPoints.length >= this.minPointsRequired
      ? this.calculateAccuracy()
      : 0;

    // Background
    ctx.ctx.fillStyle = '#e0e0e0';
    ctx.ctx.beginPath();
    ctx.ctx.roundRect(barX, barY, barWidth, barHeight, 10 * scale);
    ctx.ctx.fill();

    // Progress fill with color gradient based on accuracy (fills from bottom up)
    if (accuracy > 0) {
      const fillHeight = barHeight * accuracy;
      const fillY = barY + barHeight - fillHeight;
      // Color from red (0%) through yellow (50%) to green (100%)
      const hue = accuracy * 120; // 0 = red, 60 = yellow, 120 = green
      ctx.ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.ctx.beginPath();
      ctx.ctx.roundRect(barX, fillY, barWidth, fillHeight, 10 * scale);
      ctx.ctx.fill();
    }

    // Labels
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${12 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('100%', barX + barWidth / 2, barY - 8 * scale);
    ctx.ctx.fillText('0%', barX + barWidth / 2, barY + barHeight + 16 * scale);

    // Current accuracy percentage in center
    ctx.ctx.font = `bold ${14 * scale}px Arial`;
    const percentText = this.drawnPoints.length >= this.minPointsRequired
      ? `${Math.round(accuracy * 100)}%`
      : `${this.drawnPoints.length}/${this.minPointsRequired}`;
    ctx.ctx.fillText(percentText, barX + barWidth / 2, barY + barHeight / 2 + 5 * scale);
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

    const ctx = this.getRenderContext();
    const templatePoints = this.generateTemplatePoints(ctx);

    if (templatePoints.length === 0) return 0;

    // Calculate average minimum distance from each drawn point to the template
    let totalDistance = 0;
    for (const drawnPoint of this.drawnPoints) {
      let minDist = Infinity;
      for (const tp of templatePoints) {
        const dist = Math.hypot(drawnPoint.x - tp.x, drawnPoint.y - tp.y);
        if (dist < minDist) minDist = dist;
      }
      totalDistance += minDist;
    }

    const avgDistance = totalDistance / this.drawnPoints.length;
    // Normalize: 0 distance = 100%, >40px avg = 0%
    const maxAllowedDistance = 40 * ctx.scale;
    return Math.max(0, Math.min(1, 1 - avgDistance / maxAllowedDistance));
  }

  private generateTemplatePoints(ctx: RenderContext): Array<{ x: number; y: number }> {
    const config = this.config as DrawingConfig;
    const { width, height, scale } = ctx;
    const centerX = width / 2;
    const centerY = height / 2 + 20 * scale;
    const size = Math.min(width, height) * 0.4;
    const points: Array<{ x: number; y: number }> = [];
    const numPoints = 100; // Number of template points to generate

    switch (config.shape) {
      case 'circle':
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          points.push({
            x: centerX + Math.cos(angle) * (size / 2),
            y: centerY + Math.sin(angle) * (size / 2)
          });
        }
        break;

      case 'square':
        const halfSize = size / 2;
        const corners = [
          { x: centerX - halfSize, y: centerY - halfSize },
          { x: centerX + halfSize, y: centerY - halfSize },
          { x: centerX + halfSize, y: centerY + halfSize },
          { x: centerX - halfSize, y: centerY + halfSize }
        ];
        // Generate points along each edge
        for (let edge = 0; edge < 4; edge++) {
          const start = corners[edge];
          const end = corners[(edge + 1) % 4];
          for (let i = 0; i < numPoints / 4; i++) {
            const t = i / (numPoints / 4);
            points.push({
              x: start.x + (end.x - start.x) * t,
              y: start.y + (end.y - start.y) * t
            });
          }
        }
        break;

      case 'triangle':
        const triPoints = [
          { x: centerX, y: centerY - size / 2 },
          { x: centerX + size / 2, y: centerY + size / 2 },
          { x: centerX - size / 2, y: centerY + size / 2 }
        ];
        for (let edge = 0; edge < 3; edge++) {
          const start = triPoints[edge];
          const end = triPoints[(edge + 1) % 3];
          for (let i = 0; i < numPoints / 3; i++) {
            const t = i / (numPoints / 3);
            points.push({
              x: start.x + (end.x - start.x) * t,
              y: start.y + (end.y - start.y) * t
            });
          }
        }
        break;

      case 'star':
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          });
        }
        // Add intermediate points between vertices
        const starVertices = [...points];
        points.length = 0;
        for (let i = 0; i < starVertices.length; i++) {
          const start = starVertices[i];
          const end = starVertices[(i + 1) % starVertices.length];
          for (let j = 0; j < 10; j++) {
            const t = j / 10;
            points.push({
              x: start.x + (end.x - start.x) * t,
              y: start.y + (end.y - start.y) * t
            });
          }
        }
        break;

      case 'heart':
        // Approximate heart shape with parametric curve
        for (let i = 0; i < numPoints; i++) {
          const t = (i / numPoints) * Math.PI * 2;
          const heartSize = size / 2;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          points.push({
            x: centerX + (x / 16) * heartSize,
            y: centerY + (y / 16) * heartSize
          });
        }
        break;
    }

    return points;
  }

  cleanup(): void {
    super.cleanup();
    this.drawnPoints = [];
    this.isDrawing = false;
  }
}
