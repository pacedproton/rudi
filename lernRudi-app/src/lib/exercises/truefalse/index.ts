/**
 * TrueFalse Exercise Plugin
 * Renders yes/no questions with spoken text and clickable buttons
 */
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, IExercisePlugin, ExerciseState, SpeechRequest, ExerciseConfig } from '$lib/exercises/base/types';
import { ExerciseRegistry } from '$lib/exercises/base/ExerciseRegistry';

interface TrueFalseConfig extends ExerciseConfig {
  type: 'truefalse';
  question: string;
  answer: boolean;
  explanation?: string;
  image?: string;
}

interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: boolean;
  color: string;
  hoverColor: string;
}

export class TrueFalseExercise implements IExercisePlugin {
  readonly type = 'truefalse' as const;
  readonly config: TrueFalseConfig;

  private state: ExerciseState;
  private buttons: Button[] = [];
  private answered = false;
  private userAnswer: boolean | null = null;
  private showExplanation = false;
  private startTime = 0; // Track when exercise started to prevent auto-skip

  repeatRequested = false;

  constructor(config: TrueFalseConfig) {
    this.config = config;
    this.state = { started: false, completed: false, locked: false };
  }

  initialize(config: ExerciseConfig): void {
    this.answered = false;
    this.userAnswer = null;
    this.showExplanation = false;
    this.state.started = true;
    this.startTime = Date.now(); // Record start time
  }

  onStart(): SpeechRequest[] {
    return [
      { text: this.config.question }
    ];
  }

  onComplete(result: ExerciseResult): void {
    this.state.completed = true;
  }

  cleanup(): void {
    this.buttons = [];
  }

