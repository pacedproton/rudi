<script lang="ts">
  import { onMount } from 'svelte';

  export let onComplete: () => void;

  onMount(() => {
    // Auto-complete after animation (approx 4.5s)
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => clearTimeout(timer);
  });
</script>

<div id="container" on:click={onComplete} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && onComplete()}>
  <div class="vastfast-intro">
    <!-- V Letter (left side) - 2 angled bars -->
    <div class="v-letter">
      <div class="v-left-stroke">
        <div class="effect-brush">
          {#each Array(31) as _, i}
            <span class="fur-{31-i}"></span>
          {/each}
        </div>
        <div class="effect-lumieres">
          {#each Array(14) as _, i}
            <span class="lamp-{i+1}"></span>
          {/each}
        </div>
      </div>
      <div class="v-right-stroke">
        <div class="effect-brush">
          {#each Array(31) as _, i}
            <span class="fur-{31-i}"></span>
          {/each}
        </div>
        <div class="effect-lumieres">
          {#each Array(14) as _, i}
            <span class="lamp-{i+1}"></span>
          {/each}
        </div>
      </div>
    </div>

    <!-- F Letter (right side) - 3 bars -->
    <div class="f-letter">
      <div class="f-vertical-stroke">
        <div class="effect-brush">
          {#each Array(31) as _, i}
            <span class="fur-{31-i}"></span>
          {/each}
        </div>
      </div>
      <div class="f-top-stroke">
        <div class="effect-brush">
          {#each Array(31) as _, i}
            <span class="fur-{31-i}"></span>
          {/each}
        </div>
      </div>
      <div class="f-mid-stroke">
        <div class="effect-brush">
          {#each Array(31) as _, i}
            <span class="fur-{31-i}"></span>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
:root {
  --vf-bg: #000000;
  --vf-blue: #0080FF;
  --vf-cyan: #00D4FF;
  --vf-dark: #0066CC;
  --vf-glow: rgba(0, 128, 255, 0.8);
}

#container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: var(--vf-bg);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  cursor: pointer;
}

.vastfast-intro {
  display: flex;
  gap: 40px;
  position: relative;
  width: 600px;
  height: 300px;
  animation: zoom-in 3.5s ease-in 0.5s forwards;
}

/* V Letter Styles */
.v-letter {
  position: relative;
  width: 250px;
  height: 300px;
}

.v-left-stroke {
  position: absolute;
  width: 22%;
  height: 100%;
  left: 10%;
  top: 0;
  transform-origin: bottom center;
  transform: rotate(-20deg);
  background-color: rgba(0, 128, 255, 0.3);
  animation: fading-lumieres-box 2s 0.6s forwards;
  overflow: hidden;
}

.v-left-stroke .effect-brush {
  animation: brush-moving 2s forwards 0.5s;
}

.v-right-stroke {
  position: absolute;
  width: 22%;
  height: 100%;
  right: 10%;
  top: 0;
  transform-origin: bottom center;
  transform: rotate(20deg);
  overflow: hidden;
}

.v-right-stroke .effect-brush {
  animation: brush-moving 2s forwards 0.8s;
}

/* F Letter Styles */
.f-letter {
  position: relative;
  width: 220px;
  height: 300px;
}

.f-vertical-stroke {
  position: absolute;
  width: 22%;
  height: 100%;
  left: 10%;
  top: 0;
  transform: rotate(180deg);
  overflow: hidden;
}

.f-vertical-stroke .effect-brush {
  animation: brush-moving 2.5s forwards 1.2s;
}

.f-top-stroke {
  position: absolute;
  width: 55%;
  height: 20%;
  left: 10%;
  top: 0;
  transform: rotate(0deg);
  overflow: hidden;
}

.f-top-stroke .effect-brush {
  animation: brush-moving-horizontal 1.8s forwards 1.5s;
}

.f-mid-stroke {
  position: absolute;
  width: 40%;
  height: 18%;
  left: 10%;
  top: 42%;
  transform: rotate(0deg);
  overflow: hidden;
}

.f-mid-stroke .effect-brush {
  animation: brush-moving-horizontal 1.8s forwards 1.8s;
}

/* Brush Effect */
.effect-brush {
  position: absolute;
  width: 100%;
  height: 300%;
  top: 0;
  overflow: hidden;
}

.effect-brush::before {
  display: block;
  content: "";
  position: absolute;
  background: linear-gradient(180deg, var(--vf-cyan) 0%, var(--vf-blue) 50%, var(--vf-dark) 100%);
  width: 100%;
  height: 70%;
  box-shadow: 
    0px 0px 40px 30px var(--vf-glow),
    0px 0px 80px 50px rgba(0, 128, 255, 0.4),
    inset 0px 0px 20px rgba(255, 255, 255, 0.3);
}

[class*="fur-"] {
  display: block;
  position: absolute;
  bottom: 10%;
  height: 30%;
}

/* Light Effects */
.effect-lumieres {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: showing-lumieres 2s 1.6s forwards;
}

[class*="lamp-"] {
  position: absolute;
  display: block;
  height: 100%;
  box-shadow: 0px 0px 10px 0px rgba(0, 128, 255, 0.75);
  background: var(--lamp-color);
  animation-fill-mode: forwards;
}

/* Animations */
@keyframes brush-moving {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100%); }
}

@keyframes brush-moving-horizontal {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}

@keyframes zoom-in {
  0% { transform: scale(1); }
  100% { transform: scale(15); }
}

@keyframes showing-lumieres {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fading-lumieres-box {
  0% { background-color: rgba(0, 128, 255, 0.3); }
  100% { background-color: rgba(0, 128, 255, 0.0); }
}

@keyframes lumieres-moving-right {
  0% { transform: translate(0); }
  40% { transform: translate(-10px) scaleX(1); }
  50% { transform: translate(-60px); }
  100% { transform: translate(-120px) scaleX(3); }
}

@keyframes lumieres-moving-left {
  0% { transform: translate(0); }
  40% { transform: translate(10px) scaleX(1); }
  50% { transform: translate(60px); }
  100% { transform: translate(120px) scaleX(3); }
}

/* Fur gradients (simplified - matching Netflix pattern) */
.fur-1 { left: 0%; width: 3.8%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 15%, transparent 81%); }
.fur-2 { left: 3.8%; width: 2.8%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 10%, transparent 62%); }
.fur-3 { left: 6.6%; width: 4.8%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 37%, transparent 100%); }
.fur-4 { left: 11.4%; width: 4%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 23%, transparent 100%); }
.fur-5 { left: 15.4%; width: 4%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 15%, transparent 86%); }
.fur-6 { left: 19.4%; width: 2.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 27%, transparent 89%); }
.fur-7 { left: 21.9%; width: 4%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 20%, transparent 100%); }
.fur-8 { left: 25.9%; width: 2%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 30%, transparent 100%); }
.fur-9 { left: 27.9%; width: 4%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 35%, transparent 95%); }
.fur-10 { left: 31.9%; width: 3.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 39%, transparent 95%); }
.fur-11 { left: 35.4%; width: 2%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 34%, transparent 95%); }
.fur-12 { left: 37.4%; width: 2.6%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 22%, transparent 95%); }
.fur-13 { left: 40%; width: 6%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 47%, transparent 100%); }
.fur-14 { left: 46%; width: 2%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 36%, transparent 100%); }
.fur-15 { left: 48%; width: 5.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 29%, transparent 100%); }
.fur-16 { left: 53.5%; width: 3%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 39%, transparent 95%); }
.fur-17 { left: 56.5%; width: 4.1%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 45%, transparent 100%); }
.fur-18 { left: 60.6%; width: 2.4%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 34%, transparent 100%); }
.fur-19 { left: 63%; width: 4%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 47%, transparent 100%); }
.fur-20 { left: 67%; width: 1.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 27%, transparent 95%); }
.fur-21 { left: 68.5%; width: 2.8%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 37%, transparent 100%); }
.fur-22 { left: 71.3%; width: 2.3%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 9%, transparent 100%); }
.fur-23 { left: 73.6%; width: 2.2%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 28%, transparent 92%); }
.fur-24 { left: 75.8%; width: 1%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 37%, transparent 100%); }
.fur-25 { left: 76.8%; width: 2.1%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 28%, transparent 100%); }
.fur-26 { left: 78.9%; width: 4.1%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 34%, transparent 100%); }
.fur-27 { left: 83%; width: 2.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 21%, transparent 100%); }
.fur-28 { left: 85.5%; width: 4.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 39%, transparent 100%); }
.fur-29 { left: 90%; width: 2.8%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 30%, transparent 100%); }
.fur-30 { left: 92.8%; width: 3.5%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 19%, transparent 100%); }
.fur-31 { left: 96.3%; width: 3.7%; background: linear-gradient(to bottom, var(--vf-blue) 0%, var(--vf-blue) 37%, transparent 100%); }

