<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, startExamSequence, resetToMenu } from '$lib/core/StateManager';
  import { speechEngine } from '$lib/core/SpeechEngine';
  import { audioEngine } from '$lib/core/AudioEngine';
  import CanvasRenderer from '$lib/components/canvas/CanvasRenderer.svelte';
  import SettingsModal from '$lib/components/SettingsModal.svelte';
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';

  // Import exercises to register them
  import '$lib/exercises';

  // Import module library
  import { poldiModules, demoModule, shortTestModule, getShuffledModules } from '$lib/data/modules';
  import { settings } from '$lib/stores/settings';

  let started = false;
  let showSettings = false;
  let isPaused = false;

  function backToMenu() {
    started = false;
    isPaused = false;
    resetToMenu();
  }

  function togglePause() {
    isPaused = !isPaused;
  }

  function startDemo() {
    console.log('Start Demo clicked');
    started = true;
    startExamSequence([demoModule]);
    console.log('Started:', started, 'Game state should be MODULE_INTRO');

    // Immediately transition to first task for demo
    setTimeout(() => {
      console.log('Auto-starting first task');
      import('$lib/core/StateManager').then(({ startTask }) => {
        startTask();
      });
    }, 500);
  }

  function startShortTest() {
    console.log('Start Short Test clicked');
    started = true;
    startExamSequence([shortTestModule]);

    setTimeout(() => {
      import('$lib/core/StateManager').then(({ startTask }) => {
        startTask();
      });
    }, 500);
  }

  function startFullTest() {
    console.log('Start Full Test clicked');
    started = true;

    // Use shuffled modules if enabled
    const modulesToUse = $settings.shuffleExercises || $settings.shuffleModules
      ? getShuffledModules()
      : poldiModules;

    startExamSequence(modulesToUse);

    // Auto-start first task
    setTimeout(() => {
      import('$lib/core/StateManager').then(({ startTask }) => {
        startTask();
      });
    }, 500);
  }

  function startSingleModule(moduleIndex: number) {
    console.log('Starting module:', poldiModules[moduleIndex].title);
    started = true;

    // Use shuffled exercises if enabled
    const modulesToUse = $settings.shuffleExercises
      ? getShuffledModules()
      : poldiModules;

    startExamSequence(modulesToUse);

    // Start at specific module
    import('$lib/core/StateManager').then(({ startModule }) => {
      setTimeout(() => {
        startModule(moduleIndex);
      }, 100);

      setTimeout(() => {
        import('$lib/core/StateManager').then(({ startTask }) => {
          startTask();
        });
      }, 500);
    });
  }

  async function testSpeech() {
    console.log('Test Speech button clicked');

    // Check available voices
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.length);
    console.log('Voices:', voices.map(v => `${v.name} (${v.lang})`));

    // Try with no voice specified first
    const testUtterance = new SpeechSynthesisUtterance('Hello test');
    testUtterance.lang = 'en-US';
    testUtterance.rate = 1.0;
    testUtterance.volume = 1.0;
    testUtterance.onstart = () => console.log('Direct test: STARTED!');
    testUtterance.onend = () => console.log('Direct test: ENDED!');
    testUtterance.onerror = (e) => console.error('Direct test ERROR:', e);

    console.log('SpeechSynthesis state:', {
      speaking: window.speechSynthesis.speaking,
      pending: window.speechSynthesis.pending,
      paused: window.speechSynthesis.paused
    });

    console.log('Calling window.speechSynthesis.speak()');
    window.speechSynthesis.speak(testUtterance);

    console.log('After speak() - state:', {
      speaking: window.speechSynthesis.speaking,
      pending: window.speechSynthesis.pending,
      paused: window.speechSynthesis.paused
    });
  }

  async function testSound() {
    console.log('Test Sound button clicked');
    try {
      await audioEngine.playSound('success');
      console.log('Sound completed');
    } catch (error) {
      console.error('Sound error:', error);
      alert('Sound error: ' + error);
    }
  }
</script>

