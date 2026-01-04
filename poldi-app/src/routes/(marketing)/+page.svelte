<script lang="ts">
  import { goto } from '$app/navigation';
  
  // Pricing plans
  const plans = [
    {
      name: 'Gratis',
      price: '0€',
      period: '/monat',
      description: 'Perfekt zum Ausprobieren',
      features: [
        '3 Module freigeschalten',
        'Basis-Übungen',
        'Fortschritts-Tracking',
        'Werbefinanziert'
      ],
      cta: 'Kostenlos starten',
      highlighted: false,
      planId: 'free'
    },
    {
      name: 'Familie',
      price: '9,99€',
      period: '/monat',
      description: 'Voller Zugang für die ganze Familie',
      features: [
        'Alle 11 Module',
        '360+ Übungen',
        'Keine Werbung',
        'Detaillierte Auswertungen',
        'Mehrere Kinderprofile',
        'Offline-Modus'
      ],
      cta: 'Jetzt starten',
      highlighted: true,
      planId: 'family'
    },
    {
      name: 'Schule',
      price: 'Auf Anfrage',
      period: '',
      description: 'Für Schulen und Kindergärten',
      features: [
        'Unbegrenzte Nutzer',
        'Lehrerportal',
        'Klassenauswertungen',
        'API-Zugang',
        'Eigenes Branding',
        'Priorisierter Support'
      ],
      cta: 'Kontakt aufnehmen',
      highlighted: false,
      planId: 'school'
    }
  ];

  function selectPlan(planId: string) {
    if (planId === 'free') {
      goto('/signup?plan=free');
    } else if (planId === 'family') {
      goto('/signup?plan=family');
    } else if (planId === 'school') {
      goto('/contact');
    }
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<svelte:head>
  <title>Lern-Rudi - Spielerisch schulreif werden</title>
  <meta name="description" content="Lern-Rudi bereitet Ihr Kind spielerisch auf die Schule vor. Wissenschaftlich fundierte Übungen für Phonologie, Mathematik, Konzentration und mehr." />
</svelte:head>

<div class="landing">
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-brand">
      <span class="nav-icon">🐸</span>
      <span class="nav-title">Lern-Rudi</span>
    </div>
    <div class="nav-links">
      <button on:click={() => scrollToSection('features')}>Funktionen</button>
      <button on:click={() => scrollToSection('pricing')}>Preise</button>
      <a href="/login" class="nav-login">Anmelden</a>
      <a href="/signup" class="nav-cta">Kostenlos testen</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>
        <span class="hero-icon">🐸</span>
        Spielerisch schulreif werden
      </h1>
      <p class="hero-subtitle">
        Lern-Rudi bereitet Ihr Kind optimal auf das Schuleingangsscreening vor. 
        Mit wissenschaftlich fundierten Übungen in Phonologie, Mathematik, 
        Konzentration und Motorik.
      </p>
      <div class="hero-buttons">
        <a href="/signup" class="btn btn-primary">
          ✨ Kostenlos starten
        </a>
        <button class="btn btn-secondary" on:click={() => goto('/app/exercises?mode=demo')}>
          🎮 Demo ausprobieren
        </button>
      </div>
      <p class="hero-trust">
        ✅ Wissenschaftlich fundiert • ✅ Keine Installation nötig • ✅ DSGVO-konform
      </p>
    </div>
    <div class="hero-image">
      <div class="hero-preview">
        <div class="preview-screen">
          <div class="preview-header">📚 Reime und Laute</div>
          <div class="preview-content">
            <span class="preview-icon">🐭</span>
            <p>Was reimt sich auf "Maus"?</p>
            <div class="preview-options">
              <span>🏠</span>
              <span>🚗</span>
              <span>🐕</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="features">
    <h2>Alles was Ihr Kind braucht</h2>
    <p class="section-subtitle">
      11 Module mit über 360 Übungen – basierend auf dem österreichischen Schuleingangsscreening
    </p>
    
    <div class="features-grid">
      <div class="feature-card">
        <span class="feature-icon">🔤</span>
        <h3>Phonologie</h3>
        <p>Reime erkennen, Silben klatschen, Anfangslaute unterscheiden</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">🔢</span>
        <h3>Mathematik</h3>
        <p>Mengen vergleichen, Zählen, Zahlenfolgen ergänzen</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">🧠</span>
        <h3>Gedächtnis</h3>
        <p>Zahlenfolgen merken und Arbeitsgedächtnis trainieren</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">👁️</span>
        <h3>Wahrnehmung</h3>
        <p>Formen unterscheiden, Muster erkennen, genau hinschauen</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">✏️</span>
        <h3>Motorik</h3>
        <p>Formen nachzeichnen, Linien folgen, Schreiben üben</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">📖</span>
        <h3>Sprache</h3>
        <p>Geschichten erzählen mit KI-Feedback für bessere Erzählkompetenz</p>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="pricing">
    <h2>Faire Preise für alle</h2>
    <p class="section-subtitle">
      Starten Sie kostenlos und upgraden Sie jederzeit
    </p>
    
    <div class="pricing-grid">
      {#each plans as plan}
        <div class="pricing-card" class:highlighted={plan.highlighted}>
          {#if plan.highlighted}
            <div class="popular-badge">Beliebteste Wahl</div>
          {/if}
          <h3>{plan.name}</h3>
          <div class="price">
            <span class="amount">{plan.price}</span>
            <span class="period">{plan.period}</span>
          </div>
          <p class="plan-description">{plan.description}</p>
          <ul class="plan-features">
            {#each plan.features as feature}
              <li>✅ {feature}</li>
            {/each}
          </ul>
          <button 
            class="btn" 
            class:btn-primary={plan.highlighted}
            class:btn-secondary={!plan.highlighted}
            on:click={() => selectPlan(plan.planId)}
          >
            {plan.cta}
          </button>
        </div>
      {/each}
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="faq">
    <h2>Häufige Fragen</h2>
    
    <div class="faq-grid">
      <div class="faq-item">
        <h4>Was ist das Schuleingangsscreening?</h4>
        <p>Das Schuleingangsscreening (SES) testet die Schulreife von Kindern vor der Einschulung. Lern-Rudi bereitet auf typische Aufgaben vor.</p>
      </div>
      
      <div class="faq-item">
        <h4>Für welches Alter ist Lern-Rudi geeignet?</h4>
        <p>Lern-Rudi ist für Kinder von 4-7 Jahren entwickelt, ideal für das letzte Kindergartenjahr.</p>
      </div>
      
      <div class="faq-item">
        <h4>Kann ich jederzeit kündigen?</h4>
        <p>Ja, das Familien-Abo ist monatlich kündbar. Keine versteckten Kosten.</p>
      </div>
      
      <div class="faq-item">
        <h4>Sind meine Daten sicher?</h4>
        <p>Ja, wir sind DSGVO-konform. Kinderdaten werden auf europäischen Servern gespeichert.</p>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <h2>Bereit zum Lernen?</h2>
    <p>Starten Sie noch heute kostenlos und sehen Sie, wie viel Spaß Schulvorbereitung machen kann!</p>
    <a href="/signup" class="btn btn-primary btn-large">
      🚀 Jetzt kostenlos starten
    </a>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <span class="footer-icon">🐸</span>
        <span>Lern-Rudi</span>
      </div>
      <div class="footer-links">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
        <a href="/agb">AGB</a>
        <a href="/contact">Kontakt</a>
      </div>
      <p class="footer-copyright">© 2026 Lern-Rudi. Alle Rechte vorbehalten.</p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif;
    background: #ffffff;
    color: #1a1a2e;
  }

  .landing {
    min-height: 100vh;
  }

  /* Navigation */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;
    color: #667eea;
  }

  .nav-icon {
    font-size: 2rem;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-links button {
    background: none;
    border: none;
    font-size: 1rem;
    color: #555;
    cursor: pointer;
    transition: color 0.2s;
  }

  .nav-links button:hover {
    color: #667eea;
  }

  .nav-login {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }

  .nav-cta {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.6rem 1.5rem;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .nav-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  /* Hero Section */
  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 8rem 2rem 4rem;
    min-height: 80vh;
    align-items: center;
  }

  .hero-content h1 {
    font-size: 3.5rem;
    line-height: 1.2;
    margin: 0 0 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-icon {
    display: block;
    font-size: 4rem;
    margin-bottom: 0.5rem;
    -webkit-text-fill-color: initial;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    color: #555;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .hero-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .hero-trust {
    font-size: 0.9rem;
    color: #888;
  }

  .hero-preview {
    perspective: 1000px;
  }

  .preview-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 2rem;
    color: white;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
    transform: rotateY(-5deg) rotateX(5deg);
    transition: transform 0.3s;
  }

  .preview-screen:hover {
    transform: rotateY(0) rotateX(0);
  }

  .preview-header {
    font-weight: bold;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
  }

  .preview-content {
    text-align: center;
  }

  .preview-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  .preview-options {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1.5rem;
    font-size: 3rem;
  }

  .preview-options span {
    background: white;
    padding: 1rem;
    border-radius: 15px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .preview-options span:hover {
    transform: scale(1.1);
  }

  /* Buttons */
  .btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
    border: 2px solid #e0e0e0;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }

  .btn-large {
    padding: 1.2rem 3rem;
    font-size: 1.3rem;
  }

  /* Sections */
  section {
    padding: 5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #1a1a2e;
  }

  .section-subtitle {
    text-align: center;
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 3rem;
  }

  /* Features */
  .features {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f0ff 100%);
    max-width: 100%;
    padding: 5rem calc((100% - 1200px) / 2 + 2rem);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  }

  .feature-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    margin: 0 0 0.5rem;
    color: #667eea;
  }

  .feature-card p {
    color: #666;
    margin: 0;
  }

  /* Pricing */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    align-items: start;
  }

  .pricing-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    border: 2px solid #e0e0e0;
    position: relative;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .pricing-card:hover {
    transform: translateY(-5px);
  }

  .pricing-card.highlighted {
    border-color: #667eea;
    box-shadow: 0 15px 50px rgba(102, 126, 234, 0.2);
    transform: scale(1.05);
  }

  .pricing-card.highlighted:hover {
    transform: scale(1.05) translateY(-5px);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.3rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
  }

  .pricing-card h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    color: #333;
  }

  .price {
    margin-bottom: 0.5rem;
  }

  .price .amount {
    font-size: 3rem;
    font-weight: bold;
    color: #667eea;
  }

  .price .period {
    color: #888;
    font-size: 1rem;
  }

  .plan-description {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
    text-align: left;
  }

  .plan-features li {
    padding: 0.5rem 0;
    color: #555;
    border-bottom: 1px solid #f0f0f0;
  }

  .plan-features li:last-child {
    border-bottom: none;
  }

  /* FAQ */
  .faq {
    background: #f8f9ff;
    max-width: 100%;
    padding: 5rem calc((100% - 1200px) / 2 + 2rem);
  }

  .faq-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .faq-item {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  }

  .faq-item h4 {
    margin: 0 0 0.5rem;
    color: #667eea;
  }

  .faq-item p {
    margin: 0;
    color: #666;
  }

  /* CTA Section */
  .cta-section {
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    max-width: 100%;
    padding: 5rem 2rem;
    margin: 0;
  }

  .cta-section h2 {
    color: white;
    margin-bottom: 1rem;
  }

  .cta-section p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .cta-section .btn-primary {
    background: white;
    color: #667eea;
  }

  /* Footer */
  .footer {
    background: #1a1a2e;
    color: white;
    padding: 3rem 2rem;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
  }

  .footer-icon {
    font-size: 2rem;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .footer-links a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover {
    color: white;
  }

  .footer-copyright {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
      text-align: center;
      padding-top: 6rem;
    }

    .hero-buttons {
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-image {
      order: -1;
    }

    .preview-screen {
      transform: none;
    }

    .features-grid,
    .pricing-grid,
    .faq-grid {
      grid-template-columns: 1fr;
    }

    .pricing-card.highlighted {
      transform: scale(1);
    }

    .nav-links button {
      display: none;
    }
  }
</style>
