<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  interface Stats {
    overview: {
      totalUsers: number;
      paidUsers: number;
      freeUsers: number;
      trialUsers: number;
      conversionRate: string | number;
    };
    growth: {
      newUsersLast7Days: number;
      newUsersLast30Days: number;
      activeUsersLast7Days: number;
      activeUsersLast30Days: number;
    };
    exercises: {
      totalAttempts: number;
      overallAccuracy: number;
      avgSessionDurationMinutes: number;
    };
    moduleBreakdown: Array<{
      id: string;
      name: string;
      attempts: number;
      accuracy: number;
    }>;
    recentUsers: Array<{
      id: string;
      email: string;
      displayName?: string;
      subscription: string;
      createdAt: string;
    }>;
  }

  interface User {
    id: string;
    email: string;
    displayName?: string;
    subscription: string;
    createdAt: string;
    updatedAt: string;
  }

  let loading = true;
  let authorized = false;
  let error = '';
  let activeTab: 'overview' | 'users' | 'modules' | 'telemetry' = 'overview';
  
  let stats: Stats | null = null;
  let users: User[] = [];
  let selectedUser: User | null = null;

  onMount(async () => {
    const valid = await auth.validateSession();
    if (!valid) {
      goto('/login');
      return;
    }
    
    await loadStats();
  });

  async function loadStats() {
    loading = true;
    error = '';

    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${$auth.token}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          authorized = false;
          error = 'Sie haben keine Berechtigung für den Admin-Bereich.';
        } else {
          error = data.error || 'Fehler beim Laden der Statistiken';
        }
        loading = false;
        return;
      }

      authorized = true;
      stats = data.stats;
    } catch (e) {
      error = 'Verbindungsfehler';
    } finally {
      loading = false;
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${$auth.token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        users = data.users;
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Nutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${$auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        users = users.filter(u => u.id !== userId);
        await loadStats();
      } else {
        alert(data.error || 'Fehler beim Löschen');
      }
    } catch (e) {
      alert('Verbindungsfehler');
    }
  }

  async function updateSubscription(userId: string, newStatus: string) {
    try {
      const response = await fetch('/api/admin/users/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${$auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, subscription: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        users = users.map(u => 
          u.id === userId ? { ...u, subscription: newStatus } : u
        );
        await loadStats();
      }
    } catch (e) {
      console.error('Failed to update subscription:', e);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  $: if (activeTab === 'users' && users.length === 0 && authorized) {
    loadUsers();
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Lern-Rudi</title>
</svelte:head>

<div class="admin-page">
  {#if loading}
    <div class="loading">
      <span class="spinner">🐸</span>
      <p>Dashboard wird geladen...</p>
    </div>
  {:else if !authorized}
    <div class="unauthorized">
      <span class="icon">🔒</span>
      <h1>Kein Zugriff</h1>
      <p>{error || 'Sie haben keine Berechtigung für den Admin-Bereich.'}</p>
      <a href="/app" class="btn">← Zurück zur App</a>
    </div>
  {:else if stats}
    <div class="admin-container">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <h1>🐸 Admin Dashboard</h1>
          <p>Lern-Rudi Telemetrie & Nutzerverwaltung</p>
        </div>
        <div class="header-right">
          <a href="/app" class="btn btn-secondary">← App</a>
          <button class="btn btn-primary" on:click={loadStats}>🔄 Aktualisieren</button>
        </div>
      </header>

      <!-- Tabs -->
      <nav class="tabs">
        <button class:active={activeTab === 'overview'} on:click={() => activeTab = 'overview'}>
          📊 Übersicht
        </button>
        <button class:active={activeTab === 'users'} on:click={() => activeTab = 'users'}>
          👥 Nutzer
        </button>
        <button class:active={activeTab === 'modules'} on:click={() => activeTab = 'modules'}>
          📚 Module
        </button>
        <button class:active={activeTab === 'telemetry'} on:click={() => activeTab = 'telemetry'}>
          📈 Telemetrie
        </button>
      </nav>

      <!-- Content -->
      <main class="admin-content">
        {#if activeTab === 'overview'}
          <!-- Overview Cards -->
          <div class="stats-grid">
            <div class="stat-card primary">
              <span class="stat-icon">👥</span>
              <div class="stat-content">
                <span class="stat-value">{stats.overview.totalUsers}</span>
                <span class="stat-label">Gesamtnutzer</span>
              </div>
            </div>

            <div class="stat-card success">
              <span class="stat-icon">⭐</span>
              <div class="stat-content">
                <span class="stat-value">{stats.overview.paidUsers}</span>
                <span class="stat-label">Bezahlte Nutzer</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">📈</span>
              <div class="stat-content">
                <span class="stat-value">{stats.overview.conversionRate}%</span>
                <span class="stat-label">Conversion Rate</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">🎯</span>
              <div class="stat-content">
                <span class="stat-value">{stats.exercises.overallAccuracy.toFixed(1)}%</span>
                <span class="stat-label">Ø Erfolgsquote</span>
              </div>
            </div>
          </div>

          <!-- Growth Stats -->
          <section class="section">
            <h2>📈 Wachstum</h2>
            <div class="growth-grid">
              <div class="growth-item">
                <span class="growth-value">{stats.growth.newUsersLast7Days}</span>
                <span class="growth-label">Neue Nutzer (7 Tage)</span>
              </div>
              <div class="growth-item">
                <span class="growth-value">{stats.growth.newUsersLast30Days}</span>
                <span class="growth-label">Neue Nutzer (30 Tage)</span>
              </div>
              <div class="growth-item">
                <span class="growth-value">{stats.growth.activeUsersLast7Days}</span>
                <span class="growth-label">Aktive Nutzer (7 Tage)</span>
              </div>
              <div class="growth-item">
                <span class="growth-value">{stats.growth.activeUsersLast30Days}</span>
                <span class="growth-label">Aktive Nutzer (30 Tage)</span>
              </div>
            </div>
          </section>

          <!-- Exercise Stats -->
          <section class="section">
            <h2>🎮 Übungen</h2>
            <div class="exercise-stats">
              <div class="stat-box">
                <span class="stat-big">{stats.exercises.totalAttempts.toLocaleString()}</span>
                <span class="stat-desc">Gesamte Versuche</span>
              </div>
              <div class="stat-box">
                <span class="stat-big">{stats.exercises.avgSessionDurationMinutes} min</span>
                <span class="stat-desc">Ø Sitzungsdauer</span>
              </div>
            </div>
          </section>

          <!-- Recent Users -->
          <section class="section">
            <h2>🆕 Neueste Nutzer</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nutzer</th>
                  <th>Abo</th>
                  <th>Registriert</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.recentUsers as user}
                  <tr>
                    <td>
                      <span class="user-name">{user.displayName || 'Unbenannt'}</span>
                      <span class="user-email">{user.email}</span>
                    </td>
                    <td>
                      <span class="badge" class:paid={user.subscription === 'paid'}>
                        {user.subscription}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </section>

        {:else if activeTab === 'users'}
          <!-- User Management -->
          <section class="section">
            <h2>👥 Nutzerverwaltung ({users.length})</h2>
            
            <table class="data-table full-width">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>E-Mail</th>
                  <th>Name</th>
                  <th>Abo</th>
                  <th>Registriert</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {#each users as user}
                  <tr>
                    <td class="monospace">{user.id.slice(0, 8)}...</td>
                    <td>{user.email}</td>
                    <td>{user.displayName || '-'}</td>
                    <td>
                      <select 
                        class="select-subscription"
                        value={user.subscription}
                        on:change={(e) => updateSubscription(user.id, e.currentTarget.value)}
                      >
                        <option value="free">Free</option>
                        <option value="trial">Trial</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button 
                        class="btn-icon danger" 
                        on:click={() => deleteUser(user.id)}
                        title="Nutzer löschen"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </section>

        {:else if activeTab === 'modules'}
          <!-- Module Statistics -->
          <section class="section">
            <h2>📚 Modul-Statistiken</h2>

            <table class="data-table full-width">
              <thead>
                <tr>
                  <th>Modul</th>
                  <th>Versuche</th>
                  <th>Erfolgsquote</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.moduleBreakdown as module}
                  <tr>
                    <td>
                      <strong>{module.name}</strong>
                      <span class="module-id">{module.id}</span>
                    </td>
                    <td>{module.attempts.toLocaleString()}</td>
                    <td>
                      <div class="accuracy-bar">
                        <div class="accuracy-fill" style="width: {module.accuracy}%"></div>
                        <span class="accuracy-value">{module.accuracy.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      {#if module.accuracy >= 80}
                        <span class="trend good">📈</span>
                      {:else if module.accuracy >= 70}
                        <span class="trend neutral">➡️</span>
                      {:else}
                        <span class="trend bad">📉</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </section>

        {:else if activeTab === 'telemetry'}
          <!-- Telemetry -->
          <section class="section">
            <h2>📈 Vollständige Telemetrie</h2>
            <p class="section-desc">Detaillierte Übungsstatistiken pro Nutzer</p>

            <div class="telemetry-info">
              <div class="info-card">
                <h3>Erfasste Metriken:</h3>
                <ul>
                  <li>✅ Übungstyp & Modul</li>
                  <li>✅ Korrekt/Falsch</li>
                  <li>✅ Antwortzeit (ms)</li>
                  <li>✅ Versuchsnummer</li>
                  <li>✅ Gegebene Antwort</li>
                  <li>✅ Erwartete Antwort</li>
                  <li>✅ Gerätetyp</li>
                  <li>✅ Sitzungs-ID</li>
                  <li>✅ Zeitstempel</li>
                </ul>
              </div>

              <div class="info-card">
                <h3>Export-Optionen:</h3>
                <button class="btn btn-secondary">📥 CSV Export (alle)</button>
                <button class="btn btn-secondary">📥 JSON Export</button>
                <button class="btn btn-secondary">📊 Analytics Report</button>
              </div>
            </div>

            <div class="telemetry-table-container">
              <h3>Letzte Übungsversuche</h3>
              <table class="data-table full-width compact">
                <thead>
                  <tr>
                    <th>Zeit</th>
                    <th>Nutzer</th>
                    <th>Modul</th>
                    <th>Typ</th>
                    <th>Ergebnis</th>
                    <th>Dauer</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Mock data for demonstration -->
                  <tr>
                    <td>13:21:45</td>
                    <td>max@example.com</td>
                    <td>phonology</td>
                    <td>rhyme</td>
                    <td><span class="result correct">✅</span></td>
                    <td>2.3s</td>
                  </tr>
                  <tr>
                    <td>13:21:32</td>
                    <td>max@example.com</td>
                    <td>phonology</td>
                    <td>syllables</td>
                    <td><span class="result correct">✅</span></td>
                    <td>4.1s</td>
                  </tr>
                  <tr>
                    <td>13:21:15</td>
                    <td>max@example.com</td>
                    <td>phonology</td>
                    <td>rhyme</td>
                    <td><span class="result incorrect">❌</span></td>
                    <td>1.8s</td>
                  </tr>
                  <tr>
                    <td>13:20:58</td>
                    <td>lisa@test.at</td>
                    <td>memory</td>
                    <td>memory</td>
                    <td><span class="result correct">✅</span></td>
                    <td>8.2s</td>
                  </tr>
                  <tr>
                    <td>13:20:41</td>
                    <td>lisa@test.at</td>
                    <td>memory</td>
                    <td>memory</td>
                    <td><span class="result incorrect">❌</span></td>
                    <td>5.6s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        {/if}
      </main>
    </div>
  {/if}
</div>

<style>
  .admin-page {
    min-height: 100vh;
    background: #f5f7fa;
  }

  .loading, .unauthorized {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
  }

  .spinner {
    font-size: 4rem;
    animation: bounce 1s infinite;
  }

  .unauthorized .icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  .unauthorized h1 {
    margin: 0;
    color: #333;
  }

  .unauthorized p {
    color: #666;
    margin: 1rem 0 2rem;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .admin-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Header */
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .header-left h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #333;
  }

  .header-left p {
    margin: 0.25rem 0 0;
    color: #666;
  }

  .header-right {
    display: flex;
    gap: 1rem;
  }

  /* Buttons */
  .btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #667eea;
    color: white;
  }

  .btn-primary:hover {
    background: #5a6fd6;
  }

  .btn-secondary {
    background: #e0e0e0;
    color: #333;
  }

  .btn-secondary:hover {
    background: #d0d0d0;
  }

  .btn-icon {
    padding: 0.4rem 0.6rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
    transition: all 0.2s;
  }

  .btn-icon.danger:hover {
    background: #fee;
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: white;
    padding: 0.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }

  .tabs button {
    flex: 1;
    padding: 0.8rem 1rem;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tabs button:hover {
    background: #f5f5f5;
  }

  .tabs button.active {
    background: #667eea;
    color: white;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }

  .stat-card.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .stat-card.success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  /* Sections */
  .section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }

  .section h2 {
    margin: 0 0 1rem;
    color: #333;
    font-size: 1.2rem;
  }

  .section-desc {
    color: #666;
    margin: -0.5rem 0 1.5rem;
  }

  /* Growth Grid */
  .growth-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .growth-item {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .growth-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
  }

  .growth-label {
    font-size: 0.85rem;
    color: #666;
  }

  /* Exercise Stats */
  .exercise-stats {
    display: flex;
    gap: 2rem;
  }

  .stat-box {
    flex: 1;
    text-align: center;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .stat-big {
    display: block;
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
  }

  .stat-desc {
    color: #666;
  }

  /* Tables */
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th, .data-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  .data-table th {
    font-weight: 600;
    color: #666;
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  .data-table.compact td {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .user-name {
    display: block;
    font-weight: 600;
  }

  .user-email {
    font-size: 0.85rem;
    color: #666;
  }

  .module-id {
    display: block;
    font-size: 0.8rem;
    color: #888;
    font-family: monospace;
  }

  .monospace {
    font-family: monospace;
    font-size: 0.85rem;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    background: #e0e0e0;
    color: #666;
  }

  .badge.paid {
    background: #d4edda;
    color: #155724;
  }

  /* Accuracy Bar */
  .accuracy-bar {
    position: relative;
    width: 100%;
    height: 24px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
  }

  .accuracy-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s;
  }

  .accuracy-value {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: #333;
  }

  .trend {
    font-size: 1.2rem;
  }

  /* Select */
  .select-subscription {
    padding: 0.4rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  /* Telemetry */
  .telemetry-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .info-card h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }

  .info-card ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .info-card li {
    margin: 0.3rem 0;
    color: #555;
  }

  .info-card .btn {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .telemetry-table-container {
    margin-top: 1.5rem;
  }

  .telemetry-table-container h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #333;
  }

  .result {
    font-weight: bold;
  }

  .result.correct {
    color: #28a745;
  }

  .result.incorrect {
    color: #dc3545;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .growth-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .tabs {
      flex-wrap: wrap;
    }

    .tabs button {
      flex: 1 1 45%;
    }

    .telemetry-info {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .admin-container {
      padding: 1rem;
    }

    .admin-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .growth-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
