<script lang="ts">
  import { onMount } from 'svelte';
  // import { colors, font } from '$lib/data/colors';

  let { onComplete }: { onComplete: () => void } = $props();

  let loadingProgress = 0;
  let isVisible = true;

  // Reactive statement to trigger re-renders
  $: displayProgress = Math.round(loadingProgress);

  onMount(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      loadingProgress += Math.random() * 15;
      if (loadingProgress >= 100) {
        loadingProgress = 100;
        clearInterval(interval);

        // Wait a bit then fade out
        setTimeout(() => {
          isVisible = false;
          setTimeout(onComplete, 500); // Allow fade out animation to complete
        }, 800);
      }
    }, 100);
  });
</script>

<div
  class="splash-container"
  class:fade-out={!isVisible}
  style="--sky-color: #87CEEB; --grass-color: #7CFC00; --poldi-skin: #76c043; --poldi-dark: #4a8e22; --red-color: #e74c3c; --gold-color: #FFD700; --text-color: #333333; --font-family: Arial;"
>
  <!-- Background -->
  <div class="background">
    <div class="sky"></div>
    <div class="ground"></div>
  </div>

  <!-- Floating elements -->
  <div class="floating-elements">
    <div class="cloud cloud-1">☁️</div>
    <div class="cloud cloud-2">☁️</div>
    <div class="cloud cloud-3">☁️</div>
  </div>

  <!-- Main content -->
  <div class="content">
    <!-- Poldi character -->
    <div class="poldi-container">
      <div class="poldi-character">
        <div class="poldi-body">
          <div class="poldi-head">
            <div class="poldi-eye left"></div>
            <div class="poldi-eye right"></div>
            <div class="poldi-mouth"></div>
          </div>
          <div class="poldi-leg left"></div>
          <div class="poldi-leg right"></div>
        </div>
      </div>
      <div class="shadow"></div>
    </div>

    <!-- Game elements -->
    <div class="game-elements">
      <div class="element star">⭐</div>
      <div class="element heart">❤️</div>
      <div class="element diamond">💎</div>
      <div class="element coin">🪙</div>
    </div>

    <!-- Title -->
    <div class="title-container">
      <h1 class="title">Poldi</h1>
      <div class="subtitle">Loading Adventure...</div>
    </div>

    <!-- Loading ring -->
    <div class="loading-container">
      <div class="loading-ring">
        <div class="loading-ring-progress" style="--progress: {loadingProgress}"></div>
        <div class="loading-ring-center">
          <div class="loading-text">{displayProgress}%</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Particles -->
  <div class="particles">
    {#each Array(20) as _, i}
      <div class="particle" style="animation-delay: {i * 0.1}s; left: {Math.random() * 100}%;"></div>
    {/each}
  </div>
</div>

<style>
  .splash-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.5s ease-out;
    animation: container-breathe 4s ease-in-out infinite;
  }

  @keyframes container-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .fade-out {
    opacity: 0;
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: brightness(1.1) saturate(1.2);
  }

  .sky {
    height: 70%;
    background:
      radial-gradient(ellipse at top, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
      linear-gradient(180deg, var(--sky-color) 0%, #E0F6FF 50%, #B0E0E6 100%);
    position: relative;
    animation: sky-shift 8s ease-in-out infinite;
  }

  .ground {
    height: 30%;
    background:
      radial-gradient(ellipse at bottom, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
      linear-gradient(0deg, var(--grass-color) 0%, #90EE90 50%, #32CD32 100%);
    position: relative;
    overflow: hidden;
  }

  .ground::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 215, 0, 0.1) 20%,
      rgba(255, 215, 0, 0.2) 50%,
      rgba(255, 215, 0, 0.1) 80%,
      transparent 100%);
    animation: sunlight-sweep 6s ease-in-out infinite;
  }

  .floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 70%;
    pointer-events: none;
  }

  .cloud {
    position: absolute;
    font-size: 2rem;
    animation: float 8s ease-in-out infinite;
    opacity: 0.8;
  }

  .cloud-1 {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .cloud-2 {
    top: 15%;
    right: 15%;
    animation-delay: 2s;
  }

  .cloud-3 {
    top: 25%;
    left: 60%;
    animation-delay: 4s;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(0px) translateX(10px); }
    75% { transform: translateY(-5px) translateX(5px); }
  }

  @keyframes sky-shift {
    0%, 100% { filter: hue-rotate(0deg) brightness(1); }
    50% { filter: hue-rotate(5deg) brightness(1.1); }
  }

  @keyframes sunlight-sweep {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
  }

  .poldi-container {
    position: relative;
    margin-bottom: 2rem;
  }

  .poldi-character {
    animation: poldi-bounce 2s ease-in-out infinite, poldi-glow 3s ease-in-out infinite alternate;
    transform-style: preserve-3d;
  }

  .poldi-body {
    width: 120px;
    height: 100px;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
      linear-gradient(135deg, var(--poldi-skin) 0%, color-mix(in srgb, var(--poldi-skin) 80%, black) 100%);
    border-radius: 60px 60px 50px 50px;
    position: relative;
    border: 3px solid var(--poldi-dark);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      0 0 20px rgba(76, 140, 60, 0.3);
    backdrop-filter: blur(1px);
    transform: perspective(200px) rotateX(5deg);
    transition: transform 0.3s ease;
  }

  .poldi-body:hover {
    transform: perspective(200px) rotateX(10deg) scale(1.05);
  }

  .poldi-head {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background:
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.5) 0%, transparent 40%),
      linear-gradient(135deg, var(--poldi-skin) 0%, color-mix(in srgb, var(--poldi-skin) 85%, black) 100%);
    border-radius: 50%;
    border: 3px solid var(--poldi-dark);
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      0 0 15px rgba(76, 140, 60, 0.2);
    backdrop-filter: blur(0.5px);
  }

  .poldi-eye {
    position: absolute;
    top: 20px;
    width: 12px;
    height: 12px;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, white 50%);
    border-radius: 50%;
    border: 2px solid var(--poldi-dark);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    animation: eye-twinkle 4s ease-in-out infinite;
  }

  .poldi-eye.left {
    left: 20px;
  }

  .poldi-eye.right {
    right: 20px;
  }

  .poldi-mouth {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 10px;
    background:
      radial-gradient(ellipse at top, rgba(255, 255, 255, 0.3) 0%, var(--red-color) 70%);
    border-radius: 0 0 10px 10px;
    border: 1px solid color-mix(in srgb, var(--red-color) 70%, black);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
    animation: mouth-smile 3s ease-in-out infinite;
  }

  .poldi-leg {
    position: absolute;
    bottom: -10px;
    width: 20px;
    height: 30px;
    background: var(--poldi-dark);
    border-radius: 10px;
  }

  .poldi-leg.left {
    left: 25px;
  }

  .poldi-leg.right {
    right: 25px;
  }

  @keyframes poldi-bounce {
    0%, 100% {
      transform: translateY(0px) scale(1) perspective(200px) rotateX(5deg);
    }
    25% {
      transform: translateY(-10px) scale(1.05) perspective(200px) rotateX(8deg);
    }
    50% {
      transform: translateY(0px) scale(1) perspective(200px) rotateX(5deg);
    }
    75% {
      transform: translateY(-5px) scale(1.02) perspective(200px) rotateX(6deg);
    }
  }

  @keyframes poldi-glow {
    0% {
      filter: drop-shadow(0 0 5px rgba(76, 140, 60, 0.2));
    }
    100% {
      filter: drop-shadow(0 0 15px rgba(76, 140, 60, 0.6)) brightness(1.1);
    }
  }

  @keyframes eye-twinkle {
    0%, 95%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    97% {
      opacity: 0.7;
      transform: scale(0.9);
    }
  }

  @keyframes mouth-smile {
    0%, 100% {
      transform: translateX(-50%) scaleY(1);
    }
    50% {
      transform: translateX(-50%) scaleY(1.2);
    }
  }

  .shadow {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 15px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    animation: shadow-pulse 2s ease-in-out infinite;
  }

  @keyframes shadow-pulse {
    0%, 100% { transform: translateX(-50%) scaleX(1); }
    25% { transform: translateX(-50%) scaleX(1.2); }
    50% { transform: translateX(-50%) scaleX(1); }
    75% { transform: translateX(-50%) scaleX(1.1); }
  }

  .game-elements {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .element {
    font-size: 2rem;
    animation: element-float 3s ease-in-out infinite;
    opacity: 0;
    animation-fill-mode: forwards;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    mix-blend-mode: multiply;
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  .element:hover {
    transform: scale(1.2) rotate(5deg);
    filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  }

  .element:nth-child(1) { animation-delay: 0.5s; }
  .element:nth-child(2) { animation-delay: 1s; }
  .element:nth-child(3) { animation-delay: 1.5s; }
  .element:nth-child(4) { animation-delay: 2s; }

  @keyframes element-float {
    0% {
      transform: translateY(20px) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: translateY(-10px) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: translateY(0px) rotate(360deg);
      opacity: 1;
    }
  }

  .title-container {
    margin-bottom: 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
  }

  .title-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: shimmer 3s ease-in-out infinite;
  }

  .title {
    font-family: var(--font-family);
    font-size: 4rem;
    font-weight: bold;
    color: var(--poldi-dark);
    margin: 0;
    text-shadow:
      2px 2px 4px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(255, 215, 0, 0.3);
    animation: title-glow 2s ease-in-out infinite alternate;
    background: linear-gradient(45deg, var(--poldi-dark), color-mix(in srgb, var(--poldi-dark) 80%, var(--gold-color)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes title-glow {
    0% {
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.2));
    }
    100% {
      text-shadow: 2px 2px 8px rgba(255, 215, 0, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.3);
      filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.5));
    }
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .subtitle {
    font-family: var(--font-family);
    font-size: 1.2rem;
    color: var(--text-color);
    margin-top: 0.5rem;
    animation: fade-in 1s ease-out 0.5s both;
  }

  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .loading-ring {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .loading-ring-progress {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--gold-color) 0deg,
      var(--poldi-skin) calc(var(--progress) * 3.6deg),
      rgba(255, 255, 255, 0.1) calc(var(--progress) * 3.6deg),
      rgba(255, 255, 255, 0.1) 360deg
    );
    mask: radial-gradient(circle at center, transparent 40%, black 42%);
    -webkit-mask: radial-gradient(circle at center, transparent 40%, black 42%);
    animation: ring-rotate 2s linear infinite;
  }

  .loading-ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%),
      linear-gradient(135deg, var(--sky-color), #E0F6FF);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 2px 10px rgba(0, 0, 0, 0.1),
      0 4px 15px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(255, 215, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .loading-text {
    font-family: var(--font-family);
    font-size: 1.2rem;
    color: var(--poldi-dark);
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    animation: text-pulse 1.5s ease-in-out infinite;
  }

  @keyframes ring-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes text-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background:
      radial-gradient(circle, var(--gold-color) 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%);
    border-radius: 50%;
    animation: particle-rise 4s ease-out infinite;
    opacity: 0;
    filter: blur(0.5px);
    mix-blend-mode: screen;
    box-shadow: 0 0 6px var(--gold-color);
  }

  .particle:nth-child(odd) {
    background:
      radial-gradient(circle, var(--poldi-skin) 0%, rgba(76, 140, 60, 0.3) 50%, transparent 100%);
    box-shadow: 0 0 6px var(--poldi-skin);
  }

  .particle:nth-child(3n) {
    animation-duration: 6s;
    animation-delay: -2s;
  }

  .particle:nth-child(5n) {
    animation-duration: 5s;
    animation-delay: -1s;
    filter: blur(1px) hue-rotate(45deg);
  }

  @keyframes particle-rise {
    0% {
      transform: translateY(100vh) rotate(0deg) scale(0);
      opacity: 0;
      filter: blur(2px);
    }
    10% {
      opacity: 0.8;
      transform: translateY(90vh) rotate(36deg) scale(0.5);
      filter: blur(1px);
    }
    20% {
      transform: translateY(80vh) rotate(72deg) scale(1);
      filter: blur(0.5px);
    }
    50% {
      opacity: 1;
      transform: translateY(50vh) rotate(180deg) scale(1.2);
      filter: blur(0px) brightness(1.5);
    }
    80% {
      opacity: 0.6;
      transform: translateY(20vh) rotate(288deg) scale(0.8);
      filter: blur(0.5px);
    }
    90% {
      opacity: 0.3;
      filter: blur(1px);
    }
    100% {
      transform: translateY(-100px) rotate(360deg) scale(0);
      opacity: 0;
      filter: blur(2px);
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .title {
      font-size: 2.5rem;
    }

    .title-container {
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .poldi-body {
      width: 100px;
      height: 80px;
    }

    .poldi-head {
      width: 60px;
      height: 60px;
      top: -30px;
    }

    .loading-ring {
      width: 100px;
      height: 100px;
    }

    .loading-ring-center {
      width: 70px;
      height: 70px;
    }

    .loading-text {
      font-size: 1rem;
    }

    .game-elements {
      gap: 0.5rem;
    }

    .element {
      font-size: 1.5rem;
      padding: 0.3rem;
    }

    .subtitle {
      font-size: 1rem;
    }
  }
</style>
