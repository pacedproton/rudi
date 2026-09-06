<script lang="ts">
  import { scale, fade } from 'svelte/transition';
  import { elasticOut, backOut } from 'svelte/easing';
  import { animationsEnabled } from '$lib/stores/settings';
  import { onMount } from 'svelte';

  export let type: 'correct' | 'wrong' | 'celebration' = 'correct';
  export let show = false;
  export let duration = 1000;
  export let onComplete: () => void = () => {};

  let visible = false;

  $: if (show) {
    visible = true;
    setTimeout(() => {
      visible = false;
      onComplete();
    }, duration);
  }

  const icons = {
    correct: '✓',
    wrong: '✗',
    celebration: '🎉'
  };

  const colors = {
    correct: '#4caf50',
    wrong: '#f44336',
    celebration: '#ffc107'
  };
</script>

{#if visible && $animationsEnabled}
  <div 
    class="feedback-overlay"
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="feedback-icon {type}"
      in:scale={{ duration: 500, easing: elasticOut, start: 0.2 }}
      out:scale={{ duration: 200, start: 1.5 }}
      style="--color: {colors[type]}"
    >
      {icons[type]}
    </div>
  </div>
{/if}

<style>
  .feedback-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 9999;
  }

  .feedback-icon {
    font-size: 150px;
    color: var(--color);
    text-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 60px var(--color);
    animation: pulse 0.5s ease-in-out infinite alternate;
  }

  .feedback-icon.correct {
    animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  .feedback-icon.wrong {
    animation: shake 0.5s ease;
  }

  .feedback-icon.celebration {
    animation: celebration 0.8s ease-out;
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  @keyframes celebration {
    0% { transform: scale(0) rotate(-30deg); opacity: 0; }
    50% { transform: scale(1.3) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes pulse {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
  }
</style>
