/**
 * Storytelling Exercise - Record and score children's stories
 * 
 * Uses OpenAI Whisper for speech-to-text and GPT for story evaluation
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import { ExerciseRegistry } from '../base/ExerciseRegistry';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { openAIService, type StoryScore } from '$lib/services/OpenAIService';

export interface StorytellingConfig {
  type: 'storytelling';
  prompt: string;           // Visual prompt description
  cues: string[];           // Enumeration cues like "Erst...", "Dann...", etc.
  minDuration: number;      // Minimum recording seconds
  maxDuration: number;      // Maximum recording seconds
  image?: string;           // Optional image path or emoji
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'scored';

/**
 * Storytelling Exercise - Children record stories about picture prompts
 */
export class StorytellingExercise extends ExercisePlugin {
  private recordingState: RecordingState = 'idle';
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime = 0;
  private recordingDuration = 0;
  private score: StoryScore | null = null;

  // Button rectangles for click detection
  private recordButton = { x: 0, y: 0, w: 0, h: 0 };
  private submitButton = { x: 0, y: 0, w: 0, h: 0 };

  get type(): ExerciseType {
    return 'storytelling';
  }

  getInstruction(): string {
    const config = this.config as StorytellingConfig;
    return `Erzähl mir eine Geschichte über: ${config.prompt}`;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);
    const config = this.config as StorytellingConfig;
    const { width, height, scale } = ctx;

    // Clear canvas
    ctx.ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.ctx.fillStyle = '#f5f5f5';
    ctx.ctx.fillRect(0, 0, width, height);

