<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut, elasticOut, backOut } from 'svelte/easing';
  import { animationsEnabled } from '$lib/stores/settings';

  export let type: 'fade' | 'slide' | 'zoom' | 'netflix' = 'fade';
  export let duration = 400;
  export let delay = 0;
  
  // Animation configurations
  const animations = {
    fade: { in: fade, out: fade, params: { duration, delay } },
    slide: { 
      in: (node: Element) => fly(node, { y: 50, duration, delay, easing: cubicOut }), 
      out: (node: Element) => fly(node, { y: -50, duration: duration * 0.75, easing: cubicOut })
    },
    zoom: {
      in: (node: Element) => scale(node, { start: 0.8, duration, delay, easing: backOut }),
      out: (node: Element) => scale(node, { start: 1.2, duration: duration * 0.75, easing: cubicOut })
    },
    netflix: {
      in: (node: Element) => scale(node, { start: 0.5, duration: 600, delay, easing: elasticOut }),
      out: (node: Element) => scale(node, { start: 2, duration: 300, easing: cubicOut })
    }
  };

  $: config = animations[type];
</script>

{#if $animationsEnabled}
  <div 
    in:config.in
    out:config.out
    class="screen-transition"
  >
    <slot />
  </div>
{:else}
  <div class="screen-transition">
    <slot />
  </div>
{/if}

<style>
  .screen-transition {
    width: 100%;
    height: 100%;
  }
</style>
