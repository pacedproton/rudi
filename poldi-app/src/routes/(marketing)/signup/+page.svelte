<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let displayName = '';
  let loading = false;
  let error = '';
  let step = 1; // 1: account, 2: payment

  // Get plan from URL (default to lifetime)
  $: selectedPlan = $page.url.searchParams.get('plan') || 'lifetime';
  
  const plans: Record<string, { name: string; price: string; period: string }> = {
    lifetime: { name: 'Einmalzahlung', price: '40€', period: 'einmalig' },
    monthly: { name: 'Monatsabo', price: '10€', period: '/Monat' }
  };

  async function handleSignup() {
    error = '';
    
    if (password !== confirmPassword) {
      error = 'Die Passwörter stimmen nicht überein';
      return;
    }

    if (password.length < 6) {
      error = 'Das Passwort muss mindestens 6 Zeichen lang sein';
      return;
    }

    loading = true;

    try {
      const success = await auth.register(email, password, displayName);
      
      if (success) {
        // All plans require payment - go to step 2
        step = 2;
      } else {
        error = $auth.error || 'Registrierung fehlgeschlagen';
      }
    } catch (e) {
      error = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    } finally {
      loading = false;
    }
  }

  async function handleStripeCheckout() {
    loading = true;
    error = '';

    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$auth.token}`
        },
        body: JSON.stringify({ planId: selectedPlan })
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        error = data.error || 'Fehler beim Erstellen der Zahlungssitzung';
      }
    } catch (e) {
      error = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
    } finally {
      loading = false;
    }
  }

  function skipPayment() {
    goto('/app');
  }
</script>

<svelte:head>
  <title>Registrieren - Lern-Rudi</title>
</svelte:head>

<div class="signup-page">
  <div class="signup-container">
    <a href="/" class="back-link">← Zurück zur Startseite</a>
    
    <div class="signup-header">
      <span class="logo">🐸</span>
      <h1>Konto erstellen</h1>
      <p>Starten Sie mit Lern-Rudi</p>
    </div>

    <!-- Progress Steps -->
    <div class="progress-steps">
      <div class="step" class:active={step >= 1} class:completed={step > 1}>
        <span class="step-number">1</span>
        <span class="step-label">Konto</span>
      </div>
      <div class="step-line" class:completed={step > 1}></div>
      <div class="step" class:active={step >= 2} class:completed={step > 2}>
        <span class="step-number">2</span>
        <span class="step-label">Plan</span>
      </div>
      {#if selectedPlan === 'family'}
        <div class="step-line" class:completed={step > 2}></div>
        <div class="step" class:active={step >= 3}>
          <span class="step-number">3</span>
          <span class="step-label">Zahlung</span>
        </div>
      {/if}
    </div>

    {#if error}
      <div class="error-message">
        ⚠️ {error}
      </div>
    {/if}

    <!-- Step 1: Account Creation -->
    {#if step === 1}
      <form on:submit|preventDefault={() => { step = 2; }}>
        <div class="form-group">
          <label for="displayName">Name des Kindes (optional)</label>
          <input 
            type="text" 
            id="displayName" 
            bind:value={displayName}
            placeholder="Max"
          />
        </div>

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
            minlength="6"
            placeholder="Mindestens 6 Zeichen"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Passwort bestätigen</label>
          <input 
            type="password" 
            id="confirmPassword" 
            bind:value={confirmPassword}
            required
            placeholder="Passwort wiederholen"
          />
        </div>

        <button type="submit" class="btn btn-primary" disabled={loading}>
          Weiter zum Plan →
        </button>
      </form>
    {/if}

    <!-- Step 2: Plan Selection -->
    {#if step === 2}
      <div class="plan-selection">
        <div 
          class="plan-option" 
          class:selected={selectedPlan === 'free'}
          on:click={() => selectedPlan = 'free'}
          on:keypress={(e) => e.key === 'Enter' && (selectedPlan = 'free')}
          tabindex="0"
          role="button"
        >
          <div class="plan-header">
            <h3>Gratis</h3>
            <span class="plan-price">0€</span>
          </div>
          <ul>
            <li>3 Module freigeschalten</li>
            <li>Basis-Übungen</li>
            <li>Werbefinanziert</li>
          </ul>
        </div>

        <div 
          class="plan-option highlighted" 
          class:selected={selectedPlan === 'family'}
          on:click={() => selectedPlan = 'family'}
          on:keypress={(e) => e.key === 'Enter' && (selectedPlan = 'family')}
          tabindex="0"
          role="button"
        >
          <div class="popular-tag">Beliebteste Wahl</div>
          <div class="plan-header">
            <h3>Familie</h3>
            <span class="plan-price">9,99€<small>/Monat</small></span>
          </div>
          <ul>
            <li>Alle 11 Module</li>
            <li>360+ Übungen</li>
            <li>Keine Werbung</li>
            <li>Detaillierte Auswertungen</li>
          </ul>
        </div>
      </div>

      <div class="step-buttons">
        <button class="btn btn-secondary" on:click={() => step = 1}>
          ← Zurück
        </button>
        <button 
          class="btn btn-primary" 
          on:click={handleSignup}
          disabled={loading}
        >
          {loading ? 'Wird erstellt...' : (selectedPlan === 'family' ? 'Weiter zur Zahlung →' : 'Kostenlos starten →')}
        </button>
      </div>
    {/if}

    <!-- Step 3: Payment -->
    {#if step === 3}
      <div class="payment-section">
        <div class="selected-plan-summary">
          <h3>Gewählter Plan: Familie</h3>
          <p class="price-display">9,99€ / Monat</p>
          <ul>
            <li>✅ Alle 11 Module</li>
            <li>✅ 360+ Übungen</li>
            <li>✅ Keine Werbung</li>
            <li>✅ Jederzeit kündbar</li>
          </ul>
        </div>

        <button 
          class="btn btn-primary btn-large"
          on:click={handleStripeCheckout}
          disabled={loading}
        >
          {loading ? 'Wird vorbereitet...' : '💳 Zur sicheren Zahlung mit Stripe'}
        </button>

        <button class="btn btn-link" on:click={skipPayment}>
          Erstmal kostenlos testen →
        </button>

        <div class="security-note">
          🔒 Sichere Zahlung über Stripe. Ihre Daten werden verschlüsselt übertragen.
        </div>
      </div>
    {/if}

    <div class="login-link">
      Bereits ein Konto? <a href="/login">Jetzt anmelden</a>
    </div>
  </div>
</div>

<style>
  .signup-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .signup-container {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 500px;
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

  .signup-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    font-size: 4rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .signup-header h1 {
    margin: 0;
    color: #333;
    font-size: 1.8rem;
  }

  .signup-header p {
    color: #666;
    margin: 0.5rem 0 0;
  }

  /* Progress Steps */
  .progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.5;
  }

  .step.active {
    opacity: 1;
  }

  .step-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #666;
  }

  .step.active .step-number {
    background: #667eea;
    color: white;
  }

  .step.completed .step-number {
    background: #4caf50;
  }

  .step-label {
    font-size: 0.9rem;
    color: #666;
  }

  .step-line {
    width: 40px;
    height: 2px;
    background: #e0e0e0;
    margin: 0 0.5rem;
  }

  .step-line.completed {
    background: #4caf50;
  }

  /* Form */
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

  .error-message {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #c53030;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  /* Buttons */
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

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .btn-link {
    background: none;
    color: #667eea;
    font-size: 0.95rem;
    margin-top: 1rem;
  }

  .btn-large {
    padding: 1.2rem;
    font-size: 1.2rem;
  }

  .step-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .step-buttons .btn {
    flex: 1;
  }

  /* Plan Selection */
  .plan-selection {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .plan-option {
    flex: 1;
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .plan-option:hover {
    border-color: #667eea;
  }

  .plan-option.selected {
    border-color: #667eea;
    background: #f8f9ff;
  }

  .plan-option.highlighted {
    border-color: #667eea;
  }

  .popular-tag {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.8rem;
    border-radius: 20px;
    white-space: nowrap;
  }

  .plan-header {
    margin-bottom: 1rem;
  }

  .plan-header h3 {
    margin: 0;
    color: #333;
  }

  .plan-price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
  }

  .plan-price small {
    font-size: 0.8rem;
    font-weight: normal;
    color: #888;
  }

  .plan-option ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
  }

  .plan-option li {
    padding: 0.3rem 0;
    color: #666;
  }

  .plan-option li::before {
    content: '✓ ';
    color: #4caf50;
  }

  /* Payment Section */
  .payment-section {
    text-align: center;
  }

  .selected-plan-summary {
    background: #f8f9ff;
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .selected-plan-summary h3 {
    margin: 0 0 0.5rem;
    color: #333;
  }

  .price-display {
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
    margin: 0 0 1rem;
  }

  .selected-plan-summary ul {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
  }

  .selected-plan-summary li {
    padding: 0.3rem 0;
    color: #555;
  }

  .security-note {
    margin-top: 1.5rem;
    font-size: 0.85rem;
    color: #888;
  }

  .login-link {
    text-align: center;
    margin-top: 2rem;
    color: #666;
    font-size: 0.9rem;
  }

  .login-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }

  .login-link a:hover {
    text-decoration: underline;
  }
</style>
