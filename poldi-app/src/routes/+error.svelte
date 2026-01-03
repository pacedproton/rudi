<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { colors, font } from '$lib/data/colors';
  import { errorReporter } from '$lib/utils/errorReporting';

  let errorMessage = '';
  let showDetails = false;
  let recentReports: any[] = [];

  // Load recent error reports on mount
  $: if (typeof window !== 'undefined') {
    recentReports = errorReporter.getStoredReports().slice(0, 3);
  }

  $: status = $page.status;
  $: error = $page.error;

  $: isServerError = status >= 500 && status < 600;
  $: isClientError = status >= 400 && status < 500;
  $: isNotFound = status === 404;

  // Generate friendly error messages based on status code
  $: {
    if (isServerError) {
      errorMessage = 'Hoppla! Etwas ist auf unserem Server schiefgegangen. Aber keine Sorge - wir arbeiten daran!';
    } else if (isNotFound) {
      errorMessage = 'Diese Seite konnten wir leider nicht finden. Vielleicht ist sie umgezogen?';
    } else if (isClientError) {
      errorMessage = 'Da ist etwas nicht in Ordnung mit deiner Anfrage. Lass uns das gemeinsam beheben!';
    } else {
      errorMessage = 'Etwas Unerwartetes ist passiert. Aber wir helfen dir weiter!';
    }
  }

  function goHome() {
    goto('/');
  }

  function refreshPage() {
    window.location.reload();
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }

  function reportError() {
    // Report error using the error reporting utility
    errorReporter.report(
      error || `HTTP ${status} Error`,
      {
        status,
        url: window.location.href
      }
    );

    alert('Fehler wurde gemeldet! Vielen Dank für deine Hilfe.');
  }
</script>

<main class="error-page">
  <!-- Animated Background -->
  <div class="background">
    <div class="cloud cloud-1">☁️</div>
    <div class="cloud cloud-2">☁️</div>
    <div class="cloud cloud-3">☁️</div>
    <div class="floating-elements">
      {#each Array(15) as _, i}
        <div
          class="particle"
          style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 3}s; animation-duration: {2 + Math.random() * 2}s"
        ></div>
      {/each}
    </div>
  </div>

  <!-- Main Error Content -->
  <div class="error-container">
    <!-- Poldi Character -->
    <div class="poldi-error">
      <div class="poldi-character">
        <div class="poldi-body">
          <div class="poldi-head">
            <!-- Sad expression for errors -->
            <div class="poldi-eye left"></div>
            <div class="poldi-eye right"></div>
            <div class="poldi-mouth-sad"></div>
            <!-- Sweat drops for server errors -->
            {#if isServerError}
              <div class="sweat-drop drop-1"></div>
              <div class="sweat-drop drop-2"></div>
            {/if}
          </div>
          <div class="poldi-leg left"></div>
          <div class="poldi-leg right"></div>
        </div>
        <div class="shadow"></div>
      </div>

      <!-- Error speech bubble -->
      <div class="speech-bubble">
        <div class="speech-content">
          {#if isServerError}
            <div class="error-code">500</div>
            <div class="speech-text">Server-Fehler!</div>
          {:else if isNotFound}
            <div class="error-code">404</div>
            <div class="speech-text">Nicht gefunden!</div>
          {:else}
            <div class="error-code">{status}</div>
            <div class="speech-text">Fehler!</div>
          {/if}
        </div>
        <div class="speech-arrow"></div>
      </div>
    </div>

    <!-- Error Information -->
    <div class="error-info">
      <h1 class="error-title">
        {#if isServerError}
          🚧 Server-Probleme
        {:else if isNotFound}
          🔍 Seite nicht gefunden
        {:else if isClientError}
          ⚠️ Anfrage-Fehler
        {:else}
          ❓ Unerwarteter Fehler
        {/if}
      </h1>

      <p class="error-message">{errorMessage}</p>

      <!-- Action Buttons -->
      <div class="error-actions">
        <button class="btn-primary" on:click={goHome}>
          🏠 Zurück zur Startseite
        </button>
        <button class="btn-secondary" on:click={refreshPage}>
          🔄 Seite neu laden
        </button>
      </div>

      <!-- Technical Details (Collapsible) -->
      <div class="error-details">
        <button class="btn-details" on:click={toggleDetails}>
          {#if showDetails}
            🔽 Weniger Details
          {:else}
            🔼 Mehr technische Details
          {/if}
        </button>

        {#if showDetails}
          <div class="details-content">
            <div class="detail-item">
              <strong>Fehler-Code:</strong> {status}
            </div>
            <div class="detail-item">
              <strong>URL:</strong> {window.location.href}
            </div>
            {#if error}
              <div class="detail-item">
                <strong>Fehlermeldung:</strong> {error.message}
              </div>
            {/if}
            <div class="detail-item">
              <strong>Zeitpunkt:</strong> {new Date().toLocaleString('de-DE')}
            </div>

            <button class="btn-report" on:click={reportError}>
              📧 Fehler melden
            </button>

            {#if recentReports.length > 0}
              <div class="recent-reports">
                <h4>📋 Letzte Fehlerberichte</h4>
                {#each recentReports as report}
                  <div class="recent-report-item">
                    <small>
                      <strong>{new Date(report.timestamp).toLocaleString('de-DE')}</strong><br>
                      {report.message}
                    </small>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Fun Error Illustrations -->
    <div class="error-illustration">
      {#if isServerError}
        <!-- Server error: broken gears/cogs -->
        <div class="broken-gears">
          <div class="gear gear-1">⚙️</div>
          <div class="gear gear-2">⚙️</div>
          <div class="lightning">⚡</div>
        </div>
      {:else if isNotFound}
        <!-- 404: empty box/magnifying glass -->
        <div class="not-found-illustration">
          <div class="magnifying-glass">🔍</div>
          <div class="empty-box">📦</div>
        </div>
      {:else}
        <!-- Generic error: warning sign -->
        <div class="warning-sign">⚠️</div>
      {/if}
    </div>
  </div>
</main>

<style>
</style>
