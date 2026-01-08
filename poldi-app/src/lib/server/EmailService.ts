/**
 * Email Service using Resend
 * 
 * Handles sending transactional emails for:
 * - Registration confirmation to users
 * - Admin notifications for new signups
 */

import { env } from '$env/dynamic/private';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'Lern-Rudi <noreply@volksschule-trainer.at>';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Email sent successfully: ${data.id}`);
      return { success: true, id: data.id };
    } else {
      console.error('Email send failed:', data);
      return { success: false, error: data.message || 'Send failed' };
    }
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send registration confirmation email to user
 */
export async function sendRegistrationConfirmation(
  email: string,
  displayName?: string
): Promise<SendResult> {
  const name = displayName || 'Liebe Eltern';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { font-size: 48px; }
    h1 { color: #667eea; margin: 0; }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐸</div>
      <h1>Willkommen bei Lern-Rudi!</h1>
    </div>
    
    <p>Hallo ${name},</p>
    
    <p>Vielen Dank für Ihre Registrierung bei Lern-Rudi - der spielerischen Vorbereitung für das Schuleingangsscreening!</p>
    
    <p>Mit Lern-Rudi kann Ihr Kind:</p>
    <ul>
      <li>✅ Poldi-Kompetenzen trainieren</li>
      <li>✅ Phonologie, Mathematik und Konzentration üben</li>
      <li>✅ Spielerisch die Schulreife verbessern</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="https://volksschule-trainer.at/login" class="button">Jetzt einloggen →</a>
    </p>
    
    <p>Bei Fragen erreichen Sie uns unter <a href="mailto:service@volksschule-trainer.at">service@volksschule-trainer.at</a>.</p>
    
    <p>Viel Spaß beim Üben! 🎉</p>
    
    <div class="footer">
      <p>
        M. Alexander<br>
        Köllnerhofgasse 3/15A, 1010 Wien<br>
        <a href="https://volksschule-trainer.at/impressum">Impressum</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Willkommen bei Lern-Rudi!

Hallo ${name},

Vielen Dank für Ihre Registrierung bei Lern-Rudi - der spielerischen Vorbereitung für das Schuleingangsscreening!

Mit Lern-Rudi kann Ihr Kind:
- Poldi-Kompetenzen trainieren  
- Phonologie, Mathematik und Konzentration üben
- Spielerisch die Schulreife verbessern

Jetzt einloggen: https://volksschule-trainer.at/login

Bei Fragen: service@volksschule-trainer.at

Viel Spaß beim Üben!
  `;

  return sendEmail({
    to: email,
    subject: '🐸 Willkommen bei Lern-Rudi!',
    html,
    text
  });
}

/**
 * Send admin notification for new registration
 */
export async function sendAdminNewUserNotification(
  userEmail: string,
  displayName?: string,
  selectedPlan?: string
): Promise<SendResult> {
  const adminEmail = env.ADMIN_EMAIL || 'service@volksschule-trainer.at';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #667eea; color: white; padding: 15px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9ff; padding: 20px; border-radius: 0 0 8px 8px; }
    .info-row { margin: 10px 0; }
    .label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🐸 Neue Registrierung!</h2>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="label">E-Mail:</span> ${userEmail}
      </div>
      <div class="info-row">
        <span class="label">Name:</span> ${displayName || '(nicht angegeben)'}
      </div>
      <div class="info-row">
        <span class="label">Plan:</span> ${selectedPlan || 'nicht gewählt'}
      </div>
      <div class="info-row">
        <span class="label">Zeitpunkt:</span> ${new Date().toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🐸 Neue Registrierung: ${userEmail}`,
    html
  });
}
