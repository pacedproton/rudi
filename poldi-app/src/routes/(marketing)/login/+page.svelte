<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleLogin() {
    error = '';
    loading = true;

    try {
      const success = await auth.login(email, password);
      
      if (success) {
        goto('/app');
      } else {
        error = $auth.error || 'Anmeldung fehlgeschlagen';
      }
    } catch (e) {
      error = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Anmelden - Lern-Rudi</title>
</svelte:head>

<div class="login-page">
  <div class="login-container">
    <a href="/" class="back-link">← Zurück zur Startseite</a>
    
    <div class="login-header">
      <span class="logo">🐸</span>
      <h1>Willkommen zurück!</h1>
      <p>Melden Sie sich an, um fortzufahren</p>
    </div>

    {#if error}
      <div class="error-message">
        ⚠️ {error}
      </div>
    {/if}

    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="email">E-Mail-Adresse</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email}
          required
          placeholder="eltern@beispiel.at"
        />
      </div>

      <div class="form-group">
        <label for="password">Passwort</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password}
          required
          placeholder="Ihr Passwort"
        />
      </div>

      <a href="/forgot-password" class="forgot-link">Passwort vergessen?</a>

      <button type="submit" class="btn btn-primary" disabled={loading}>
        {loading ? 'Wird angemeldet...' : 'Anmelden'}
      </button>
    </form>

    <div class="divider">
      <span>oder</span>
    </div>

    <div class="signup-link">
      Noch kein Konto? <a href="/signup">Jetzt registrieren</a>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .login-container {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .back-link {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    display: inline-block;
    margin-bottom: 1rem;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    font-size: 4rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .login-header h1 {
    margin: 0;
    color: #333;
    font-size: 1.8rem;
  }

  .login-header p {
    color: #666;
    margin: 0.5rem 0 0;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 600;
  }

  .form-group input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
  }

  .forgot-link {
    display: block;
    text-align: right;
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .forgot-link:hover {
    text-decoration: underline;
  }

  .error-message {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #c53030;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-demo {
    background: #f0f0f0;
    color: #333;
  }

  .btn-demo:hover {
    background: #e0e0e0;
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
    color: #888;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }

  .divider span {
    padding: 0 1rem;
    font-size: 0.9rem;
  }

  .signup-link {
    text-align: center;
    margin-top: 2rem;
    color: #666;
    font-size: 0.9rem;
  }

  .signup-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }

  .signup-link a:hover {
    text-decoration: underline;
  }
</style>
