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
  <!-- Edit the letter attr to: N, E, T, F, L, I or X -->
  <div class="netflixintro" letter="N">
    <div class="helper-1">
      <div class="effect-brush">
        <span class="fur-31"></span>
        <span class="fur-30"></span>
        <span class="fur-29"></span>
        <span class="fur-28"></span>
        <span class="fur-27"></span>
        <span class="fur-26"></span>
        <span class="fur-25"></span>
        <span class="fur-24"></span>
        <span class="fur-23"></span>
        <span class="fur-22"></span>
        <span class="fur-21"></span>
        <span class="fur-20"></span>
        <span class="fur-19"></span>
        <span class="fur-18"></span>
        <span class="fur-17"></span>
        <span class="fur-16"></span>
        <span class="fur-15"></span>
        <span class="fur-14"></span>
        <span class="fur-13"></span>
        <span class="fur-12"></span>
        <span class="fur-11"></span>
        <span class="fur-10"></span>
        <span class="fur-9"></span>
        <span class="fur-8"></span>
        <span class="fur-7"></span>
        <span class="fur-6"></span>
        <span class="fur-5"></span>
        <span class="fur-4"></span>
        <span class="fur-3"></span>
        <span class="fur-2"></span>
        <span class="fur-1"></span>
      </div>
      <div class="effect-lumieres">
        <span class="lamp-1"></span>
        <span class="lamp-2"></span>
        <span class="lamp-3"></span>
        <span class="lamp-4"></span>
        <span class="lamp-5"></span>
        <span class="lamp-6"></span>
        <span class="lamp-7"></span>
        <span class="lamp-8"></span>
        <span class="lamp-9"></span>
        <span class="lamp-10"></span>
        <span class="lamp-11"></span>
        <span class="lamp-12"></span>
        <span class="lamp-13"></span>
        <span class="lamp-14"></span>
        <span class="lamp-15"></span>
        <span class="lamp-16"></span>
        <span class="lamp-17"></span>
        <span class="lamp-18"></span>
        <span class="lamp-19"></span>
        <span class="lamp-20"></span>
        <span class="lamp-21"></span>
        <span class="lamp-22"></span>
        <span class="lamp-23"></span>
        <span class="lamp-24"></span>
        <span class="lamp-25"></span>
        <span class="lamp-26"></span>
        <span class="lamp-27"></span>
        <span class="lamp-28"></span>
      </div>
    </div>
    <div class="helper-2">
      <div class="effect-brush">
        <span class="fur-31"></span>
        <span class="fur-30"></span>
        <span class="fur-29"></span>
        <span class="fur-28"></span>
        <span class="fur-27"></span>
        <span class="fur-26"></span>
        <span class="fur-25"></span>
        <span class="fur-24"></span>
        <span class="fur-23"></span>
        <span class="fur-22"></span>
        <span class="fur-21"></span>
        <span class="fur-20"></span>
        <span class="fur-19"></span>
        <span class="fur-18"></span>
        <span class="fur-17"></span>
        <span class="fur-16"></span>
        <span class="fur-15"></span>
        <span class="fur-14"></span>
        <span class="fur-13"></span>
        <span class="fur-12"></span>
        <span class="fur-11"></span>
        <span class="fur-10"></span>
        <span class="fur-9"></span>
        <span class="fur-8"></span>
        <span class="fur-7"></span>
        <span class="fur-6"></span>
        <span class="fur-5"></span>
        <span class="fur-4"></span>
        <span class="fur-3"></span>
        <span class="fur-2"></span>
        <span class="fur-1"></span>
      </div>
    </div>
    <div class="helper-3">
      <div class="effect-brush">
        <span class="fur-31"></span>
        <span class="fur-30"></span>
        <span class="fur-29"></span>
        <span class="fur-28"></span>
        <span class="fur-27"></span>
        <span class="fur-26"></span>
        <span class="fur-25"></span>
        <span class="fur-24"></span>
        <span class="fur-23"></span>
        <span class="fur-22"></span>
        <span class="fur-21"></span>
        <span class="fur-20"></span>
        <span class="fur-19"></span>
        <span class="fur-18"></span>
        <span class="fur-17"></span>
        <span class="fur-16"></span>
        <span class="fur-15"></span>
        <span class="fur-14"></span>
        <span class="fur-13"></span>
        <span class="fur-12"></span>
        <span class="fur-11"></span>
        <span class="fur-10"></span>
        <span class="fur-9"></span>
        <span class="fur-8"></span>
        <span class="fur-7"></span>
        <span class="fur-6"></span>
        <span class="fur-5"></span>
        <span class="fur-4"></span>
        <span class="fur-3"></span>
        <span class="fur-2"></span>
        <span class="fur-1"></span>
      </div>
    </div>
  </div>
