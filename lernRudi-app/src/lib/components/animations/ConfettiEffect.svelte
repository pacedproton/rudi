<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { animationsEnabled } from '$lib/stores/settings';

  export let show = false;
  export let duration = 3000;
  export let particleCount = 100;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let particles: Particle[] = [];
  let animationFrame: number;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    shape: 'rect' | 'circle' | 'star';
  }

  const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', 
    '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1',
    '#ffeaa7', '#fd79a8'
  ];

  function createParticle(): Particle {
    return {
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: Math.random() * -20 - 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)] as any
    };
  }

  function drawStar(x: number, y: number, size: number) {
    if (!ctx) return;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](x + Math.cos(angle) * size, y + Math.sin(angle) * size);
    }
    ctx.closePath();
    ctx.fill();
  }

  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => p.y < canvas.height + 50);

    for (const p of particles) {
      p.vy += 0.5; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.vx *= 0.99; // air resistance

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(0, 0, p.size / 2);
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function startConfetti() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = Array.from({ length: particleCount }, createParticle);
    animate();

    setTimeout(() => {
      particles = [];
    }, duration);
  }

  $: if (show && $animationsEnabled) {
    startConfetti();
  }

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

{#if show && $animationsEnabled}
  <canvas bind:this={canvas} class="confetti-canvas"></canvas>
{/if}

<style>
  .confetti-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 10000;
  }
</style>
