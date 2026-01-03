<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CanvasManager } from '$lib/core/CanvasManager';
  import type { RenderContext } from '$lib/core/CanvasManager';
  import { ExerciseRegistry } from '$lib/exercises/base/ExerciseRegistry';
  import type { IExercisePlugin, ExerciseResult } from '$lib/exercises/base/types';
  import {
    gameState,
    currentTask,
    currentModule,
    recordScore,
    showFeedback,
    inputLocked
  } from '$lib/core/StateManager';
  import { speechEngine } from '$lib/core/SpeechEngine';
  import { audioEngine } from '$lib/core/AudioEngine';
  import { particleSystem } from '$lib/core/ParticleSystem';
  import { renderBackground, renderHUD } from '$lib/utils/rendering';

  let canvas: HTMLCanvasElement;
  let manager: CanvasManager | null = null;
  let currentExercise: IExercisePlugin | null = null;
  let feedbackMetadata: Record<string, any> | null = null;
  let showMetadataOverlay = false;

  onMount(() => {
    console.log('CanvasRenderer mounted');
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    manager = new CanvasManager(canvas);
    console.log('CanvasManager created');

    // Start render loop
    manager.startRenderLoop((ctx: RenderContext) => {
      // Clear canvas
      ctx.ctx.clearRect(0, 0, ctx.width, ctx.height);

      // Render background
      renderBackground(ctx);

      // Render HUD
      renderHUD(ctx);

      // Render current exercise
      if ($gameState === 'TASK' && currentExercise) {
        currentExercise.render(ctx);
      }

      // Update and render particles
      particleSystem.update();
      particleSystem.render(ctx.ctx, ctx.scale);

      // Render feedback overlay if active
      // (simplified - just show emoji in center)
      if ($gameState === 'TASK') {
        // Could add feedback overlay here later
      }
    });

    console.log('Render loop started');
  });

  onDestroy(() => {
    manager?.stopRenderLoop();
    if (currentExercise) {
      currentExercise.cleanup();
    }
  });

  // Auto-start task when entering MODULE_INTRO state
  $: if ($gameState === 'MODULE_INTRO') {
    console.log('MODULE_INTRO detected, auto-starting task...');
    setTimeout(() => {
      import('$lib/core/StateManager').then(({ startTask }) => {
        startTask();
      });
    }, 500);
  }

  // React to task changes
  $: if ($currentTask && $gameState === 'TASK') {
    // Clean up previous exercise
    if (currentExercise) {
      currentExercise.cleanup();
    }

    // Create new exercise
    currentExercise = ExerciseRegistry.create($currentTask);
    currentExercise.initialize($currentTask);

    // Speak instructions
    const speechRequests = currentExercise.onStart();
    speechEngine.speakSequence(speechRequests);

    // Special handling for memory exercise numbers
    if ($currentTask.type === 'memory' && $currentTask.seq) {
      setTimeout(() => {
        speechEngine.speakNumbers($currentTask.seq, 1200);  // Increased pause between numbers
      }, 3000);  // Wait longer after intro
    }
  }

  /**
   * Convert pointer event to input event
   */
  function convertToInputEvent(event: PointerEvent, type: 'start' | 'move' | 'end') {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      type
    };
  }

  /**
   * Handle pointer down
   */
  function handlePointerDown(event: PointerEvent) {
    if (!currentExercise || $inputLocked) return;

    const inputEvent = convertToInputEvent(event, 'start');
    const result = currentExercise.handleInput(inputEvent);

    // Check if repeat instruction was requested
    if (currentExercise.repeatRequested) {
      currentExercise.repeatRequested = false; // Reset flag
      const speechRequests = currentExercise.onStart();
      speechEngine.speakSequence(speechRequests);
      return; // Don't process as exercise result
    }

    if (result !== null) {
      handleExerciseResult(result);
    }
  }

  /**
   * Handle pointer move
   */
  function handlePointerMove(event: PointerEvent) {
    if (!currentExercise || $inputLocked) return;

    const inputEvent = convertToInputEvent(event, 'move');
    currentExercise.handleInput(inputEvent);
  }

  /**
   * Handle pointer up
   */
  function handlePointerUp(event: PointerEvent) {
    if (!currentExercise || $inputLocked) return;

    const inputEvent = convertToInputEvent(event, 'end');
    const result = currentExercise.handleInput(inputEvent);

    // Process result from exercises that complete on pointer up (e.g., Fertig button)
    if (result !== null) {
      handleExerciseResult(result);
    }
  }

  /**
   * Handle exercise completion
   */
  function handleExerciseResult(result: ExerciseResult) {
    // Play audio
    if (result.correct) {
      audioEngine.playSound('success');
      // Spawn particles at center
      const rect = canvas.getBoundingClientRect();
      particleSystem.spawnParticles(rect.width / 2, rect.height / 2, 20);
    } else {
      audioEngine.playSound('wrong');
    }

    // Show metadata overlay for drawing exercises (for adult supervision)
    if (result.metadata && isDrawingExercise()) {
      feedbackMetadata = result.metadata;
      showMetadataOverlay = true;

      // Hide overlay after 3 seconds
      setTimeout(() => {
        showMetadataOverlay = false;
        feedbackMetadata = null;
      }, 3000);
    }

    // Record score
    recordScore(result.correct);

    // Show feedback and advance
    showFeedback(result.correct);
  }

  /**
   * Check if current exercise is a drawing/motor exercise
   */
  function isDrawingExercise(): boolean {
    if (!$currentTask) return false;
    const drawingTypes = ['drawing', 'handwriting', 'connect_dots', 'trace', 'trace_path'];
    return drawingTypes.includes($currentTask.type);
  }