    // Draw title
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${28 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('Erzähl eine Geschichte!', width / 2, 50 * scale);

    // Draw image/emoji prompt
    ctx.ctx.font = `${80 * scale}px Arial`;
    ctx.ctx.fillText(config.image || '📖', width / 2, 150 * scale);

    // Draw prompt
    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.fillStyle = '#555';
    ctx.ctx.fillText(config.prompt, width / 2, 200 * scale);

    // Draw enumeration cues
    this.drawCues(ctx, config.cues);

    // Draw appropriate UI based on state
    switch (this.recordingState) {
      case 'idle':
        this.drawRecordButton(ctx);
        break;
      case 'recording':
        this.drawRecordingUI(ctx);
        break;
      case 'processing':
        this.drawProcessingUI(ctx);
        break;
      case 'scored':
        this.drawScoreUI(ctx);
        break;
    }

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  private drawCues(ctx: RenderContext, cues: string[]): void {
    const { width, height, scale } = ctx;
    const startY = 260 * scale;
    const lineHeight = 35 * scale;

    ctx.ctx.font = `${18 * scale}px Arial`;
    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.textAlign = 'left';

    const boxWidth = 300 * scale;
    const boxX = (width - boxWidth) / 2;

    // Draw cue box
    ctx.ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.ctx.beginPath();
    ctx.ctx.roundRect(boxX, startY - 20 * scale, boxWidth, (cues.length * lineHeight) + 40 * scale, 10 * scale);
    ctx.ctx.fill();

    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.font = `bold ${16 * scale}px Arial`;
    cues.forEach((cue, i) => {
      ctx.ctx.fillText(`${i + 1}. ${cue}...`, boxX + 20 * scale, startY + (i * lineHeight));
    });
  }

  private drawRecordButton(ctx: RenderContext): void {
    const { width, height, scale } = ctx;

    const buttonSize = 80 * scale;
    this.recordButton = {
      x: width / 2 - buttonSize / 2,
      y: height - 150 * scale,
      w: buttonSize,
      h: buttonSize
    };

    // Draw circle button
    ctx.ctx.fillStyle = '#e74c3c';
    ctx.ctx.beginPath();
    ctx.ctx.arc(
      this.recordButton.x + buttonSize / 2,
      this.recordButton.y + buttonSize / 2,
      buttonSize / 2,
      0, Math.PI * 2
    );
    ctx.ctx.fill();

    // Draw microphone icon
    ctx.ctx.fillStyle = 'white';
    ctx.ctx.font = `${40 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('🎤', this.recordButton.x + buttonSize / 2, this.recordButton.y + buttonSize / 2);

    // Draw label
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `${16 * scale}px Arial`;
    ctx.ctx.fillText('Drücken zum Aufnehmen', width / 2, height - 50 * scale);
  }

  private drawRecordingUI(ctx: RenderContext): void {
    const { width, height, scale } = ctx;
    const config = this.config as StorytellingConfig;

    // Calculate elapsed time
    const elapsed = (Date.now() - this.recordingStartTime) / 1000;
    this.recordingDuration = elapsed;

    // Draw pulsing record indicator
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
    ctx.ctx.fillStyle = '#e74c3c';
    ctx.ctx.beginPath();
    ctx.ctx.arc(width / 2, height - 120 * scale, 30 * scale * pulse, 0, Math.PI * 2);
    ctx.ctx.fill();

    // Draw timer
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${32 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    const timeStr = `${Math.floor(elapsed)}s / ${config.maxDuration}s`;
    ctx.ctx.fillText(timeStr, width / 2, height - 60 * scale);

    // Draw stop button
    const buttonWidth = 150 * scale;
    const buttonHeight = 50 * scale;
    this.submitButton = {
      x: width / 2 - buttonWidth / 2,
      y: height - 200 * scale,
      w: buttonWidth,
      h: buttonHeight
    };

    ctx.ctx.fillStyle = elapsed >= config.minDuration ? '#4caf50' : '#999';
    ctx.ctx.beginPath();
    ctx.ctx.roundRect(this.submitButton.x, this.submitButton.y, buttonWidth, buttonHeight, 10 * scale);
    ctx.ctx.fill();

    ctx.ctx.fillStyle = 'white';
    ctx.ctx.font = `bold ${18 * scale}px Arial`;
    ctx.ctx.fillText('⏹ Fertig', width / 2, height - 175 * scale);
  }

  private drawProcessingUI(ctx: RenderContext): void {
    const { width, height, scale } = ctx;

    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `${24 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('🔄 Verarbeite deine Geschichte...', width / 2, height - 100 * scale);
  }

  private drawScoreUI(ctx: RenderContext): void {
    const { width, height, scale } = ctx;

    if (!this.score) return;

    // Draw score card - larger and positioned in center
    const cardWidth = 340 * scale;
    const cardHeight = 280 * scale;
    const cardX = (width - cardWidth) / 2;
    const cardY = (height - cardHeight) / 2;

    ctx.ctx.fillStyle = 'white';
    ctx.ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.ctx.shadowBlur = 20;
    ctx.ctx.beginPath();
    ctx.ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 15 * scale);
    ctx.ctx.fill();
    ctx.ctx.shadowBlur = 0;

    // Draw title
    ctx.ctx.font = `bold ${18 * scale}px Arial`;
    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('Auswertung', width / 2, cardY + 30 * scale);

    // Draw scores
    const categories = [
      { label: 'Zusammenhang', value: this.score.coherence },
      { label: 'Wortschatz', value: this.score.vocabulary },
      { label: 'Aufbau', value: this.score.structure },
      { label: 'Kreativität', value: this.score.creativity },
    ];

    let y = cardY + 60 * scale;
    ctx.ctx.font = `${14 * scale}px Arial`;
    categories.forEach(cat => {
      ctx.ctx.fillStyle = '#666';
      ctx.ctx.textAlign = 'left';
      ctx.ctx.fillText(cat.label, cardX + 20 * scale, y);

      // Draw stars
      ctx.ctx.textAlign = 'right';
      const stars = '⭐'.repeat(cat.value) + '☆'.repeat(3 - cat.value);
      ctx.ctx.fillText(stars, cardX + cardWidth - 20 * scale, y);
      y += 28 * scale;
    });

    // Draw total
    ctx.ctx.font = `bold ${20 * scale}px Arial`;
    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText(`Gesamt: ${this.score.total}/12`, width / 2, y + 15 * scale);

    // Draw feedback - wrap text if needed
    ctx.ctx.font = `${14 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    const feedback = this.score.feedback || '';
    const maxWidth = cardWidth - 40 * scale;

    // Simple text wrapping
    if (ctx.ctx.measureText(feedback).width > maxWidth) {
      const words = feedback.split(' ');
      let line = '';
      let lineY = y + 50 * scale;

      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.ctx.measureText(testLine).width > maxWidth) {
          ctx.ctx.fillText(line.trim(), width / 2, lineY);
          line = word + ' ';
          lineY += 18 * scale;
        } else {
          line = testLine;
        }
      }
      ctx.ctx.fillText(line.trim(), width / 2, lineY);
    } else {
      ctx.ctx.fillText(feedback, width / 2, y + 50 * scale);
    }

    // Draw "tap to continue" hint
    ctx.ctx.font = `${12 * scale}px Arial`;
    ctx.ctx.fillStyle = '#999';
    ctx.ctx.fillText('Tippen zum Fortfahren', width / 2, cardY + cardHeight - 15 * scale);
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (this.checkRepeatButtonClick(event)) {
      return null;
    }

    if (!this.isEndEvent(event)) return null;

    const { x, y } = event;

    switch (this.recordingState) {
      case 'idle':
        if (this.isInside(x, y, this.recordButton)) {
          this.startRecording();
        }
        break;

      case 'recording':
        if (this.isInside(x, y, this.submitButton)) {
          const config = this.config as StorytellingConfig;
          if (this.recordingDuration >= config.minDuration) {
            this.stopRecording();
          }
        }
        break;

      case 'scored':
        // Return result when scored
        const correct = this.score ? this.score.total >= 6 : false; // 50% threshold
        return {
          correct,
          responseTime: Date.now() - this.startTime,
          metadata: this.score ?? undefined
        };
    }

    return null;
  }

  private async startRecording(): Promise<void> {
    try {
      // Check if mediaDevices API is available (requires HTTPS on iOS Safari)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices API not available. HTTPS required on iOS.');
        speechEngine.speak('Aufnahme benötigt eine sichere Verbindung. Bitte HTTPS verwenden.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Safari doesn't support webm - check available formats
      let mimeType = '';
      const formats = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'];
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          mimeType = format;
          break;
        }
      }
      console.log('Using audio format:', mimeType || 'default');

      this.mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await this.processRecording();
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.recordingStartTime = Date.now();
      this.recordingState = 'recording';
      audioEngine.playSound('pop');

      // Auto-stop at max duration
      const config = this.config as StorytellingConfig;
      setTimeout(() => {
        if (this.recordingState === 'recording') {
          this.stopRecording();
        }
      }, config.maxDuration * 1000);

    } catch (error) {
      console.error('Failed to start recording:', error, (error as Error).name);

      // Detailed error messages for different failure modes
      let errorMessage: string;
      const errName = (error as Error).name;

      if (errName === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Zugriff verweigert. Bitte in Safari-Einstellungen erlauben.';
      } else if (errName === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden.';
      } else if (errName === 'NotReadableError' || errName === 'AbortError') {
        errorMessage = 'Mikrofon wird von anderer App verwendet.';
      } else if (errName === 'SecurityError') {
        errorMessage = 'Sichere Verbindung (HTTPS) erforderlich.';
      } else {
        errorMessage = 'Mikrofon-Fehler. Bitte Browser-Einstellungen prüfen.';
      }

      speechEngine.speak(errorMessage);
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.recordingState === 'recording') {
      this.mediaRecorder.stop();
      this.recordingState = 'processing';
      audioEngine.playSound('pop');
    }
  }

  private async processRecording(): Promise<void> {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    const config = this.config as StorytellingConfig;

    // Transcribe with Whisper
    const transcription = await openAIService.transcribeAudio(audioBlob);

    if (!transcription.success) {
      this.score = {
        coherence: 0,
        vocabulary: 0,
        structure: 0,
        creativity: 0,
        total: 0,
        feedback: transcription.error || 'Konnte die Aufnahme nicht verstehen.',
        transcription: ''
      };
      this.recordingState = 'scored';
      return;
    }

    // Score with GPT
    this.score = await openAIService.scoreStory(transcription.text, config.prompt);
    this.recordingState = 'scored';

    // Play appropriate sound
    if (this.score.total >= 6) {
      audioEngine.playSound('success');
      speechEngine.speak(this.score.feedback);
    } else {
      audioEngine.playSound('wrong');
      speechEngine.speak('Das war ein guter Versuch! ' + this.score.feedback);
    }
  }

  cleanup(): void {
    super.cleanup();
    if (this.mediaRecorder && this.recordingState === 'recording') {
      this.mediaRecorder.stop();
    }
    this.recordingState = 'idle';
    this.score = null;
  }
}

// Register the exercise plugin
ExerciseRegistry.register('storytelling', StorytellingExercise);
