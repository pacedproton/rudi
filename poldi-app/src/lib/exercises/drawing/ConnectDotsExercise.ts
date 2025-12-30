import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';

export interface ConnectDotsConfig {
  type: 'connect_dots';
  dots: Array<{ x: number; y: number; number: number }>;
  shape: string; // Description of what shape it forms
  instruction: string;
}

/**
 * Connect the Dots Exercise - Tablet/stylus optimized
 * Children connect numbered dots in sequence
 */
export class ConnectDotsExercise extends ExercisePlugin {
  private connectedDots: number[] = [];
  private currentDot: number = 1;
  private lines: Array<{ from: number; to: number }> = [];

  get type(): ExerciseType {
    return 'connect_dots';
  }

  getInstruction(): string {
    return (this.config as ConnectDotsConfig).instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);

    const config = this.config as ConnectDotsConfig;
    const { width, height, scale } = ctx;

    // Clear canvas
    ctx.ctx.clearRect(0, 0, width, height);

    // Draw instruction
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${28 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText(config.instruction, width / 2, 50 * scale);

    // Draw connected lines
    ctx.ctx.strokeStyle = '#667eea';
    ctx.ctx.lineWidth = 4 * scale;
    ctx.ctx.lineCap = 'round';

    for (const line of this.lines) {
      const fromDot = config.dots.find((d) => d.number === line.from);
      const toDot = config.dots.find((d) => d.number === line.to);

      if (fromDot && toDot) {
        ctx.ctx.beginPath();
        ctx.ctx.moveTo(fromDot.x * scale, fromDot.y * scale);
        ctx.ctx.lineTo(toDot.x * scale, toDot.y * scale);
        ctx.ctx.stroke();
      }
    }

    // Draw dots
    for (const dot of config.dots) {
      const isNext = dot.number === this.currentDot;
      const isPast = dot.number < this.currentDot;

      // Dot circle
      ctx.ctx.beginPath();
      ctx.ctx.arc(dot.x * scale, dot.y * scale, 25 * scale, 0, Math.PI * 2);

      if (isNext) {
        ctx.ctx.fillStyle = '#4caf50'; // Next dot - green
        ctx.ctx.fill();
      } else if (isPast) {
        ctx.ctx.fillStyle = '#667eea'; // Connected - blue
        ctx.ctx.fill();
      } else {
        ctx.ctx.fillStyle = 'white';
        ctx.ctx.fill();
        ctx.ctx.strokeStyle = '#999';
        ctx.ctx.lineWidth = 2 * scale;
        ctx.ctx.stroke();
      }

      // Dot number
      ctx.ctx.fillStyle = isNext || isPast ? 'white' : '#333';
      ctx.ctx.font = `bold ${20 * scale}px Arial`;
      ctx.ctx.textAlign = 'center';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(dot.number.toString(), dot.x * scale, dot.y * scale);
    }

    // Progress indicator
    const totalDots = config.dots.length;
    const progress = ((this.currentDot - 1) / totalDots) * 100;

    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `${18 * scale}px Arial`;
    ctx.ctx.textAlign = 'left';
    ctx.ctx.fillText(`Punkt ${this.currentDot} von ${totalDots}`, 20 * scale, height - 30 * scale);

    // Progress bar
    ctx.ctx.fillStyle = '#e0e0e0';
    ctx.ctx.fillRect(20 * scale, height - 60 * scale, width - 40 * scale, 20 * scale);
    ctx.ctx.fillStyle = '#4caf50';
    ctx.ctx.fillRect(20 * scale, height - 60 * scale, ((width - 40 * scale) * progress) / 100, 20 * scale);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    const { x, y, type } = event;
    if (type !== 'end') return null;

    const config = this.config as ConnectDotsConfig;
    const ctx = this.getRenderContext();
    const { scale } = ctx;

    // Find clicked dot
    const clickedDot = config.dots.find((dot) => {
      const distance = Math.sqrt(
        Math.pow(x - dot.x * scale, 2) + Math.pow(y - dot.y * scale, 2)
      );
      return distance <= 25 * scale;
    });

    if (!clickedDot) return null;

    // Check if it's the correct next dot
    if (clickedDot.number === this.currentDot) {
      audioEngine.playSound('success');

      // Add to connected dots
      this.connectedDots.push(clickedDot.number);

      // Add line if not the first dot
      if (this.currentDot > 1) {
        this.lines.push({
          from: this.currentDot - 1,
          to: this.currentDot
        });
      }

      // Move to next dot
      this.currentDot++;

      // Speak the next number
      if (this.currentDot <= config.dots.length) {
        speechEngine.speak(this.currentDot.toString());
        return null;
      } else {
        // All dots connected!
        speechEngine.speak(`Super! Du hast ein ${config.shape} gezeichnet!`);
        return {
          correct: true,
          responseTime: Date.now() - this.startTime,
          metadata: { dotsConnected: this.connectedDots.length }
        };
      }
    } else {
      // Wrong dot clicked
      audioEngine.playSound('wrong');

      if (clickedDot.number < this.currentDot) {
        speechEngine.speak('Das hast du schon verbunden.');
      } else {
        speechEngine.speak(`Suche Punkt ${this.currentDot}.`);
      }
    }

    return null;
  }