<main>
  {#if !started}
    <div class="menu">

      <div class="logo">
        <div class="poldi-icon">🐸</div>
        <h1>Poldi App</h1>
        <p class="subtitle">Schuleingangsscreening - Refactored Version</p>
      </div>

      <div class="info-panel">
        <h2>✅ Comprehensive Exercise Library</h2>
        <ul>
          <li>✅ <strong>14 Exercise Types</strong> - All implemented</li>
          <li>✅ <strong>8 Modules</strong> - 288 exercises total</li>
          <li>✅ <strong>Authentic SES Content</strong> - Based on official materials</li>
          <li>✅ <strong>Speech & Audio</strong> - German TTS working</li>
        </ul>

        <h2>📚 Available Modules</h2>
        <ol>
          <li><strong>Reime & Laute</strong> - 36 Aufgaben (Phonologie)</li>
          <li><strong>Anfangslaute</strong> - 36 Aufgaben (Letter Sounds)</li>
          <li><strong>Mengen</strong> - 36 Aufgaben (Quantities)</li>
          <li><strong>Zählen</strong> - 36 Aufgaben (Counting)</li>
          <li><strong>Zahlen merken</strong> - 36 Aufgaben (Working Memory)</li>
          <li><strong>Genau hinschauen</strong> - 36 Aufgaben (Visual)</li>
          <li><strong>Nachzeichnen</strong> - 36 Aufgaben (Graphomotor)</li>
          <li><strong>Wo ist was?</strong> - 36 Aufgaben (Spatial)</li>
        </ol>
      </div>

      <div class="buttons">
        <button class="btn-settings" on:click={() => showSettings = true}>
          ⚙️ Einstellungen
        </button>

        <div class="button-divider"></div>

        <button class="btn-primary" on:click={startFullTest}>
          🎯 Vollständiger Test (288 Aufgaben)
        </button>

        <button class="btn-primary-outline" on:click={startShortTest}>
          ⚡ Kurzer Test (8 Aufgaben)
        </button>

        <button class="btn-primary-outline" on:click={startDemo}>
          🎮 Demo (3 Aufgaben)
        </button>

        <div class="button-divider"></div>

        <h3 style="margin: 1rem 0 0.5rem; color: #333; font-size: 1rem;">Einzelne Module testen:</h3>

        <div class="module-grid">
          <button class="btn-module" on:click={() => startSingleModule(0)}>
            1. Reime & Laute
          </button>
          <button class="btn-module" on:click={() => startSingleModule(1)}>
            2. Anfangslaute
          </button>
          <button class="btn-module" on:click={() => startSingleModule(2)}>
            3. Mengen
          </button>
          <button class="btn-module" on:click={() => startSingleModule(3)}>
            4. Zählen
          </button>
          <button class="btn-module" on:click={() => startSingleModule(4)}>
            5. Zahlen merken
          </button>
          <button class="btn-module" on:click={() => startSingleModule(5)}>
            6. Genau hinschauen
          </button>
          <button class="btn-module" on:click={() => startSingleModule(6)}>
            7. Nachzeichnen
          </button>
          <button class="btn-module" on:click={() => startSingleModule(7)}>
            8. Wo ist was?
          </button>
        </div>

        <div class="button-divider"></div>

        <button class="btn-secondary" on:click={testSpeech}>
          🔊 Test Speech
        </button>

        <button class="btn-secondary" on:click={testSound}>
          🎵 Test Sound
        </button>
      </div>

      <div class="tech-info">
        <p><strong>Tech Stack:</strong> Svelte 5 + TypeScript + Vite</p>
        <p><strong>Architecture:</strong> Plugin-based exercise system</p>
        <p><strong>Phase:</strong> 2 of 6 complete (Foundation + Pilots)</p>
      </div>
    </div>
  {:else if $gameState === 'RESULTS'}
    <ResultsDisplay on:restart={backToMenu} />
  {:else}
    <div class="test-view">
      <ProgressBar />

      <div class="control-buttons">
        <button class="control-btn" on:click={backToMenu} title="Zurück zum Menü">
          🏠
        </button>
        <button class="control-btn" on:click={togglePause} title={isPaused ? 'Fortsetzen' : 'Pause'}>
          {isPaused ? '▶️' : '⏸️'}
        </button>
        <button class="control-btn" on:click={() => showSettings = true} title="Einstellungen">
          ⚙️
        </button>
      </div>

      {#if isPaused}
        <div class="pause-overlay">
          <div class="pause-card">
            <h2>⏸️ Pause</h2>
            <p>Drücke ▶️ um fortzufahren</p>
            <button class="btn-primary" on:click={togglePause}>
              Weiter
            </button>
          </div>
        </div>
      {:else}
        <CanvasRenderer />
      {/if}
    </div>
  {/if}
</main>

<!-- Settings Modal -->
{#if showSettings}
  <SettingsModal on:close={() => showSettings = false} />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .test-view {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-top: 90px; /* Account for fixed progress bar */
    box-sizing: border-box;
  }

  .menu {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    max-width: 600px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
  }

  .logo {
    margin-bottom: 2rem;
  }

  .poldi-icon {
    font-size: 80px;
    margin-bottom: 1rem;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  h1 {
    color: #333;
    margin: 0;
    font-size: 2.5rem;
  }

  .subtitle {
    color: #666;
    margin-top: 0.5rem;
    font-size: 1rem;
  }

  .info-panel {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 2rem 0;
    text-align: left;
  }

  .info-panel h2 {
    color: #333;
    font-size: 1.2rem;
    margin-top: 0;
  }

  .info-panel ul, .info-panel ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .info-panel li {
    margin: 0.5rem 0;
    color: #555;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem 0;
  }

  button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  .btn-primary-outline {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-primary-outline:hover {
    background: #f0f0ff;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }

  .button-divider {
    height: 1px;
    background: #e0e0e0;
    margin: 0.5rem 0;
  }

  .module-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  .btn-module {
    background: #f8f9fa;
    color: #667eea;
    border: 1px solid #e0e0e0;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .btn-module:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }

  .tech-info {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
  }

  .tech-info p {
    color: #666;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .btn-settings {
    background: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-settings:hover {
    background: #e0e0e0;
    transform: translateY(-1px);
  }

  .control-buttons {
    position: fixed;
    top: 80px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 950;
  }

  .control-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .control-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  }

  .pause-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
  }

  .pause-card {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .pause-card h2 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 2rem;
  }

  .pause-card p {
    color: #666;
    margin: 0 0 2rem 0;
  }
</style>
