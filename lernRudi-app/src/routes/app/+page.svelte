<script lang="ts">
  import NetflixIntro from '$lib/components/NetflixIntro.svelte';
  import { flinkiModules } from '$lib/data/modules';
  import { writingModules } from '$lib/data/writing-modules';
  import { currentWritingFamily } from '$lib/stores/writingMastery';
  import { LETTER_FAMILIES } from '$lib/data/letter-forms';
  import { goto } from '$app/navigation';
  import { speechEngine } from '$lib/core/SpeechEngine';
  import { audioEngine } from '$lib/core/AudioEngine';
  import { settings } from '$lib/stores/settings';
  import { auth, currentUser, isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  let isLoading = true;
  let showSettings = false;
  let showAccountMenu = false;

  // Check if user is admin
  const ADMIN_EMAILS = ['admin@lern-rudi.at', 'mike@example.com'];
  $: isAdmin = $currentUser?.email && ADMIN_EMAILS.includes($currentUser.email.toLowerCase());
  $: sesTaskCount = flinkiModules.reduce((sum, module) => sum + module.tasks.length, 0);

  onMount(async () => {
    // Try to validate existing session
    await auth.validateSession();
  });

  function handleIntroComplete() {
    isLoading = false;
  }

  function startModule(moduleId: string) {
    goto(`/app/exercises?module=${moduleId}`);
  }

  function startFullTest() {
    goto('/app/exercises?mode=full');
  }

  function startShortTest() {
    goto('/app/exercises?mode=short');
  }

  function startDemo() {
    goto('/app/exercises?mode=demo');
  }

  function startBonusModule(moduleId: string) {
    goto(`/app/exercises?bonus=${moduleId}`);
  }

  function testSpeech() {
    speechEngine.speak('Hallo! Ich bin Rudi. Lass uns zusammen lernen!');
  }

  function testSound() {
    audioEngine.playSound('success');
    setTimeout(() => audioEngine.playSound('wrong'), 1000);
    setTimeout(() => audioEngine.playSound('pop'), 2000);
  }

  async function handleLogout() {
    await auth.logout();
    showAccountMenu = false;
    goto('/');
  }
</script>

<main>
  {#if isLoading}
    <NetflixIntro onComplete={handleIntroComplete} />
  {:else}
    <!-- Account Menu (Top Right) -->
    <div class="account-corner">
      {#if $isAuthenticated && $currentUser}
        <button class="account-btn" on:click={() => showAccountMenu = !showAccountMenu}>
          <span class="avatar-icon">👤</span>
          <span class="user-name">{$currentUser.displayName || $currentUser.email.split('@')[0]}</span>
          <span class="dropdown-arrow">{showAccountMenu ? '▲' : '▼'}</span>
        </button>
        
        {#if showAccountMenu}
          <div class="account-dropdown">
            <div class="dropdown-header">
              <span class="dropdown-email">{$currentUser.email}</span>
              <span class="dropdown-plan">{$currentUser.subscription === 'paid' ? '⭐ Premium' : '🆓 Free'}</span>
            </div>
            <div class="dropdown-divider"></div>
            <a href="/app/account" class="dropdown-item" on:click={() => showAccountMenu = false}>
              👤 Mein Konto
            </a>
            {#if isAdmin}
              <a href="/app/admin" class="dropdown-item admin-link" on:click={() => showAccountMenu = false}>
                📊 Admin Dashboard
              </a>
            {/if}
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout" on:click={handleLogout}>
              🚪 Abmelden
            </button>
          </div>
        {/if}
      {:else}
        <a href="/login" class="login-btn">Anmelden</a>
      {/if}
    </div>

    <div class="menu">
      <div class="logo">
        <div class="flinki-icon">🐸</div>
        <h1>Lern-Rudi</h1>
        <p class="subtitle">Schuleingangsscreening Vorbereitung</p>
      </div>


      <div class="info-panel">
        <h2>✅ Umfassende Übungsbibliothek</h2>
        <ul>
          <li>✅ <strong>18 Übungstypen</strong> </li>
          <li>✅ <strong>{flinkiModules.length} Module</strong> - {sesTaskCount} Übungen gesamt</li>
          <li>✅ <strong>Schuleingangsscreening</strong> Vorbereitung</li>
          <li>✅ <strong>Sprache & Töne</strong> - Deutsche TTS aktiv</li>
        </ul>

        <h2>📚 Verfügbare Module</h2>
        <ol>
          <li><strong>Reime & Laute</strong> - 36 Aufgaben (Phonologie)</li>
          <li><strong>Anfangslaute</strong> - 36 Aufgaben (Buchstaben-Laute)</li>
          <li><strong>Mengen</strong> - 36 Aufgaben (Mengenerfassung)</li>
          <li><strong>Zählen</strong> - 36 Aufgaben (Zählkompetenz)</li>
          <li><strong>Zahlen merken</strong> - 36 Aufgaben (Arbeitsgedächtnis)</li>
          <li><strong>Genau hinschauen</strong> - 36 Aufgaben (Visuelle Wahrnehmung)</li>
          <li><strong>Nachzeichnen</strong> - 36 Aufgaben (Grafomotorik)</li>
          <li><strong>Wo ist was?</strong> - 36 Aufgaben (Räumliche Orientierung)</li>
          <li><strong>Zeichnen & Schreiben</strong> - 36 Aufgaben</li>
          <li><strong>Geschichten erzählen</strong> - 12 Aufgaben mit AI Feedback(🎤)</li>
          <li><strong>Silben klatschen</strong> - 24 Aufgaben (Neu! 👏)</li>
        </ol>
      </div>

      <div class="buttons">
        <button class="btn-settings" on:click={() => showSettings = !showSettings}>
          ⚙️ Einstellungen
        </button>

        {#if showSettings}
          <div class="settings-panel">
            <h4>⚙️ Einstellungen</h4>
            
            <label class="toggle-row">
              <span>🔊 Töne</span>
              <button 
                class="toggle-btn" 
                class:active={$settings.soundEnabled}
                on:click={() => settings.toggleSound()}
              >
                {$settings.soundEnabled ? 'Ein' : 'Aus'}
              </button>
            </label>
            
            <label class="toggle-row">
              <span>🗣️ Sprache</span>
              <button 
                class="toggle-btn" 
                class:active={$settings.speechEnabled}
                on:click={() => settings.toggleSpeech()}
              >
                {$settings.speechEnabled ? 'Ein' : 'Aus'}
              </button>
            </label>
            
            <label class="toggle-row">
              <span>✨ Animationen</span>
              <button 
                class="toggle-btn" 
                class:active={$settings.animations}
                on:click={() => settings.toggleAnimations()}
              >
                {$settings.animations ? 'Ein' : 'Aus'}
              </button>
            </label>
          </div>
        {/if}

        <div class="button-divider"></div>

        <button class="btn-primary" on:click={startFullTest}>
          Vollständiger Test ({sesTaskCount} Aufgaben)
        </button>

        <button class="btn-primary-outline" on:click={startShortTest}>
          Kurzer Test (8 Aufgaben)
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

        <h3 class="writing-heading">Schreiben lernen</h3>
        <p class="writing-note">
          Für Kinder, die schon lesen. Druckschrift in Buchstabenfamilien.
          Familie {$currentWritingFamily} von {LETTER_FAMILIES.length} ist offen.
        </p>
        <div class="module-grid">
          {#each writingModules as module}
            <button class="btn-module btn-writing" on:click={() => startModule(module.id)}>
              {module.title}
            </button>
          {/each}
        </div>

        <div class="button-divider"></div>

        <!-- Bonus Exercises Section -->
        <div class="bonus-section">
          <h3>🌟 Bonus Übungen</h3>
          <button class="btn-bonus" on:click={() => startBonusModule('bonus-realworld')}>
            🌍 Was gibt es in echt?
            <span class="bonus-desc">12 Fragen über echte Tiere</span>
          </button>
        </div>

        <div class="button-divider"></div>

        <button class="btn-secondary" on:click={testSpeech}>
          🔊 Sprache testen
        </button>

        <button class="btn-secondary" on:click={testSound}>
          🎵 Töne testen
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
    font-family: 'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    overflow-y: auto;
  }

  /* Account Corner Menu */
  .account-corner {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
  }

  .account-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    border: none;
    border-radius: 25px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
    font-family: inherit;
  }

  .account-btn:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  .avatar-icon {
    font-size: 1.2rem;
  }

  .user-name {
    font-weight: 600;
    color: #333;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-arrow {
    font-size: 0.7rem;
    color: #888;
  }

  .account-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    min-width: 220px;
    overflow: hidden;
  }

  .dropdown-header {
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
  }

  .dropdown-email {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  .dropdown-plan {
    font-size: 0.8rem;
    font-weight: 600;
    color: #667eea;
  }

  .dropdown-divider {
    height: 1px;
    background: #e0e0e0;
  }

  .dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: #333;
    font-size: 0.95rem;
    transition: background 0.2s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
  }

  .dropdown-item:hover {
    background: #f5f5f5;
  }

  .dropdown-item.admin-link {
    color: #667eea;
    font-weight: 600;
  }

  .dropdown-item.logout {
    color: #dc3545;
  }

  .login-btn {
    display: inline-block;
    background: white;
    color: #667eea;
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
  }

  .login-btn:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }


  main {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem 0 4rem 0;
    overflow-y: auto;
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .btn-secondary:hover {
    background: #e0e0e0;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn-secondary:active {
    transform: translateY(0) scale(0.98);
  }

  /* Bonus Section */
  .bonus-section {
    background: linear-gradient(135deg, #fff8e1 0%, #ffe082 100%);
    border-radius: 12px;
    padding: 1rem;
    margin: 0.5rem 0;
    border: 2px solid #ffc107;
  }

  .bonus-section h3 {
    margin: 0 0 0.75rem;
    color: #f57c00;
    font-size: 1rem;
  }

  .btn-bonus {
    width: 100%;
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
    transition: all 0.3s;
  }

  .btn-bonus:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.6);
  }

  .bonus-desc {
    font-size: 0.8rem;
    font-weight: normal;
    opacity: 0.9;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .btn-module:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-module:active {
    transform: translateY(0) scale(0.97);
  }

  .writing-heading {
    margin: 1rem 0 0.35rem;
    color: #333;
    font-size: 1rem;
  }

  .writing-note {
    margin: 0 0 0.5rem;
    color: #555;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .btn-writing {
    border-color: #c5cae9;
    background: #eef0fb;
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

  .settings-panel {
    background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
    border-radius: 12px;
    padding: 1.25rem;
    margin: 0.5rem 0;
    text-align: left;
    border: 1px solid #667eea;
  }

  .settings-panel h4 {
    margin: 0 0 1rem 0;
    color: #333;
    text-align: center;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .toggle-row:last-child {
    border-bottom: none;
  }

  .toggle-row span {
    font-weight: 600;
    color: #333;
  }

  .toggle-btn {
    padding: 0.4rem 1rem;
    border-radius: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #ccc;
    color: #666;
    min-width: 60px;
  }

  .toggle-btn.active {
    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  }

  .toggle-btn:hover {
    transform: scale(1.05);
  }

  .btn-settings {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    color: #333;
    border: 1px solid #ddd;
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
