<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let lines: string[] = [];
  let showCursor = true;
  let showRasterBars = false;
  let showLogo = false;
  
  // Audio context for generating simple beeps if needed (optional, keeping it visual for now)
  
  onMount(() => {
    // Blinking cursor
    const cursorInterval = setInterval(() => {
      showCursor = !showCursor;
    }, 500);

    const runSequence = async () => {
      // Sequence
      await delay(1000);
      addLine(" **** COMMODORE 64 BASIC V2 ****");
      await delay(500);
      addLine(" 64K RAM SYSTEM  38911 BASIC BYTES FREE");
      await delay(1000);
      addLine("READY.");
      await delay(1000);
      
      await typeLine('LOAD "POLDI",8,1');
      await delay(500);
      addLine("SEARCHING FOR POLDI");
      await delay(800);
      addLine("LOADING");
      await delay(500);

      // Raster bars effect
      showRasterBars = true;
      await delay(2500);
      showRasterBars = false;
      
      addLine("READY.");
      await delay(500);
      await typeLine("RUN");
      await delay(500);
      
      // Logo sequence
      lines = []; // Clear screen
      showLogo = true;
      
      await delay(3000);
      
      dispatch('complete');
    };

    runSequence();

    return () => clearInterval(cursorInterval);
  });

  function addLine(text: string) {
    lines = [...lines, text];
    scrollToBottom();
  }

  async function typeLine(text: string) {
    let current = "";
    // Temporarily add a line that we will update
    lines = [...lines, ""];
    const lineIndex = lines.length - 1;
    
    for (let char of text) {
      current += char;
      lines[lineIndex] = current;
      scrollToBottom();
      await delay(50 + Math.random() * 50); // Typing speed
    }
  }

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function scrollToBottom() {
      // Logic to auto-scroll if needed, but we'll fit in screen mostly
      // With Svelte we might need to tick() but let's see
  }
</script>

<div class="c64-screen" on:click={() => dispatch('complete')}> <!-- Click to skip -->
  <div class="c64-border">
    <div class="c64-container">
      {#if showLogo}
        <div class="logo-container">
           <div class="bouncing-logo">
             <span class="poldi-text">POLDI</span>
             <span class="poldi-sub">APP</span>
           </div>
           <p class="press-start">PRESS SPACE OR CLICK TO START</p>
        </div>
      {:else}
        <div class="terminal">
          {#each lines as line}
            <div class="line">{line}</div>
          {/each}
          {#if !showLogo}
             <div class="line cursor-line">
                {#if showCursor}<span class="cursor">REPLACEME</span>{/if}
             </div>
          {/if}
        </div>
      {/if}
      
      {#if showRasterBars}
        <div class="raster-bars"></div>
      {/if}
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .c64-screen {
    width: 100vw;
    height: 100vh;
    background-color: #A9A4F5; /* Light Blue Border */
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Press Start 2P', monospace;
    cursor: pointer;
  }
  
  /* Authentic C64 Palette approx */
  /* Border: Light Blue #887ECB or #9A94E5 */
  /* BG: Dark Blue #40318D */
  /* Text: Light Blue #887ECB */
  
  .c64-border {
     width: 100%;
     height: 100%;
     padding: 40px; /* CRT Border */
     background-color: #9A94E5; /* Authentic Light Blue */
     box-sizing: border-box;
     display: flex;
     justify-content: center;
     align-items: center;
  }

  .c64-container {
    width: 100%;
    height: 100%;
    background-color: #3B329A; /* Authentic Dark Blue */
    color: #9A94E5; /* Light Blue Text */
    padding: 20px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.5); /* CRT curve shadow maybe */
  }

  .terminal {
    font-size: 16px; /* C64 was 40x25 characters, 16px is decent for modern screens */
    line-height: 1.5;
    text-transform: uppercase;
    text-align: left;
  }

  .line {
    white-space: pre-wrap;
    min-height: 1.5em; /* Maintain height for empty lines */
  }
  
  .cursor-line {
      min-height: 1.5em;
  }

  .cursor {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-color: #9A94E5;
    color: #3B329A; /* Inverted for cursor block */
    vertical-align: middle;
  }
  
  /* Make the cursor look like a block */
  .cursor {
     content: " "; 
     /* Actually C64 cursor is a flashing block */
     width: 0.8em;
     height: 1em;
     margin-bottom: -2px;
  }
  /* Hack to make the cursor visible text "REPLACEME" hidden but block shown? 
     No, let's just make it a block.
  */
  .cursor {
      font-size: 0; /* Hide text */
      width: 16px;
      height: 16px;
  }

  .raster-bars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255,255,255,0.5) 10%,
      rgba(255,0,0,0.5) 20%,
      rgba(0,255,0,0.5) 30%,
      rgba(0,0,255,0.5) 40%,
      transparent 50%
    );
    background-size: 100% 200%;
    animation: raster 0.1s linear infinite;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  @keyframes raster {
    0% { background-position: 0% 0%; }
    100% { background-position: 0% 200%; }
  }

  .logo-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  }

  .bouncing-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
  }

  .poldi-text {
      font-size: 80px;
      color: #FFFF00; /* Yellow */
      text-shadow: 4px 4px 0 #000;
      animation: bounce 1.5s infinite ease-in-out;
      background: -webkit-linear-gradient(#FFFF00, #FF6600);
      -webkit-background-clip: text;
      /* -webkit-text-fill-color: transparent; Text fill breaks shadow sometimes */
  }

  .poldi-sub {
      font-size: 40px;
      color: #00FF00;
      margin-top: 10px;
  }

  .press-start {
      margin-top: 40px;
      font-size: 20px;
      color: white;
      animation: blink 0.5s infinite;
  }

  @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
  }

  @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
  }
</style>
