/**
 * PrepositionExercise - Spatial relationships (prepositions)
 *
 * Child hears/sees a preposition (on, under, next to, etc.) and must select
 * the image that correctly shows that spatial relationship.
 * Example: "The cat is ON the box" → select image showing cat on top of box
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { icons } from '$lib/data/assets';

type Preposition = 'auf' | 'unter' | 'neben' | 'in';  // on, under, next to, in

interface SpatialScene {
  object: keyof typeof icons;  // the object (e.g., cat)
  container: keyof typeof icons;  // the reference (e.g., box)
  relation: Preposition;
}

export interface PrepositionConfig {
  type: 'preposition';
  targetRelation: Preposition;
  object: keyof typeof icons;
  container: keyof typeof icons;
  distractors: Preposition[];  // wrong spatial relationships to show
}

export class PrepositionExercise extends ExercisePlugin {
  private targetRelation!: Preposition;
  private object!: keyof typeof icons;
  private container!: keyof typeof icons;
  private scenes!: SpatialScene[];
  private correctIndex!: number;
  private boxes: Array<{ x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'preposition';
  }

  initialize(config: PrepositionConfig): void {
    super.initialize(config);
    this.targetRelation = config.targetRelation;
    this.object = config.object;
    this.container = config.container;

    // Create scenes: target + distractors
    const allRelations = [config.targetRelation, ...config.distractors];

    // Randomize positions
    const shuffled = [...allRelations].sort(() => Math.random() - 0.5);
    this.correctIndex = shuffled.indexOf(config.targetRelation);

    this.scenes = shuffled.map(relation => ({
      object: this.object,
      container: this.container,
      relation
    }));
  }

  getInstruction(): string {
    const prepositionText = {
      'auf': 'auf',
      'unter': 'unter',
      'neben': 'neben',
      'in': 'in'
    };

    return `Wo ist das ${this.object} ${prepositionText[this.targetRelation]} dem ${this.container}?`;
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${24 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';

    const prepositionText = {
      'auf': 'AUF',
      'unter': 'UNTER',
      'neben': 'NEBEN',
      'in': 'IN'
    };

    ctx.ctx.fillText(`Finde: ${prepositionText[this.targetRelation]}`, width / 2, height * 0.1);

    // Draw scene boxes (2-3 options in a row)
    const boxWidth = 200 * scale;
    const boxHeight = 200 * scale;
    const boxSpacing = 40 * scale;
    const totalWidth = this.scenes.length * boxWidth + (this.scenes.length - 1) * boxSpacing;
    const startX = (width - totalWidth) / 2;
    const boxY = height * 0.25;

    this.boxes = [];

    this.scenes.forEach((scene, index) => {
      const x = startX + index * (boxWidth + boxSpacing);
      this.boxes.push({ x, y: boxY, w: boxWidth, h: boxHeight });

      // Box background
      this.drawRoundedRect(ctx, { x, y: boxY, w: boxWidth, h: boxHeight }, {
        fillStyle: '#fff',
        strokeStyle: '#667eea',
        lineWidth: 3 * scale
      });

      // Draw spatial relationship
      this.drawSpatialScene(ctx, scene, x, boxY, boxWidth, boxHeight);
    });

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Draw a scene showing spatial relationship
   */
  private drawSpatialScene(
    ctx: RenderContext,
    scene: SpatialScene,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    const { scale } = ctx;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const objectSize = 40 * scale;
    const containerSize = 50 * scale;

    ctx.ctx.font = `${containerSize}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';

    ctx.ctx.font = `${objectSize}px Arial`;

    switch (scene.relation) {
      case 'auf':  // on top
        // Container at bottom
        ctx.ctx.font = `${containerSize}px Arial`;
        ctx.ctx.fillText(icons[scene.container], centerX, centerY + 25 * scale);
        // Object on top
        ctx.ctx.font = `${objectSize}px Arial`;
        ctx.ctx.fillText(icons[scene.object], centerX, centerY - 25 * scale);
        break;

      case 'unter':  // under
        // Container at top
        ctx.ctx.font = `${containerSize}px Arial`;
        ctx.ctx.fillText(icons[scene.container], centerX, centerY - 25 * scale);
        // Object under
        ctx.ctx.font = `${objectSize}px Arial`;
        ctx.ctx.fillText(icons[scene.object], centerX, centerY + 25 * scale);
        break;

      case 'neben':  // next to
        // Container on left
        ctx.ctx.font = `${containerSize}px Arial`;
        ctx.ctx.fillText(icons[scene.container], centerX - 35 * scale, centerY);
        // Object on right
        ctx.ctx.font = `${objectSize}px Arial`;
        ctx.ctx.fillText(icons[scene.object], centerX + 35 * scale, centerY);
        break;

      case 'in':  // inside (show container larger, object smaller in center)
        // Large container
        ctx.ctx.font = `${containerSize * 1.2}px Arial`;
        ctx.ctx.fillText(icons[scene.container], centerX, centerY);
        // Smaller object overlaid
        ctx.ctx.font = `${objectSize * 0.6}px Arial`;
        ctx.ctx.fillText(icons[scene.object], centerX, centerY);
        break;
    }
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    for (let i = 0; i < this.boxes.length; i++) {
      if (this.isInside(event.x, event.y, this.boxes[i])) {
        const correct = i === this.correctIndex;

        // If user already made an incorrect attempt, mark this as incorrect
        // even if they now clicked the right answer
        const finalCorrect = correct && !this.hasIncorrectAttempt;

        // Track if this was an incorrect attempt
        if (!correct) {
          this.hasIncorrectAttempt = true;
        }

        return {
          correct: finalCorrect,
          responseTime: this.getElapsedTime()
        };
      }
    }

    return null;
  }
}
