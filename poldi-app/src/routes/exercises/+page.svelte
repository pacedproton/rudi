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
  import { poldiModules } from '$lib/data/modules';
  import '$lib/exercises'; // Register all exercises

  let initialized = false;

  onMount(() => {
    const moduleParam = $page.url.searchParams.get('module');
    const modeParam = $page.url.searchParams.get('mode');

    let modulesToRun: Module[] = [];

    if (moduleParam) {
      const m = poldiModules.find(x => x.id === moduleParam);
      if (m) {
        modulesToRun = [m];
      }
    } else if (modeParam === 'full') {
        modulesToRun = poldiModules;
    } else if (modeParam === 'demo') {
        // Construct demo module
        const demoModule = {
             id: 'demo',
             title: 'Demo',
             intro: 'Demo Version',
             tasks: poldiModules[0].tasks.slice(0, 3)
        };
        modulesToRun = [demoModule];
    } else if (modeParam === 'short') {
         // Short test: first module only for now
         modulesToRun = [poldiModules[0]]; 
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
