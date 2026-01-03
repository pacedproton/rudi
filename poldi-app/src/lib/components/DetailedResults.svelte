<script lang="ts">
  import { moduleStats, overallStats, resetToMenu } from '$lib/core/StateManager';
  import { colors, font } from '$lib/data/colors';

  let { onRestart }: { onRestart: () => void } = $props();

  $: overall = $overallStats;
  $: modules = Object.values($moduleStats);

  // Calculate performance rating
  $: performanceRating = overall.overallAccuracy >= 90 ? 'Ausgezeichnet! 🌟' :
                         overall.overallAccuracy >= 80 ? 'Sehr gut! ⭐' :
                         overall.overallAccuracy >= 70 ? 'Gut! 👍' :
                         overall.overallAccuracy >= 60 ? 'OK 👌' : 'Üben wir nochmal! 💪';

  // Exercise type labels for display
  const exerciseTypeLabels: Record<string, string> = {
    rhyme: 'Reime',
    syllables: 'Silben',
    initial: 'Anfangslaute',
    quantity: 'Mengen',
    dice: 'Würfel',
    counting: 'Zählen',
    missing: 'Zahlenfolgen',
    memory: 'Zahlen merken',
    discrimination: 'Genau hinschauen',
    pattern: 'Muster',
    trace: 'Nachzeichnen',
    trace_path: 'Wege nachziehen',
    preposition: 'Wo ist was?',
    drawing: 'Zeichnen',
    handwriting: 'Schreiben',
    connect_dots: 'Punkte verbinden'
  };

  function formatPercentage(value: number): string {
    return Math.round(value) + '%';
  }

  function getAccuracyColor(accuracy: number): string {
    if (accuracy >= 80) return colors.poldiSkin;
    if (accuracy >= 60) return colors.gold;
    return colors.red;
  }
</script>