</div>

<style>
/* Base Styles */
/*
html,
body,
.wrapper {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
*/
/* Note: body/html styles are global, usually handled elsewhere, but component should fill container */

:root {
  --bg-color: #000000;
  --base-color: #00a8ff;
  --glow-color: rgba(0, 168, 255, 0.8);
  --accent-color: #00d4ff;
}

#container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-color);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  cursor: pointer;
}

.netflixintro {
  display: block;
  position: relative;
  width: 300px;
  height: 300px;
  overflow: hidden;
  animation-name: zoom-in;
  animation-delay: .5s;
  animation-duration: 3.5s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
  background-size: 4000px;
  background-position: -1950px 0;
}

.netflixintro::before {
  content: "";
  position: absolute;
  display: block;
  background-color: var(--bg-color);
  width: 150%;
  height: 30%;
  left: -25%;
  bottom: -27%;
  border-radius: 50%;
  z-index: 5;
  transform-origin: left center;
  background-size: 4000px;
  background-position: -1950px 0;
}

.netflixintro[letter="N"] {
  transform-origin: 30% center;
}

.netflixintro[letter="N"] .helper-1 {
  width: 19.5%;
  height: 100%;
  background-color: rgba(0, 102, 204, 0.5); /* var(--base-color) */
  left: 22.4%;
  top: 0;
  transform: rotate(180deg);
  animation-name: fading-lumieres-box;
  animation-duration: 2s;
  animation-delay: .6s;
  animation-fill-mode: forwards;
}

.netflixintro[letter="N"] .helper-1 .effect-brush {
  animation-name: brush-moving;
  animation-duration: 2.5s;
  animation-fill-mode: forwards;
  animation-delay: 1.2s;
}

.netflixintro[letter="N"] .helper-1 [class*="fur-"] {
  bottom: 0;
  height: 40%;
}

.netflixintro[letter="N"] .helper-3 {
  width: 19%;
  height: 150%;
  left: 40.5%;
  top: -25%;
  transform: rotate(-19.5deg);
  box-shadow: 0px 0px 35px -12px rgba(0, 0, 0, .4);
  overflow: hidden;
}

.netflixintro[letter="N"] .helper-3 .effect-brush {
  animation-name: brush-moving;
  animation-duration: 2s;
  animation-fill-mode: forwards;
  animation-delay: .8s;
}

.netflixintro[letter="N"] .helper-2 {
  width: 19.5%;
  height: 100%;
  left: 57.8%;
  top: 0;
  transform: rotate(180deg);
  overflow: hidden;
}

.netflixintro[letter="N"] .helper-2 .effect-brush {
  animation-name: brush-moving;
  animation-duration: 2s;
  animation-fill-mode: forwards;
  animation-delay: .5s;
}

[class*="helper-"] {
  position: absolute;
}

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
  background: linear-gradient(180deg, var(--accent-color) 0%, var(--base-color) 50%, #0055aa 100%);
  width: 100%;
  height: 70%;
  box-shadow: 
    0px 0px 40px 30px var(--glow-color),
    0px 0px 80px 50px rgba(0, 168, 255, 0.4),
    inset 0px 0px 20px rgba(255, 255, 255, 0.3);
}

[class*="fur-"] {
  display: block;
  position: absolute;
  bottom: 10%;
  height: 30%;
}

/* Animations */
@keyframes brush-moving {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100%); }
}

@keyframes fading-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
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

@keyframes zoom-in {
  0% { transform: scale(1); }
  100% { transform: scale(15); }
}

@keyframes showing-lumieres {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fading-lumieres-box {
  0% { background-color: rgba(0, 102, 204, 0.5); }
  100% { background-color: rgba(0, 102, 204, 0.0); }
}

.effect-lumieres {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    animation-name: showing-lumieres;
    animation-duration: 2s;
    animation-delay: 1.6s;
    animation-fill-mode: forwards;
}

[class*="lamp-"] {
    position: absolute;
    display: block;
    height: 100%;
    box-shadow: 0px 0px 10px 0px rgba(0, 102, 204, 0.75);
    background: var(--color);
}

[class*="lamp-"]::before {
    position: absolute;
    content: " ";
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color);
    box-shadow: 0px 0px 10px 0px rgba(0, 102, 204, 0.75);
}

