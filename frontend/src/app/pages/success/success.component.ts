import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h1>Pagamento Completato!</h1>
        <p class="success-message">
          Grazie per aver scelto Burocrazia Zero!
        </p>
        <div class="info-box">
          <h2>Prossimi Passi:</h2>
          <ol>
            <li>Riceverai un messaggio WhatsApp dal nostro operatore</li>
            <li>Ti verranno richiesti i documenti necessari</li>
            <li>L'operatore completerà la tua pratica</li>
          </ol>
        </div>
        <a routerLink="/" class="btn-home">Torna alla Home</a>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .success-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 500px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #27ae60;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      margin: 0 auto 2rem;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .success-message {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .info-box {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: left;
    }

    .info-box h2 {
      color: #2c3e50;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .info-box ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    .info-box li {
      color: #34495e;
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }

    .btn-home {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-home:hover {
      background: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }
  `]
})
export class SuccessComponent {}
