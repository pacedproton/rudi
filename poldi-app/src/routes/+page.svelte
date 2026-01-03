<script lang="ts">
  import NetflixIntro from '$lib/components/NetflixIntro.svelte';
  import { flinkiModules } from '$lib/data/modules';
  import { goto } from '$app/navigation';

  let isLoading = true;

  function handleIntroComplete() {
    isLoading = false;
  }

  function startModule(moduleId: string) {
    goto(`/exercises?module=${moduleId}`);
  }

  function startFullTest() {
    goto('/exercises?mode=full');
  }

  function startShortTest() {
    goto('/exercises?mode=short');
  }

  function startDemo() {
    goto('/exercises?mode=demo');
  }
</script>

<main>
  {#if isLoading}
    <NetflixIntro onComplete={handleIntroComplete} />
  {:else}
    <div class="menu">
      <div class="logo">
        <div class="flinki-icon">🐸</div>
        <h1>Flinki App</h1>
        <p class="subtitle">Schuleingangsscreening - Refactored Version</p>
      </div>

      <div class="info-panel">
        <h2>✅ Comprehensive Exercise Library</h2>
        <ul>
          <li>✅ <strong>18 Exercise Types</strong> - All implemented</li>
          <li>✅ <strong>10 Modules</strong> - 336 exercises total</li>
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
        <button class="btn-settings" on:click={() => {}}>
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
          {#each flinkiModules as module, i}
            <button class="btn-module" on:click={() => startModule(module.id)}>
              {i + 1}. {module.title}
            </button>
          {/each}
        </div>

        <div class="button-divider"></div>

        <button class="btn-secondary" on:click={() => {}}>
          🔊 Test Speech
        </button>

        <button class="btn-secondary" on:click={() => {}}>
          🎵 Test Sound
        </button>
      </div>

      <div class="tech-info">
      </div>
    </div>
  {/if}
</main>

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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 2rem;
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

  .flinki-icon {
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

  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .loading-content {
    text-align: center;
    color: white;
  }

  .loading-content .flinki-icon {
    font-size: 80px;
    margin-bottom: 1rem;
    animation: bounce 2s infinite;
  }

  .loading-content h1 {
    font-size: 3rem;
    margin: 0 0 1rem 0;
  }

  .loading-content p {
    font-size: 1.2rem;
    margin: 0 0 2rem 0;
  }

  .loading-bar {
    width: 300px;
    height: 8px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;
  }

  .loading-progress {
    height: 100%;
    background: white;
    border-radius: 4px;
    animation: progress 2s ease-out forwards;
  }

  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
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

  .flinki-icon {
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