/* IMPORTED GENERATED CSS */
.fur-1 {
    left: 0%;
    width: 3.8%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 15%, rgba(0, 0, 0, 0) 81%, rgba(0, 0, 0, 0) 100%);
}
.fur-2 {
    left: 3.8%;
    width: 2.8%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 10%, rgba(0, 0, 0, 0) 62%, rgba(0, 0, 0, 0) 100%);
}
.fur-3 {
    left: 6.6%;
    width: 4.8%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 37%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-4 {
    left: 11.4%;
    width: 4%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 23%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-5 {
    left: 15.4%;
    width: 4%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 15%, rgba(0, 0, 0, 0) 86%, rgba(0, 0, 0, 0) 100%);
}
.fur-6 {
    left: 19.4%;
    width: 2.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 27%, rgba(0, 0, 0, 0) 89%, rgba(0, 0, 0, 0) 100%);
}
.fur-7 {
    left: 21.9%;
    width: 4%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 20%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-8 {
    left: 25.9%;
    width: 2%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 30%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-9 {
    left: 27.9%;
    width: 4%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 35%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 0) 100%);
}
.fur-10 {
    left: 31.9%;
    width: 3.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 39%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 0) 100%);
}
.fur-11 {
    left: 35.4%;
    width: 2%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 34%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 0) 100%);
}
.fur-12 {
    left: 37.4%;
    width: 2.6%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 22%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 0) 100%);
}
.fur-13 {
    left: 40%;
    width: 6%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 47%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-14 {
    left: 46%;
    width: 2%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 36%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-15 {
    left: 48%;
    width: 5.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 29%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-16 {
    left: 53.5%;
    width: 3%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 39%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 0) 100%);
}
.fur-17 {
    left: 56.5%;
    width: 4.1%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 45%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-18 {
    left: 60.6%;
    width: 2.4%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 34%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-19 {
    left: 63%;
    width: 4%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 47%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-20 {
    left: 67%;
    width: 1.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 27%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 0) 100%);
}
.fur-21 {
    left: 68.5%;
    width: 2.8%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 37%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-22 {
    left: 71.3%;
    width: 2.3%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 9%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-23 {
    left: 73.6%;
    width: 2.2%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 28%, rgba(0, 0, 0, 0) 92%, rgba(0, 0, 0, 0) 100%);
}
.fur-24 {
    left: 75.8%;
    width: 1%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 37%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-25 {
    left: 76.8%;
    width: 2.1%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 28%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-26 {
    left: 78.9%;
    width: 4.1%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 34%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-27 {
    left: 83%;
    width: 2.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 21%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-28 {
    left: 85.5%;
    width: 4.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 39%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-29 {
    left: 90%;
    width: 2.8%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 30%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-30 {
    left: 92.8%;
    width: 3.5%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 19%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.fur-31 {
    left: 96.3%;
    width: 3.7%;
    background: linear-gradient(to bottom, #0066cc 0%, #0066cc 37%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%);
}
.lamp-1 {
    --color: #ff0100;
    left: 0.7%;
    width: 1%;
    animation-delay: 0.97s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-1::before {
    left: 59%;
    animation-delay: 0.96s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-2 {
    --color: #ffde01;
    left: 2.2%;
    width: 1.4%;
    animation-delay: 0.08s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-2::before {
    left: 83%;
    animation-delay: 0.09s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-3 {
    --color: #ff00cc;
    left: 5.8%;
    width: 2.1%;
    animation-delay: 0.92s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-3::before {
    left: 61%;
    animation-delay: 1.62s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-4 {
    --color: #04fd8f;
    left: 10.1%;
    width: 2%;
    animation-delay: 1.46s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-4::before {
    left: 80%;
    animation-delay: 1.28s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-5 {
    --color: #ff0100;
    left: 12.9%;
    width: 1.4%;
    animation-delay: 0.1s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-5::before {
    left: 35%;
    animation-delay: 1.9s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-6 {
    --color: #ff9600;
    left: 15.3%;
    width: 2.8%;
    animation-delay: 0.81s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-6::before {
    left: 3%;
    animation-delay: 0.71s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-7 {
    --color: #0084ff;
    left: 21.2%;
    width: 2.5%;
    animation-delay: 0.8s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-7::before {
    left: 90%;
    animation-delay: 1.26s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-8 {
    --color: #f84006;
    left: 25%;
    width: 2.5%;
    animation-delay: 0.85s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-8::before {
    left: 0%;
    animation-delay: 1.86s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-9 {
    --color: #ffc601;
    left: 30.5%;
    width: 3%;
    animation-delay: 1.88s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-9::before {
    left: 40%;
    animation-delay: 1.62s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-10 {
    --color: #ff4800;
    left: 36.3%;
    width: 3%;
    animation-delay: 0.36s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-10::before {
    left: 74%;
    animation-delay: 1.83s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-11 {
    --color: #fd0100;
    left: 41%;
    width: 2.2%;
    animation-delay: 1.63s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-11::before {
    left: 52%;
    animation-delay: 1.28s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-12 {
    --color: #01ffff;
    left: 44.2%;
    width: 2.6%;
    animation-delay: 0.59s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-12::before {
    left: 60%;
    animation-delay: 1.48s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-13 {
    --color: #ffc601;
    left: 51.7%;
    width: 0.5%;
    animation-delay: 0.92s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-13::before {
    left: 85%;
    animation-delay: 0.37s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-14 {
    --color: #ffc601;
    left: 52.1%;
    width: 1.8%;
    animation-delay: 1.72s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-14::before {
    left: 7%;
    animation-delay: 1.12s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-15 {
    --color: #0078fe;
    left: 53.8%;
    width: 2.3%;
    animation-delay: 0.28s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-15::before {
    left: 91%;
    animation-delay: 1.32s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-16 {
    --color: #0080ff;
    left: 57.2%;
    width: 2%;
    animation-delay: 1.22s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-16::before {
    left: 95%;
    animation-delay: 0.28s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-17 {
    --color: #ffae01;
    left: 62.3%;
    width: 2.9%;
    animation-delay: 0.09s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-17::before {
    left: 59%;
    animation-delay: 0.26s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-18 {
    --color: #ff00bf;
    left: 65.8%;
    width: 1.7%;
    animation-delay: 0.45s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-18::before {
    left: 53%;
    animation-delay: 1.16s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-19 {
    --color: #a601f4;
    left: 72.8%;
    width: 0.8%;
    animation-delay: 0.71s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-19::before {
    left: 46%;
    animation-delay: 0.38s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-20 {
    --color: #f30b34;
    left: 74.3%;
    width: 2%;
    animation-delay: 0.33s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-20::before {
    left: 81%;
    animation-delay: 0.74s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-21 {
    --color: #ff00bf;
    left: 79.8%;
    width: 2%;
    animation-delay: 1.41s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-21::before {
    left: 80%;
    animation-delay: 1.05s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-22 {
    --color: #04fd8f;
    left: 78.2%;
    width: 2%;
    animation-delay: 0.66s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-22::before {
    left: 86%;
    animation-delay: 2.0s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-23 {
    --color: #01ffff;
    left: 78.5%;
    width: 2%;
    animation-delay: 0.85s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-23::before {
    left: 86%;
    animation-delay: 1.91s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-24 {
    --color: #a201ff;
    left: 85.3%;
    width: 1.1%;
    animation-delay: 0.83s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-24::before {
    left: 19%;
    animation-delay: 1.31s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-25 {
    --color: #ec0014;
    left: 86.9%;
    width: 1.1%;
    animation-delay: 0.37s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-25::before {
    left: 53%;
    animation-delay: 1.48s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-26 {
    --color: #0078fe;
    left: 88.8%;
    width: 2%;
    animation-delay: 0.73s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-26::before {
    left: 82%;
    animation-delay: 1.34s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}
.lamp-27 {
    --color: #ff0036;
    left: 92.4%;
    width: 2.4%;
    animation-delay: 1.38s;
    animation-name: lumieres-moving-left;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-27::before {
    left: 61%;
    animation-delay: 1.84s;
    animation-name: lumieres-moving-left;
    animation-duration: 2.5s;
}
.lamp-28 {
    --color: #06f98c;
    left: 96.2%;
    width: 2.1%;
    animation-delay: 0.83s;
    animation-name: lumieres-moving-right;
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}
.lamp-28::before {
    left: 51%;
    animation-delay: 1.37s;
    animation-name: lumieres-moving-right;
    animation-duration: 2.5s;
}

</style>