  cleanup(): void {
    super.cleanup();
    this.connectedDots = [];
    this.currentDot = 1;
    this.lines = [];
  }
}

/**
 * Helper function to generate preset dot patterns
 */
export function generateDotPattern(
  pattern: 'star' | 'house' | 'tree' | 'heart' | 'flower',
  width: number,
  height: number
): Array<{ x: number; y: number; number: number }> {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.35;

  switch (pattern) {
    case 'star':
      return [
        { x: cx, y: cy - size, number: 1 },
        { x: cx + size * 0.3, y: cy - size * 0.3, number: 2 },
        { x: cx + size, y: cy - size * 0.3, number: 3 },
        { x: cx + size * 0.4, y: cy + size * 0.1, number: 4 },
        { x: cx + size * 0.6, y: cy + size, number: 5 },
        { x: cx, y: cy + size * 0.4, number: 6 },
        { x: cx - size * 0.6, y: cy + size, number: 7 },
        { x: cx - size * 0.4, y: cy + size * 0.1, number: 8 },
        { x: cx - size, y: cy - size * 0.3, number: 9 },
        { x: cx - size * 0.3, y: cy - size * 0.3, number: 10 }
      ];

    case 'house':
      return [
        { x: cx - size, y: cy, number: 1 },
        { x: cx - size, y: cy - size * 0.5, number: 2 },
        { x: cx, y: cy - size, number: 3 },
        { x: cx + size, y: cy - size * 0.5, number: 4 },
        { x: cx + size, y: cy, number: 5 },
        { x: cx + size, y: cy + size, number: 6 },
        { x: cx - size, y: cy + size, number: 7 },
        { x: cx - size, y: cy, number: 8 }
      ];

    case 'tree':
      return [
        { x: cx, y: cy - size, number: 1 },
        { x: cx - size * 0.6, y: cy - size * 0.5, number: 2 },
        { x: cx - size * 0.3, y: cy - size * 0.5, number: 3 },
        { x: cx - size * 0.8, y: cy, number: 4 },
        { x: cx - size * 0.3, y: cy, number: 5 },
        { x: cx - size * 0.3, y: cy + size, number: 6 },
        { x: cx + size * 0.3, y: cy + size, number: 7 },
        { x: cx + size * 0.3, y: cy, number: 8 },
        { x: cx + size * 0.8, y: cy, number: 9 },
        { x: cx + size * 0.3, y: cy - size * 0.5, number: 10 },
        { x: cx + size * 0.6, y: cy - size * 0.5, number: 11 },
        { x: cx, y: cy - size, number: 12 }
      ];

    case 'heart':
      const points: Array<{ x: number; y: number; number: number }> = [];
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const hx = cx + size * (16 * Math.pow(Math.sin(t), 3)) / 16;
        const hy =
          cy -
          size *
            (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) /
            16;
        points.push({ x: hx, y: hy, number: i + 1 });
      }
      return points;

    case 'flower':
      return [
        { x: cx, y: cy - size, number: 1 },
        { x: cx + size * 0.7, y: cy - size * 0.7, number: 2 },
        { x: cx + size, y: cy, number: 3 },
        { x: cx + size * 0.7, y: cy + size * 0.7, number: 4 },
        { x: cx, y: cy + size, number: 5 },
        { x: cx - size * 0.7, y: cy + size * 0.7, number: 6 },
        { x: cx - size, y: cy, number: 7 },
        { x: cx - size * 0.7, y: cy - size * 0.7, number: 8 },
        { x: cx, y: cy - size, number: 9 }
      ];

    default:
      return [];
  }
}
