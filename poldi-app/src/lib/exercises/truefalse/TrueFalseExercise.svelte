<script lang="ts">
  /**
   * TrueFalse Exercise Component
   * Spoken true/false questions about real-world facts
   */
  import { createEventDispatcher, onMount } from 'svelte';
  import { speechEngine } from '$lib/core/SpeechEngine';
  import { audioEngine } from '$lib/core/AudioEngine';
  import { settings } from '$lib/stores/settings';

  export let config: {
    question: string;
    answer: boolean;
    explanation?: string;
    image?: string;
  };

  const dispatch = createEventDispatcher<{
    complete: { correct: boolean };
  }>();

  let answered = false;
  let userAnswer: boolean | null = null;
  let showExplanation = false;
  let isCorrect = false;

  onMount(() => {
    // Speak the question when mounted
    if ($settings.speechEnabled) {
      speechEngine.speak(config.question);
    }
  });

  function handleAnswer(answer: boolean) {
    if (answered) return;
    
    answered = true;
    userAnswer = answer;
    isCorrect = answer === config.answer;
    showExplanation = true;

    // Play sound
    if ($settings.soundEnabled) {
      audioEngine.playSound(isCorrect ? 'success' : 'wrong');
    }

    // Speak explanation
    if ($settings.speechEnabled && config.explanation) {
      setTimeout(() => {
        speechEngine.speak(config.explanation!);
      }, 500);
    }

    // Emit complete after delay
    setTimeout(() => {
      dispatch('complete', { correct: isCorrect });
    }, 2500);
  }
</script>

<div class="truefalse-exercise">
  <div class="question-card">
    {#if config.image}
      <div class="question-image">
        <span class="image-emoji">
          {#if config.image === 'parrot'}🦜
          {:else if config.image === 'wolf'}🐺
          {:else if config.image === 'fish'}🐟
          {:else if config.image === 'penguin'}🐧
          {:else if config.image === 'deer'}🦌
          {:else if config.image === 'lion'}🦁
          {:else if config.image === 'squirrel'}🐿️
          {:else if config.image === 'crocodile'}🐊
          {:else if config.image === 'stork'}🦩
          {:else if config.image === 'kangaroo'}🦘
          {:else if config.image === 'hedgehog'}🦔
          {:else if config.image === 'elephant'}🐘
          {:else}🌍
          {/if}
        </span>
      </div>
    {/if}

    <div class="question-text">
      <span class="speaker-icon">🔊</span>
      {config.question}
    </div>

    {#if !answered}
      <div class="answer-buttons">
        <button 
          class="btn-answer btn-ja" 
          on:click={() => handleAnswer(true)}
        >
          ✅ Ja, stimmt!
        </button>
        <button 
          class="btn-answer btn-nein" 
          on:click={() => handleAnswer(false)}
        >
          ❌ Nein, stimmt nicht!
        </button>
      </div>
    {:else}
      <div class="result" class:correct={isCorrect} class:incorrect={!isCorrect}>
        {#if isCorrect}
          <span class="result-icon">🎉</span>
          <span class="result-text">Richtig!</span>
        {:else}
          <span class="result-icon">🤔</span>
          <span class="result-text">Nicht ganz...</span>
        {/if}
      </div>

      {#if showExplanation && config.explanation}
        <div class="explanation">
          <span class="explanation-icon">💡</span>
          {config.explanation}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .truefalse-exercise {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 2rem;
  }

  .question-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    text-align: center;
  }

  .question-image {
    margin-bottom: 1.5rem;
  }

  .image-emoji {
    font-size: 5rem;
    display: block;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .question-text {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 2rem;
    line-height: 1.4;
    font-weight: 600;
  }

  .speaker-icon {
    display: block;
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.7;
  }

  .answer-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn-answer {
    flex: 1;
    padding: 1.2rem 1.5rem;
    border: none;
    border-radius: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    max-width: 200px;
  }

  .btn-ja {
    background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
  }

  .btn-ja:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
  }

  .btn-nein {
    background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
  }

  .btn-nein:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.6);
  }

  .result {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 1rem;
    animation: popIn 0.3s ease-out;
  }

  @keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .result.correct {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border: 2px solid #4caf50;
  }

  .result.incorrect {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    border: 2px solid #f44336;
  }

  .result-icon {
    font-size: 2rem;
  }

  .result-text {
    font-size: 1.3rem;
    font-weight: bold;
    color: #333;
  }

  .explanation {
    background: #fff8e1;
    border: 1px solid #ffc107;
    border-radius: 12px;
    padding: 1rem;
    font-size: 1rem;
    color: #555;
    line-height: 1.5;
    animation: slideIn 0.5s ease-out;
  }

  @keyframes slideIn {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  .explanation-icon {
    display: block;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 500px) {
    .answer-buttons {
      flex-direction: column;
    }

    .btn-answer {
      max-width: 100%;
    }

    .question-text {
      font-size: 1.2rem;
    }
  }
</style>
