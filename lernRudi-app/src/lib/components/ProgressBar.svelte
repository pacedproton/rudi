<script lang="ts">
  import {
    currentModuleIndex,
    currentTaskIndex,
    currentModule,
    totalTasksInModule,
    totalKeys,
    modules
  } from '$lib/core/StateManager';
  import { settings } from '$lib/stores/settings';

  $: totalExercises = $modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
  $: completedExercises = $modules.slice(0, $currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + $currentTaskIndex;
  $: percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
</script>

{#if $settings.showProgress}
  <div class="progress-container">
    <div class="progress-info">
      {#if $currentModule}
        <span class="module-name">{$currentModule.title}</span>
        <span class="task-count">{$currentTaskIndex + 1}/{$totalTasksInModule}</span>
      {/if}
      {#if $settings.showScore}
        <span class="score">⭐ {$totalKeys}</span>
      {/if}
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {percentComplete}%"></div>
    </div>
    <div class="progress-text">
      {completedExercises}/{totalExercises} Aufgaben ({Math.round(percentComplete)}%)
    </div>
  </div>
{/if}

<style>
  .progress-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    padding: 12px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 900;
    backdrop-filter: blur(10px);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    gap: 12px;
  }

  .module-name {
    font-weight: bold;
    color: #667eea;
    flex: 1;
  }

  .task-count {
    color: #666;
    font-weight: 600;
  }

  .score {
    color: #ff9800;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .progress-bar {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.85rem;
    color: #666;
    text-align: center;
  }
</style>