<div class="results-container">
  <!-- Header -->
  <div class="header">
    <h1>Ergebnisse</h1>
    <div class="overall-score">
      <div class="score-circle" style="--overall-accuracy: {overall.overallAccuracy}">
        <div class="score-number">{formatPercentage(overall.overallAccuracy)}</div>
        <div class="score-label">Genauigkeit</div>
      </div>
      <div class="performance-rating">{performanceRating}</div>
    </div>
  </div>

  <!-- Overall Stats -->
  <div class="stats-section">
    <h2>📊 Gesamtstatistik</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{overall.totalCorrect}</div>
        <div class="stat-label">Richtig</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-value">{overall.totalIncorrect}</div>
        <div class="stat-label">Falsch</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value">{overall.totalTasks}</div>
        <div class="stat-label">Aufgaben</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">{overall.modulesCompleted}</div>
        <div class="stat-label">Module</div>
      </div>
    </div>
  </div>

  <!-- Module Breakdown -->
  {#if modules.length > 0}
    <div class="stats-section">
      <h2>📚 Module Übersicht</h2>
      <div class="modules-grid">
        {#each modules as module}
          <div class="module-card">
            <div class="module-header">
              <h3>{module.moduleTitle}</h3>
              <div class="module-accuracy" style="color: {getAccuracyColor(module.accuracy)}">
                {formatPercentage(module.accuracy)}
              </div>
            </div>

            <div class="module-stats">
              <div class="stat-row">
                <span>Richtig:</span>
                <span class="correct">{module.correct}</span>
              </div>
              <div class="stat-row">
                <span>Falsch:</span>
                <span class="incorrect">{module.incorrect}</span>
              </div>
              <div class="stat-row">
                <span>Gesamt:</span>
                <span>{module.total}</span>
              </div>
            </div>

            <!-- Exercise Type Breakdown within Module -->
            {#if Object.keys(module.exerciseTypeStats).length > 0}
              <div class="exercise-breakdown">
                {#each Object.entries(module.exerciseTypeStats) as [type, stats]}
                  <div class="exercise-stat">
                    <span class="exercise-type">{exerciseTypeLabels[type] || type}:</span>
                    <span class="exercise-score">
                      {stats.correct}/{stats.total}
                      <span class="exercise-accuracy" style="color: {getAccuracyColor(stats.accuracy)}">
                        ({formatPercentage(stats.accuracy)})
                      </span>
                    </span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Exercise Type Overall Breakdown -->
  {#if Object.keys(overall.exerciseTypeBreakdown).length > 0}
    <div class="stats-section">
      <h2>🎯 Übungstypen Übersicht</h2>
      <div class="exercise-types-grid">
        {#each Object.entries(overall.exerciseTypeBreakdown).sort(([,a], [,b]) => b.total - a.total) as [type, stats]}
          <div class="exercise-type-card">
            <div class="exercise-type-header">
              <h4>{exerciseTypeLabels[type] || type}</h4>
              <div class="type-accuracy" style="color: {getAccuracyColor(stats.accuracy)}">
                {formatPercentage(stats.accuracy)}
              </div>
            </div>

            <div class="exercise-type-stats">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {stats.accuracy}%; background-color: {getAccuracyColor(stats.accuracy)}"
                ></div>
              </div>
              <div class="type-numbers">
                <span class="correct-count">{stats.correct}</span>
                <span class="separator">/</span>
                <span class="total-count">{stats.total}</span>
                <span class="incorrect-count">({stats.incorrect} falsch)</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Performance Analysis -->
  <div class="stats-section">
    <h2>🔍 Leistungsanalyse</h2>
    <div class="analysis-grid">
      {#if overall.overallAccuracy >= 80}
        <div class="analysis-card positive">
          <div class="analysis-icon">🎉</div>
          <div class="analysis-content">
            <h4>Hervorragende Leistung!</h4>
            <p>Du hast {formatPercentage(overall.overallAccuracy)} Genauigkeit erreicht. Das ist ein ausgezeichnetes Ergebnis!</p>
          </div>
        </div>
      {:else if overall.overallAccuracy >= 60}
        <div class="analysis-card neutral">
          <div class="analysis-icon">👍</div>
          <div class="analysis-content">
            <h4>Gute Arbeit!</h4>
            <p>Mit {formatPercentage(overall.overallAccuracy)} Genauigkeit bist du auf dem richtigen Weg. Mit etwas Übung wird es noch besser!</p>
          </div>
        </div>
      {:else}
        <div class="analysis-card improvement">
          <div class="analysis-icon">📈</div>
          <div class="analysis-content">
            <h4>Weiter üben!</h4>
            <p>Du hast {formatPercentage(overall.overallAccuracy)} Genauigkeit erreicht. Lass uns gemeinsam weiter üben, um besser zu werden!</p>
          </div>
        </div>
      {/if}

      <!-- Strengths and Weaknesses -->
      {#if modules.length > 0}
        {@const bestModule = modules.reduce((best, current) =>
          current.accuracy > best.accuracy ? current : best
        )}
        {@const worstModule = modules.reduce((worst, current) =>
          current.total > 0 && (worst.total === 0 || current.accuracy < worst.accuracy) ? current : worst
        )}

        {#if bestModule.total > 0}
          <div class="analysis-card strength">
            <div class="analysis-icon">💪</div>
            <div class="analysis-content">
              <h4>Stärke: {bestModule.moduleTitle}</h4>
              <p>Hier hast du {formatPercentage(bestModule.accuracy)} Genauigkeit erreicht!</p>
            </div>
          </div>
        {/if}

        {#if worstModule.total > 0 && worstModule !== bestModule}
          <div class="analysis-card weakness">
            <div class="analysis-icon">🎯</div>
            <div class="analysis-content">
              <h4>Verbesserungspotenzial: {worstModule.moduleTitle}</h4>
              <p>Hier könntest du mit {formatPercentage(worstModule.accuracy)} Genauigkeit noch üben.</p>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="actions">
    <button class="btn-restart" on:click={onRestart}>
      🔄 Neu starten
    </button>
    <button class="btn-menu" on:click={() => resetToMenu()}>
      🏠 Zum Menü
    </button>
  </div>
</div>

<style>
  .results-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
    color: #333333;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    min-height: 100vh;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .header h1 {
    color: #4a8e22;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .overall-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .score-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: conic-gradient(
      #76c043 0deg,
      #76c043 180deg,
      #e9ecef 180deg,
      #e9ecef 360deg
    );
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .score-circle::before {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    background: white;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .score-number {
    font-size: 2rem;
    font-weight: bold;
    color: #4a8e22;
    z-index: 1;
    position: relative;
  }

  .score-label {
    font-size: 0.9rem;
    color: #333333;
    z-index: 1;
    position: relative;
  }

  .performance-rating {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4a8e22;
    text-align: center;
  }

  .stats-section {
    margin-bottom: 3rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .stats-section h2 {
    color: #4a8e22;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #76c043;
    padding-bottom: 0.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #4a8e22;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #333333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .modules-grid {
    display: grid;
    gap: 1.5rem;
  }

  .module-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #76c043;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .module-header h3 {
    margin: 0;
    color: #4a8e22;
    font-size: 1.2rem;
  }

  .module-accuracy {
    font-size: 1.1rem;
    font-weight: bold;
  }

  .module-stats {
    margin-bottom: 1rem;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  .correct {
    color: #76c043;
    font-weight: bold;
  }

  .incorrect {
    color: #e74c3c;
    font-weight: bold;
  }

  .exercise-breakdown {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
  }

  .exercise-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }

  .exercise-type {
    font-weight: 500;
  }

  .exercise-score {
    font-weight: bold;
  }

  .exercise-accuracy {
    font-weight: normal;
    font-size: 0.8rem;
  }

  .exercise-types-grid {
    display: grid;
    gap: 1rem;
  }

  .exercise-type-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .exercise-type-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .exercise-type-header h4 {
    margin: 0;
    color: #4a8e22;
    font-size: 1.1rem;
  }

  .type-accuracy {
    font-weight: bold;
    font-size: 1rem;
  }

  .exercise-type-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-bar {
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .type-numbers {
    font-size: 0.9rem;
    text-align: center;
  }

  .correct-count {
    color: #76c043;
    font-weight: bold;
  }

  .incorrect-count {
    color: #e74c3c;
    font-size: 0.8rem;
  }

  .separator {
    color: #333333;
    margin: 0 0.25rem;
  }

  .analysis-grid {
    display: grid;
    gap: 1.5rem;
  }

  .analysis-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .analysis-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .analysis-content h4 {
    margin: 0 0 0.5rem 0;
    color: #4a8e22;
    font-size: 1.1rem;
  }

  .analysis-content p {
    margin: 0;
    color: #333333;
    line-height: 1.4;
  }

  .positive {
    border-left: 4px solid #76c043;
  }

  .neutral {
    border-left: 4px solid #FFD700;
  }

  .improvement {
    border-left: 4px solid #e74c3c;
  }

  .strength {
    border-left: 4px solid #28a745;
  }

  .weakness {
    border-left: 4px solid #ffc107;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .btn-restart, .btn-menu {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .btn-restart {
    background: linear-gradient(135deg, #76c043, #4a8e22);
    color: white;
  }

  .btn-restart:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .btn-menu {
    background: white;
    color: #4a8e22;
    border: 2px solid #76c043;
  }

  .btn-menu:hover {
    background: #76c043;
    color: white;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .results-container {
      padding: 1rem;
    }

    .header {
      padding: 1.5rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .score-circle {
      width: 120px;
      height: 120px;
    }

    .score-number {
      font-size: 1.5rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .analysis-card {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }

    .actions {
      flex-direction: column;
    }

    .btn-restart, .btn-menu {
      width: 100%;
    }
  }
</script>
