<script lang="ts">
  // Impressum page - Austrian ECG & Mediengesetz requirements
</script>

<svelte:head>
  <title>Impressum - Poldi (Lern-Rudi)</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="impressum-page">
  <div class="container">
    <a href="/" class="back-link">← Zurück zur Startseite</a>
    
    <h1>Impressum</h1>
    
    <section>
      <h2>Angaben gemäß § 5 ECG und § 25 Mediengesetz</h2>
      
      <div class="info-block">
        <h3>Diensteanbieter</h3>
        <p>
          <strong>M. Alexander</strong><br>
          Köllnerhofgasse 3/15A<br>
          1010 Wien<br>
          Österreich
        </p>
      </div>

      <div class="info-block">
        <h3>Kontakt</h3>
        <p>
          E-Mail: <a href="mailto:service@volksschule-trainer.at">service@volksschule-trainer.at</a>
        </p>
      </div>

    </section>

  </div>
</div>

<style>
  .impressum-page {
    min-height: 100vh;
    background: #f8f9ff;
    padding: 2rem;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .back-link {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    display: inline-block;
    margin-bottom: 2rem;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  h1 {
    color: #1a1a2e;
    margin: 0 0 2rem;
    font-size: 2.5rem;
  }

  h2 {
    color: #667eea;
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e0e0e0;
  }

  h3 {
    color: #333;
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  .info-block {
    margin-bottom: 1.5rem;
  }

  p {
    color: #555;
    line-height: 1.7;
    margin: 0;
  }

  a {
    color: #667eea;
  }

  section {
    margin-bottom: 2rem;
  }
</style>