  render(ctx: RenderContext): void {
    const { ctx: c, width, height, scale } = ctx;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    c.fillStyle = '#f8f9ff';
    c.fillRect(0, 0, width, height);

    // Draw question card
    const cardWidth = Math.min(500, width - 40) * scale;
    const cardHeight = 320 * scale;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2 - 50 * scale;

    // Card shadow
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.beginPath();
    c.roundRect(cardX + 5, cardY + 5, cardWidth, cardHeight, 20 * scale);
    c.fill();

    // Card background
    c.fillStyle = 'white';
    c.beginPath();
    c.roundRect(cardX, cardY, cardWidth, cardHeight, 20 * scale);
    c.fill();

    // Draw image/emoji if available - at the top of the card
    let yOffset = cardY + 40 * scale;
    if (this.config.image) {
      const emoji = this.getEmojiForImage(this.config.image);
      c.font = `${60 * scale}px Arial`;
      c.textAlign = 'center';
      c.fillText(emoji, centerX, yOffset + 40 * scale);
      yOffset += 80 * scale;
    }

    // Question text (wrapped) - main content
    c.font = `bold ${22 * scale}px Nunito, Arial`;
    c.fillStyle = '#333';
    c.textAlign = 'center';
    yOffset += 20 * scale;
    this.wrapText(c, this.config.question, centerX, yOffset, cardWidth - 60 * scale, 30 * scale);

    // Speaker icon - small, in corner of card
    c.font = `${20 * scale}px Arial`;
    c.fillText('🔊', cardX + 30 * scale, cardY + 30 * scale);

    if (!this.answered) {
      // Draw answer buttons
      const btnWidth = 160 * scale;
      const btnHeight = 55 * scale;
      const btnY = cardY + cardHeight + 25 * scale;
      const gap = 30 * scale;

      this.buttons = [
        {
          x: centerX - btnWidth - gap / 2,
          y: btnY,
          width: btnWidth,
          height: btnHeight,
          label: '✅ Ja, stimmt!',
          value: true,
          color: '#4caf50',
          hoverColor: '#2e7d32'
        },
        {
          x: centerX + gap / 2,
          y: btnY,
          width: btnWidth,
          height: btnHeight,
          label: '❌ Nein!',
          value: false,
          color: '#f44336',
          hoverColor: '#c62828'
        }
      ];

      for (const btn of this.buttons) {
        // Button shadow
        c.fillStyle = 'rgba(0, 0, 0, 0.2)';
        c.beginPath();
        c.roundRect(btn.x + 3, btn.y + 3, btn.width, btn.height, 15 * scale);
        c.fill();

        // Button background
        c.fillStyle = btn.color;
        c.beginPath();
        c.roundRect(btn.x, btn.y, btn.width, btn.height, 15 * scale);
        c.fill();

        // Button text
        c.font = `bold ${18 * scale}px Nunito, Arial`;
        c.fillStyle = 'white';
        c.textAlign = 'center';
        c.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2 + 6 * scale);
      }
    } else {
      // Show result
      const isCorrect = this.userAnswer === this.config.answer;
      const resultY = cardY + cardHeight + 30 * scale;

      // Result box
      c.fillStyle = isCorrect ? '#e8f5e9' : '#ffebee';
      c.strokeStyle = isCorrect ? '#4caf50' : '#f44336';
      c.lineWidth = 3 * scale;
      c.beginPath();
      c.roundRect(centerX - 150 * scale, resultY, 300 * scale, 60 * scale, 15 * scale);
      c.fill();
      c.stroke();

      // Result text
      c.font = `bold ${24 * scale}px Nunito, Arial`;
      c.fillStyle = '#333';
      c.textAlign = 'center';
      const resultEmoji = isCorrect ? '🎉' : '🤔';
      const resultText = isCorrect ? 'Richtig!' : 'Nicht ganz...';
      c.fillText(`${resultEmoji} ${resultText}`, centerX, resultY + 38 * scale);

      // Explanation
      if (this.config.explanation) {
        const expY = resultY + 80 * scale;
        c.fillStyle = '#fff8e1';
        c.strokeStyle = '#ffc107';
        c.lineWidth = 2 * scale;
        c.beginPath();
        c.roundRect(centerX - 200 * scale, expY, 400 * scale, 80 * scale, 12 * scale);
        c.fill();
        c.stroke();

        c.font = `${16 * scale}px Nunito, Arial`;
        c.fillStyle = '#555';
        c.textAlign = 'center';
        c.fillText('💡', centerX, expY + 25 * scale);
        this.wrapText(c, this.config.explanation, centerX, expY + 50 * scale, 380 * scale, 20 * scale);
      }
    }
  }

  private wrapText(c: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = c.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        c.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    c.fillText(line.trim(), x, currentY);
  }

  private getEmojiForImage(image: string): string {
    const emojiMap: Record<string, string> = {
      'parrot': '🦜',
      'wolf': '🐺',
      'fish': '🐟',
      'penguin': '🐧',
      'deer': '🦌',
      'lion': '🦁',
      'squirrel': '🐿️',
      'crocodile': '🐊',
      'stork': '🦩',
      'kangaroo': '🦘',
      'hedgehog': '🦔',
      'elephant': '🐘',
      'unicorn': '🦄',
      'bee': '🐝',
      'dragon': '🐉',
      'fox': '🦊'
    };
    return emojiMap[image] || '🌍';
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (this.answered || event.type !== 'start') return null;

    // Prevent auto-skip: require at least 500ms before accepting input
    const timeSinceStart = Date.now() - this.startTime;
    if (timeSinceStart < 500) return null;

    // Check button clicks
    for (const btn of this.buttons) {
      if (event.x >= btn.x && event.x <= btn.x + btn.width &&
        event.y >= btn.y && event.y <= btn.y + btn.height) {
        this.answered = true;
        this.userAnswer = btn.value;
        this.showExplanation = true;

        const isCorrect = this.userAnswer === this.config.answer;

        return {
          correct: isCorrect,
          metadata: {
            userAnswer: this.userAnswer,
            correctAnswer: this.config.answer,
            question: this.config.question
          }
        };
      }
    }

    return null;
  }

  getState(): ExerciseState {
    return this.state;
  }

  setState(state: Partial<ExerciseState>): void {
    Object.assign(this.state, state);
  }

  reset(): void {
    this.answered = false;
    this.userAnswer = null;
    this.showExplanation = false;
    this.state = { started: false, completed: false, locked: false };
  }
}

// Register the exercise
ExerciseRegistry.register('truefalse', TrueFalseExercise);

export default TrueFalseExercise;
