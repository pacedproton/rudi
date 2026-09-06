import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { scoreStrokes } from '../writing/scoreStrokes';
import { GRAFOMOTOR_SCORE_OPTIONS, sampleLetterStrokes } from './sampleShapePath';

export interface HandwritingConfig {
  type: 'handwriting';
  character: string; // Letter or number to practice
  instruction: string;
}

/**
 * Handwriting Practice Exercise - Tablet/stylus optimized
 * Children practice writing letters and numbers
 */
export class HandwritingExercise extends ExercisePlugin {
  private isDrawing = false;
  private strokes: Array<Array<{ x: number; y: number; time: number }>> = [];
  private currentStroke: Array<{ x: number; y: number; time: number }> = [];
  private guideAlpha = 0.3;

  get type(): ExerciseType {
    return 'handwriting';
  }

  getInstruction(): string {
    return (this.config as HandwritingConfig).instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);

    const config = this.config as HandwritingConfig;
    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${28 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText(config.instruction, width / 2, 60 * scale);

    // Draw practice lines (like lined paper)
    this.drawPracticeLines(ctx);

    // Draw guide character (faded)
    ctx.ctx.save();
    ctx.ctx.globalAlpha = this.guideAlpha;
    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.font = `bold ${300 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(config.character, width / 2, height / 2);
    ctx.ctx.restore();

    // Draw user's strokes
    ctx.ctx.strokeStyle = '#333';
    ctx.ctx.lineWidth = 8 * scale;
    ctx.ctx.lineCap = 'round';
    ctx.ctx.lineJoin = 'round';

    for (const stroke of this.strokes) {
      if (stroke.length < 2) continue;

      ctx.ctx.beginPath();
      ctx.ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.ctx.stroke();
    }

    // Draw current stroke
    if (this.currentStroke.length > 1) {
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(this.currentStroke[0].x, this.currentStroke[0].y);
      for (let i = 1; i < this.currentStroke.length; i++) {
        ctx.ctx.lineTo(this.currentStroke[i].x, this.currentStroke[i].y);
      }
      ctx.ctx.stroke();
    }

    // Draw control buttons
    this.drawControls(ctx);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  private drawPracticeLines(ctx: RenderContext): void {
    const { width, height, scale } = ctx;
    const centerY = height / 2;
    const lineSpacing = 100 * scale;

    ctx.ctx.strokeStyle = '#ddd';
    ctx.ctx.lineWidth = 1 * scale;
    ctx.ctx.setLineDash([5 * scale, 5 * scale]);

    // Top line
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(50 * scale, centerY - lineSpacing);
    ctx.ctx.lineTo(width - 50 * scale, centerY - lineSpacing);
    ctx.ctx.stroke();

    // Middle line (baseline)
    ctx.ctx.strokeStyle = '#999';
    ctx.ctx.lineWidth = 2 * scale;
    ctx.ctx.setLineDash([]);
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(50 * scale, centerY);
    ctx.ctx.lineTo(width - 50 * scale, centerY);
    ctx.ctx.stroke();

    // Bottom line
    ctx.ctx.strokeStyle = '#ddd';
    ctx.ctx.lineWidth = 1 * scale;
    ctx.ctx.setLineDash([5 * scale, 5 * scale]);
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(50 * scale, centerY + lineSpacing);
    ctx.ctx.lineTo(width - 50 * scale, centerY + lineSpacing);
    ctx.ctx.stroke();

    ctx.ctx.setLineDash([]);
  }

  private drawControls(ctx: RenderContext): void {
    const { width, height, scale } = ctx;

    // Clear button
    ctx.ctx.fillStyle = '#ff9800';
    ctx.ctx.fillRect(width - 140 * scale, height - 80 * scale, 120 * scale, 60 * scale);
    ctx.ctx.fillStyle = 'white';
    ctx.ctx.font = `bold ${18 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('Löschen', width - 80 * scale, height - 45 * scale);

    // Hide guide button
    ctx.ctx.fillStyle = this.guideAlpha > 0 ? '#9c27b0' : '#4caf50';
    ctx.ctx.fillRect(width - 280 * scale, height - 80 * scale, 120 * scale, 60 * scale);
    ctx.ctx.fillStyle = 'white';
    ctx.ctx.fillText(
      this.guideAlpha > 0 ? 'Hilfe aus' : 'Hilfe an',
      width - 220 * scale,
      height - 45 * scale
    );

    // Done button
    if (this.strokes.length > 0) {
      ctx.ctx.fillStyle = '#4caf50';
      ctx.ctx.fillRect(20 * scale, height - 80 * scale, 120 * scale, 60 * scale);
      ctx.ctx.fillStyle = 'white';
      ctx.ctx.fillText('Fertig', 80 * scale, height - 45 * scale);
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
        x >= width - 140 * scale &&
        x <= width - 20 * scale &&
        y >= height - 80 * scale &&
        y <= height - 20 * scale
      ) {
        this.strokes = [];
        this.currentStroke = [];
        audioEngine.playSound('pop');
        return null;
      }

      // Check hide guide button
      if (
        x >= width - 280 * scale &&
        x <= width - 160 * scale &&
        y >= height - 80 * scale &&
        y <= height - 20 * scale
      ) {
        this.guideAlpha = this.guideAlpha > 0 ? 0 : 0.3;
        audioEngine.playSound('pop');
        return null;
      }

      // Check done button
      if (
        this.strokes.length > 0 &&
        x >= 20 * scale &&
        x <= 140 * scale &&
        y >= height - 80 * scale &&
        y <= height - 20 * scale
      ) {
        return this.finishExercise();
      }

      // End stroke
      if (this.isDrawing && this.currentStroke.length > 1) {
        this.strokes.push([...this.currentStroke]);
        this.currentStroke = [];
      }
      this.isDrawing = false;
      return null;
    }

    if (type === 'start') {
      // Ignore if clicking buttons
      if (
        (x >= width - 140 * scale && x <= width - 20 * scale && y >= height - 80 * scale && y <= height - 20 * scale) ||
        (x >= width - 280 * scale && x <= width - 160 * scale && y >= height - 80 * scale && y <= height - 20 * scale) ||
        (x >= 20 * scale && x <= 140 * scale && y >= height - 80 * scale && y <= height - 20 * scale)
      ) {
        return null;
      }

      this.isDrawing = true;
      this.currentStroke = [{ x, y, time: Date.now() }];
      return null;
    }

    if (type === 'move' && this.isDrawing) {
      this.currentStroke.push({ x, y, time: Date.now() });
    }

    return null;
  }

  private finishExercise(): ExerciseResult | null {
    const config = this.config as HandwritingConfig;
    const ctx = this.getRenderContext();
    const expected = sampleLetterStrokes(config.character, ctx.width, ctx.height, ctx.scale);
    const user = this.strokes.map((stroke) => stroke.map(({ x, y }) => ({ x, y })));
    const score = scoreStrokes(user, expected, {
      ...GRAFOMOTOR_SCORE_OPTIONS,
      hitRadius: GRAFOMOTOR_SCORE_OPTIONS.hitRadius * ctx.scale
    });

    if (!score.passed) {
      audioEngine.playSound('wrong');
      speechEngine.speak('Versuch es noch einmal.');
      this.strokes = [];
      this.currentStroke = [];
      return null;
    }

    speechEngine.speak('Gut gemacht!');
    return {
      correct: true,
      responseTime: Date.now() - this.startTime,
      metadata: { strokes: this.strokes.length, character: config.character, accuracy: score.overall }
    };
  }

  cleanup(): void {
    super.cleanup();
    this.strokes = [];
    this.currentStroke = [];
    this.isDrawing = false;
  }
}
