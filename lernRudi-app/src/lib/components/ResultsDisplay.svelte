<script lang="ts">
  import { scores, totalKeys, modules, resetToMenu } from '$lib/core/StateManager';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Calculate statistics
  $: totalExercises = $modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
  $: percentageCorrect = totalExercises > 0 ? Math.round(($totalKeys / totalExercises) * 100) : 0;
  $: grade = getGrade(percentageCorrect);

  function getGrade(percentage: number): string {
    if (percentage >= 90) return 'Ausgezeichnet!';
    if (percentage >= 75) return 'Sehr gut!';
    if (percentage >= 60) return 'Gut!';
    if (percentage >= 50) return 'Befriedigend';
    return 'Weiter üben!';
  }

  function getColorForPercentage(percentage: number): string {
    if (percentage >= 75) return '#4caf50';
    if (percentage >= 50) return '#ff9800';
    return '#f44336';
  }

  function exportResults() {
    const results = {
      date: new Date().toISOString(),
      totalExercises,
      correct: $totalKeys,
      incorrect: totalExercises - $totalKeys,
      percentage: percentageCorrect,
      grade,
      moduleScores: $modules.map(mod => ({
        module: mod.title,
        score: $scores[mod.id] || 0,
        total: mod.tasks.length,
        percentage: Math.round((($scores[mod.id] || 0) / mod.tasks.length) * 100)
      }))
    };

    // Create downloadable JSON
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flinki-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    let csv = 'Modul,Richtig,Gesamt,Prozent\n';
    $modules.forEach(mod => {
      const score = $scores[mod.id] || 0;
      const total = mod.tasks.length;
      const pct = Math.round((score / total) * 100);
      csv += `"${mod.title}",${score},${total},${pct}%\n`;
    });
    csv += `\nGesamt,${$totalKeys},${totalExercises},${percentageCorrect}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flinki-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function restart() {
    resetToMenu();
    dispatch('restart');
  }
</script>

<div class="results-container">
  <div class="results-card">
    <div class="header">
      <h1>🎉 Test Abgeschlossen!</h1>
      <p class="subtitle">Hier sind deine Ergebnisse</p>
    </div>

    <div class="score-circle" style="--color: {getColorForPercentage(percentageCorrect)}">
      <div class="circle-content">
        <div class="percentage">{percentageCorrect}%</div>
        <div class="grade">{grade}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{$totalKeys}</div>
        <div class="stat-label">Richtig</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{totalExercises - $totalKeys}</div>
        <div class="stat-label">Falsch</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{totalExercises}</div>
        <div class="stat-label">Gesamt</div>
      </div>
    </div>

    <div class="module-results">
      <h3>Ergebnisse nach Modul</h3>
      {#each $modules as module}
        {@const score = $scores[module.id] || 0}
        {@const total = module.tasks.length}
        {@const pct = Math.round((score / total) * 100)}
        <div class="module-row">
          <div class="module-name">{module.title}</div>
          <div class="module-score">
            <span class="score-text">{score}/{total}</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {pct}%; background: {getColorForPercentage(pct)}"></div>
            </div>
            <span class="score-pct">{pct}%</span>
          </div>
        </div>
      {/each}
    </div>

    <div class="actions">
      <button class="btn-primary" on:click={restart}>
        🔄 Neuer Test
      </button>
    </div>
  </div>
</div>

<style>
  .results-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .results-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 700px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .header {
    text-align: center;
    margin-bottom: 32px;
  }

  .header h1 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 2rem;
  }

  .subtitle {
    color: #666;
    margin: 0;
  }

  .score-circle {
    width: 200px;
    height: 200px;
    margin: 0 auto 32px;
    border-radius: 50%;
    border: 12px solid var(--color);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .circle-content {
    text-align: center;
  }

  .percentage {
    font-size: 3rem;
    font-weight: bold;
    color: #333;
    line-height: 1;
  }

  .grade {
    font-size: 1.2rem;
    color: #666;
    margin-top: 8px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    color: white;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    line-height: 1;
  }

  .stat-label {
    margin-top: 8px;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .module-results {
    margin-bottom: 32px;
  }

  .module-results h3 {
    color: #333;
    margin: 0 0 16px 0;
  }

  .module-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .module-row:last-child {
    border-bottom: none;
  }

  .module-name {
    flex: 0 0 200px;
    font-weight: 600;
    color: #333;
  }

  .module-score {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .score-text {
    flex: 0 0 60px;
    color: #666;
    font-weight: 600;
  }

  .progress-bar {
    flex: 1;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.5s ease;
  }

  .score-pct {
    flex: 0 0 50px;
    text-align: right;
    font-weight: 600;
    color: #666;
  }

  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-primary,
  .btn-export {
    padding: 12px 24px;
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
    flex: 1;
  }

  .btn-primary:hover {
    background: #5568d3;
    transform: translateY(-2px);
  }

  .btn-export {
    background: #f0f0f0;
    color: #333;
  }

  .btn-export:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    .results-card {
      padding: 24px;
    }

    .module-name {
      flex: 0 0 150px;
      font-size: 0.9rem;
    }

    .actions {
      flex-direction: column;
    }
  }
</style>
