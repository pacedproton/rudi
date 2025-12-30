<script lang="ts">
  import { onMount } from 'svelte';

  export let fallback: string = 'Es ist ein Fehler aufgetreten.';
  export let onError: ((error: Error) => void) | undefined = undefined;

  let hasError = false;
  let error: Error | null = null;

  function handleError(event: ErrorEvent) {
    hasError = true;
    error = event.error;

    console.error('Error caught by boundary:', event.error);

    if (onError) {
      onError(event.error);
    }

    // Prevent error from propagating
    event.preventDefault();
  }

  function reset() {
    hasError = false;
    error = null;
  }

  onMount(() => {
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  });
</script>

{#if hasError}
  <div class="error-boundary">
    <div class="error-card">
      <div class="error-icon">⚠️</div>
      <h2>Oops! Etwas ist schiefgelaufen</h2>
      <p class="error-message">{fallback}</p>
      {#if error}
        <details class="error-details">
          <summary>Technische Details</summary>
          <pre>{error.message}\n{error.stack}</pre>
        </details>
      {/if}
      <button class="btn-retry" on:click={reset}>
        🔄 Erneut versuchen
      </button>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .error-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .error-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .error-card h2 {
    color: #333;
    margin: 0 0 16px 0;
    font-size: 1.5rem;
  }

  .error-message {
    color: #666;
    margin: 0 0 24px 0;
    font-size: 1rem;
  }

  .error-details {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
    text-align: left;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 8px;
  }

  .error-details pre {
    font-size: 0.75rem;
    color: #666;
    overflow-x: auto;
    margin: 8px 0 0 0;
  }

  .btn-retry {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-retry:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
</style>
