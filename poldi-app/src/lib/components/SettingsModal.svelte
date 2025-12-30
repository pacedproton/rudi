<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function resetSettings() {
    if (confirm('Alle Einstellungen zurücksetzen?')) {
      settings.reset();
    }
  }
</script>

<div class="modal-overlay" on:click={close} role="button" tabindex="0">
  <div class="modal-content" on:click|stopPropagation role="dialog">
    <div class="modal-header">
      <h2>⚙️ Einstellungen</h2>
      <button class="close-btn" on:click={close}>×</button>
    </div>

    <div class="modal-body">
      <!-- Audio Settings -->
      <section>
        <h3>🔊 Audio</h3>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.speechEnabled}
              on:change={() => settings.update((s) => s)}
            />
            <span>Sprache aktiviert</span>
          </label>
        </div>

        {#if $settings.speechEnabled}
          <div class="setting-item">
            <label>
              Sprechgeschwindigkeit: {$settings.speechRate.toFixed(1)}x
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                bind:value={$settings.speechRate}
                on:change={() => settings.update((s) => s)}
              />
            </label>
          </div>

          <div class="setting-item">
            <label>
              Sprachlautstärke: {Math.round($settings.speechVolume * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                bind:value={$settings.speechVolume}
                on:change={() => settings.update((s) => s)}
              />
            </label>
          </div>
        {/if}

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.soundEnabled}
              on:change={() => settings.update((s) => s)}
            />
            <span>Soundeffekte aktiviert</span>
          </label>
        </div>

        {#if $settings.soundEnabled}
          <div class="setting-item">
            <label>
              Sound-Lautstärke: {Math.round($settings.soundVolume * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                bind:value={$settings.soundVolume}
                on:change={() => settings.update((s) => s)}
              />
            </label>
          </div>
        {/if}
      </section>

      <!-- Exercise Settings -->
      <section>
        <h3>📝 Übungen</h3>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.shuffleExercises}
              on:change={() => settings.update((s) => s)}
            />
            <span>Übungen mischen</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.shuffleModules}
              on:change={() => settings.update((s) => s)}
            />
            <span>Module mischen</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.autoAdvance}
              on:change={() => settings.update((s) => s)}
            />
            <span>Auto-Weiter nach korrekter Antwort</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            Feedback-Dauer: {$settings.feedbackDuration}ms
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              bind:value={$settings.feedbackDuration}
              on:change={() => settings.update((s) => s)}
            />
          </label>
        </div>

        <div class="setting-item">
          <label>
            Schwierigkeitsgrad:
            <select bind:value={$settings.difficultyLevel} on:change={() => settings.update((s) => s)}>
              <option value="easy">Einfach</option>
              <option value="medium">Mittel</option>
              <option value="hard">Schwer</option>
              <option value="mixed">Gemischt</option>
            </select>
          </label>
        </div>
      </section>

      <!-- Display Settings -->
      <section>
        <h3>🎨 Anzeige</h3>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.showProgress}
              on:change={() => settings.update((s) => s)}
            />
            <span>Fortschritt anzeigen</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.showScore}
              on:change={() => settings.update((s) => s)}
            />
            <span>Punkte anzeigen</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.showTimer}
              on:change={() => settings.update((s) => s)}
            />
            <span>Timer anzeigen</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.animations}
              on:change={() => settings.update((s) => s)}
            />
            <span>Animationen</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.particlesEnabled}
              on:change={() => settings.update((s) => s)}
            />
            <span>Partikel-Effekte</span>
          </label>
        </div>
      </section>

      <!-- Accessibility -->
      <section>
        <h3>♿ Barrierefreiheit</h3>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.highContrast}
              on:change={() => settings.update((s) => s)}
            />
            <span>Hoher Kontrast</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.largeText}
              on:change={() => settings.update((s) => s)}
            />
            <span>Große Schrift</span>
          </label>
        </div>

        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              bind:checked={$settings.reducedMotion}
              on:change={() => settings.update((s) => s)}
            />
            <span>Bewegung reduzieren</span>
          </label>
        </div>
      </section>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" on:click={resetSettings}>
        Zurücksetzen
      </button>
      <button class="btn-primary" on:click={close}>
        Fertig
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e0e0;
  }

  .modal-header h2 {
    margin: 0;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f0f0f0;
    color: #333;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  section {
    margin-bottom: 32px;
  }

  section:last-child {
    margin-bottom: 0;
  }

  h3 {
    color: #667eea;
    margin: 0 0 16px 0;
    font-size: 1.1rem;
  }

  .setting-item {
    margin-bottom: 16px;
  }

  .setting-item label {
    display: block;
    color: #333;
    font-weight: 500;
  }

  .setting-item input[type="checkbox"] {
    margin-right: 8px;
    cursor: pointer;
  }

  .setting-item input[type="range"] {
    width: 100%;
    margin-top: 8px;
    cursor: pointer;
  }

  .setting-item select {
    width: 100%;
    padding: 8px 12px;
    margin-top: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: #667eea;
    color: white;
  }

  .btn-primary:hover {
    background: #5568d3;
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }
</style>
