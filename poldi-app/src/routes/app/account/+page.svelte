<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, currentUser, isPaidUser } from '$lib/stores/auth';

  let loading = true;
  let cancelLoading = false;
  let upgradeLoading = false;
  let error = '';
  let success = '';

  onMount(async () => {
    // Verify session on mount
    const valid = await auth.validateSession();
    if (!valid) {
      goto('/login');
      return;
    }
    loading = false;
  });

  async function handleUpgrade() {
    upgradeLoading = true;
    error = '';

    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$auth.token}`
        },
        body: JSON.stringify({ planId: 'family' })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        error = data.error || 'Fehler beim Erstellen der Zahlungssitzung';
      }
    } catch (e) {
      error = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
    } finally {
      upgradeLoading = false;
    }
  }

  async function handleCancel() {
    if (!confirm('Möchten Sie Ihr Abonnement wirklich kündigen? Sie behalten den Zugang bis zum Ende der aktuellen Abrechnungsperiode.')) {
      return;
    }

    cancelLoading = true;
    error = '';

    try {
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${$auth.token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        success = 'Ihr Abonnement wurde gekündigt. Sie haben noch Zugang bis zum Ende der aktuellen Periode.';
        // Refresh user data
        await auth.validateSession();
      } else {
        error = data.error || 'Fehler bei der Kündigung';
      }
    } catch (e) {
      error = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
    } finally {
      cancelLoading = false;
    }
  }

  async function handleLogout() {
    await auth.logout();
    goto('/');
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Mein Konto - Lern-Rudi</title>
</svelte:head>

<div class="account-page">
  {#if loading}
    <div class="loading">
      <span class="spinner">🐸</span>
      <p>Wird geladen...</p>
    </div>
  {:else}
    <div class="account-container">
      <nav class="account-nav">
        <a href="/app" class="back-link">← Zurück zur App</a>
        <button class="logout-btn" on:click={handleLogout}>Abmelden</button>
      </nav>

      <div class="account-header">
        <span class="avatar">👤</span>
        <div class="user-info">
          <h1>{$currentUser?.displayName || 'Nutzer'}</h1>
          <p class="email">{$currentUser?.email}</p>
        </div>
      </div>

      {#if error}
        <div class="message error">⚠️ {error}</div>
      {/if}

      {#if success}
        <div class="message success">✅ {success}</div>
      {/if}

      <!-- Subscription Status -->
      <section class="card subscription-card">
        <h2>📋 Abonnement</h2>
        
        <div class="subscription-status">
          <div class="status-badge" class:paid={$isPaidUser}>
            {$isPaidUser ? '⭐ Familie' : '🆓 Gratis'}
          </div>
          
          {#if $isPaidUser}
            <div class="status-details">
              <p><strong>Status:</strong> Aktiv</p>
              <p><strong>Preis:</strong> 9,99€ / Monat</p>
              <p><strong>Features:</strong> Alle 11 Module, 360+ Übungen, keine Werbung</p>
            </div>
          {:else}
            <div class="status-details">
              <p><strong>Status:</strong> Kostenlos</p>
              <p><strong>Features:</strong> 3 Module, Basis-Übungen</p>
            </div>
          {/if}
        </div>

        <div class="subscription-actions">
          {#if $isPaidUser}
            <button 
              class="btn btn-outline" 
              on:click={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Wird bearbeitet...' : 'Abonnement kündigen'}
            </button>
          {:else}
            <button 
              class="btn btn-primary"
              on:click={handleUpgrade}
              disabled={upgradeLoading}
            >
              {upgradeLoading ? 'Wird vorbereitet...' : '⭐ Auf Familie upgraden'}
            </button>
            <p class="upgrade-note">Nur 9,99€/Monat • Jederzeit kündbar</p>
          {/if}
        </div>
      </section>

      <!-- Plan Comparison -->
      {#if !$isPaidUser}
        <section class="card compare-card">
          <h2>📊 Plan-Vergleich</h2>
          
          <table class="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Gratis</th>
                <th>Familie ⭐</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Module</td>
                <td>3</td>
                <td>Alle 11</td>
              </tr>
              <tr>
                <td>Übungen</td>
                <td>~100</td>
                <td>360+</td>
              </tr>
              <tr>
                <td>Werbung</td>
                <td>Ja</td>
                <td>Keine</td>
              </tr>
              <tr>
                <td>Detaillierte Auswertungen</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Mehrere Kinderprofile</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Offline-Modus</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
            </tbody>
          </table>
        </section>
      {/if}

      <!-- Account Settings -->
      <section class="card settings-card">
        <h2>⚙️ Kontoeinstellungen</h2>
        
        <div class="settings-list">
          <a href="/app/account/profile" class="settings-item">
            <span class="icon">👤</span>
            <span class="label">Profil bearbeiten</span>
            <span class="arrow">→</span>
          </a>
          
          <a href="/app/account/password" class="settings-item">
            <span class="icon">🔑</span>
            <span class="label">Passwort ändern</span>
            <span class="arrow">→</span>
          </a>
          
          <a href="/app/account/children" class="settings-item">
            <span class="icon">👶</span>
            <span class="label">Kinderprofile verwalten</span>
            <span class="arrow">→</span>
          </a>
          
          <a href="/app/account/data" class="settings-item">
            <span class="icon">📊</span>
            <span class="label">Daten exportieren</span>
            <span class="arrow">→</span>
          </a>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="card danger-card">
        <h2>⚠️ Gefahrenzone</h2>
        <p>Diese Aktionen können nicht rückgängig gemacht werden.</p>
        <button class="btn btn-danger">Konto löschen</button>
      </section>
    </div>
  {/if}
</div>

<style>
  .account-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
    padding: 2rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .spinner {
    font-size: 4rem;
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .account-container {
    max-width: 700px;
    margin: 0 auto;
  }

  .account-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .back-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .logout-btn {
    background: none;
    border: 1px solid #ccc;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
  }

  .logout-btn:hover {
    background: #f0f0f0;
    color: #333;
  }

  .account-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  }

  .avatar {
    font-size: 3.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .user-info h1 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    color: #333;
  }

  .email {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
  }

  .message {
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .message.error {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #c53030;
  }

  .message.success {
    background: #f0fff4;
    border: 1px solid #c6f6d5;
    color: #2f855a;
  }

  .card {
    background: white;
    border-radius: 15px;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  }

  .card h2 {
    margin: 0 0 1.5rem;
    color: #333;
    font-size: 1.2rem;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.75rem;
  }

  .subscription-status {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .status-badge {
    background: #f0f0f0;
    color: #666;
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .status-badge.paid {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .status-details {
    flex: 1;
  }

  .status-details p {
    margin: 0.3rem 0;
    color: #555;
  }

  .subscription-actions {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
  }

  .upgrade-note {
    margin: 0.5rem 0 0;
    color: #888;
    font-size: 0.85rem;
  }

  .btn {
    padding: 0.9rem 2rem;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
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

  .btn-outline {
    background: white;
    color: #666;
    border: 1px solid #ccc;
  }

  .btn-outline:hover:not(:disabled) {
    background: #f5f5f5;
  }

  .btn-danger {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
  }

  .btn-danger:hover {
    background: #fed7d7;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Compare Table */
  .compare-table {
    width: 100%;
    border-collapse: collapse;
  }

  .compare-table th,
  .compare-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  .compare-table th {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  .compare-table th:last-child {
    color: #667eea;
  }

  .compare-table td {
    color: #555;
  }

  .compare-table td:last-child {
    font-weight: 600;
    color: #667eea;
  }

  /* Settings List */
  .settings-list {
    display: flex;
    flex-direction: column;
  }

  .settings-item {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #f0f0f0;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s;
  }

  .settings-item:last-child {
    border-bottom: none;
  }

  .settings-item:hover {
    background: #f8f9ff;
    margin: 0 -2rem;
    padding: 1rem 2rem;
  }

  .settings-item .icon {
    font-size: 1.5rem;
    margin-right: 1rem;
  }

  .settings-item .label {
    flex: 1;
    color: #333;
    font-weight: 500;
  }

  .settings-item .arrow {
    color: #ccc;
    font-size: 1.2rem;
  }

  /* Danger Zone */
  .danger-card {
    border: 1px solid #fed7d7;
    background: #fffafa;
  }

  .danger-card h2 {
    color: #c53030;
    border-color: #fed7d7;
  }

  .danger-card p {
    color: #666;
    margin: 0 0 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 600px) {
    .account-page {
      padding: 1rem;
    }

    .account-header {
      flex-direction: column;
      text-align: center;
    }

    .subscription-status {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>
