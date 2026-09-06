<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import CanvasRenderer from '$lib/components/canvas/CanvasRenderer.svelte';
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import {
    startExamSequence,
    resetToMenu,
    gameState,
    updateCanvasSize
  } from '$lib/core/StateManager';
  import type { Module } from '$lib/core/StateManager';
  import { flinkiModules, bonusRealworldModule, demoModule, shortTestModule } from '$lib/data/modules';
  import { resolveWritingModule, isWritingModuleId } from '$lib/data/writing-modules';
  import { writingMastery } from '$lib/stores/writingMastery';
  import { get } from 'svelte/store';
  import '$lib/exercises'; // Register all exercises

  let initialized = false;

  onMount(() => {
    // Lock body scrolling for full-screen exercise
    document.body.style.overflow = 'hidden';
    
    const moduleParam = $page.url.searchParams.get('module');
    const modeParam = $page.url.searchParams.get('mode');
    const bonusParam = $page.url.searchParams.get('bonus');

    let modulesToRun: Module[] = [];

    if (bonusParam) {
      // Handle bonus modules
      if (bonusParam === 'bonus-realworld') {
        modulesToRun = [bonusRealworldModule];
      }
    } else if (moduleParam) {
      if (isWritingModuleId(moduleParam)) {
        const writing = resolveWritingModule(moduleParam, get(writingMastery));
        if (writing) {
          modulesToRun = [writing];
        }
      } else {
        const m = flinkiModules.find(x => x.id === moduleParam);
        if (m) {
          modulesToRun = [m];
        }
      }
    } else if (modeParam === 'full') {
        modulesToRun = flinkiModules;
    } else if (modeParam === 'demo') {
        modulesToRun = [demoModule];
    } else if (modeParam === 'short') {
        modulesToRun = [shortTestModule];
    }

    if (modulesToRun.length > 0) {
      // Set initial canvas size
      updateCanvasSize(window.innerWidth, window.innerHeight);
      
      startExamSequence(modulesToRun);
      initialized = true;
    } else {
      goto('/');
    }

    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    // Restore body scrolling when leaving exercises
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    resetToMenu();
  });

  function handleResize() {
    updateCanvasSize(window.innerWidth, window.innerHeight);
  }

  function handleRestart() {
    resetToMenu();
    goto('/');
  }
</script>

<div class="game-container">
   <button class="back-btn" on:click={handleRestart}>❌</button>

   {#if !initialized}
      <div class="loading">Loading...</div>
   {:else}
       {#if $gameState === 'RESULTS'}
          <ResultsDisplay on:restart={handleRestart} />
       {:else}
          <div class="canvas-wrapper">
             <CanvasRenderer />
          </div>
       {/if}
   {/if}
</div>

<style>
  :global(body) {
      margin: 0;
      padding: 0;
      overflow: hidden;
  }

  .game-container {
      width: 100vw;
      height: 100vh;
      background: #333;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
  }

  .back-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 2000;
      background: white;
      border: none;
      font-size: 1.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .loading {
      color: white;
      font-size: 2rem;
  }

  .canvas-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
  }
</style>