</script>

<canvas
  bind:this={canvas}
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
  style="touch-action: none; cursor: pointer;"
></canvas>

{#if showMetadataOverlay && feedbackMetadata}
  <div class="metadata-overlay">
    <div class="metadata-card">
      <h3>Übungsdetails</h3>
      {#if feedbackMetadata.accuracy !== undefined}
        <div class="stat">
          <span class="label">Genauigkeit:</span>
          <span class="value">{Math.round(feedbackMetadata.accuracy * 100)}%</span>
        </div>
      {/if}
      {#if feedbackMetadata.pointsDrawn !== undefined}
        <div class="stat">
          <span class="label">Punkte gezeichnet:</span>
          <span class="value">{feedbackMetadata.pointsDrawn}</span>
        </div>
      {/if}
      {#if feedbackMetadata.strokes !== undefined}
        <div class="stat">
          <span class="label">Striche:</span>
          <span class="value">{feedbackMetadata.strokes}</span>
        </div>
      {/if}
      {#if feedbackMetadata.pathCount !== undefined}
        <div class="stat">
          <span class="label">Pfade:</span>
          <span class="value">{feedbackMetadata.pathCount}</span>
        </div>
      {/if}
      {#if feedbackMetadata.totalPoints !== undefined}
        <div class="stat">
          <span class="label">Gesamtpunkte:</span>
          <span class="value">{feedbackMetadata.totalPoints}</span>
        </div>
      {/if}
      {#if feedbackMetadata.dotsConnected !== undefined}
        <div class="stat">
          <span class="label">Punkte verbunden:</span>
          <span class="value">{feedbackMetadata.dotsConnected}</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  canvas {
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    background: #fff;
    max-width: 100%;
    max-height: 100%;
  }

  .metadata-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    pointer-events: none;
    animation: fadeIn 0.3s ease;
  }

  .metadata-card {
    background: white;
    border-radius: 16px;
    padding: 24px 32px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    animation: slideUp 0.3s ease;
  }

  .metadata-card h3 {
    margin: 0 0 16px 0;
    color: #667eea;
    font-size: 1.3rem;
    text-align: center;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .stat:last-child {
    border-bottom: none;
  }

  .stat .label {
    color: #666;
    font-weight: 500;
  }

  .stat .value {
    color: #333;
    font-weight: bold;
    font-size: 1.2rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