/* Simplified lamp colors */
.lamp-1 { --lamp-color: #ff0100; left: 0.7%; width: 1%; animation: lumieres-moving-left 2s 0.97s forwards; }
.lamp-2 { --lamp-color: #ffde01; left: 2.2%; width: 1.4%; animation: lumieres-moving-right 2s 0.08s forwards; }
.lamp-3 { --lamp-color: #ff00cc; left: 5.8%; width: 2.1%; animation: lumieres-moving-left 2s 0.92s forwards; }
.lamp-4 { --lamp-color: #04fd8f; left: 10.1%; width: 2%; animation: lumieres-moving-right 2s 1.46s forwards; }
.lamp-5 { --lamp-color: #ff0100; left: 12.9%; width: 1.4%; animation: lumieres-moving-left 2s 0.1s forwards; }
.lamp-6 { --lamp-color: #ff9600; left: 15.3%; width: 2.8%; animation: lumieres-moving-right 2s 0.81s forwards; }
.lamp-7 { --lamp-color: #0084ff; left: 21.2%; width: 2.5%; animation: lumieres-moving-left 2s 0.8s forwards; }
.lamp-8 { --lamp-color: #f84006; left: 25%; width: 2.5%; animation: lumieres-moving-right 2s 0.85s forwards; }
.lamp-9 { --lamp-color: #ffc601; left: 30.5%; width: 3%; animation: lumieres-moving-left 2s 1.88s forwards; }
.lamp-10 { --lamp-color: #ff4800; left: 36.3%; width: 3%; animation: lumieres-moving-right 2s 0.36s forwards; }
.lamp-11 { --lamp-color: #fd0100; left: 41%; width: 2.2%; animation: lumieres-moving-left 2s 1.63s forwards; }
.lamp-12 { --lamp-color: #01ffff; left: 44.2%; width: 2.6%; animation: lumieres-moving-right 2s 0.59s forwards; }
.lamp-13 { --lamp-color: #ffc601; left: 51.7%; width: 0.5%; animation: lumieres-moving-left 2s 0.92s forwards; }
.lamp-14 { --lamp-color: #ffc601; left: 52.1%; width: 1.8%; animation: lumieres-moving-right 2s 1.72s forwards; }
</style>
