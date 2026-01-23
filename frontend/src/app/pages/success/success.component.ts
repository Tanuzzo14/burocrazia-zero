import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-success',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Pagamento Completato</h1>
        <p class="success-message">
          Il pagamento è stato elaborato con successo.
        </p>
        <div class="info-box">
          <h2>Prossimi Passi</h2>
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
      background-color: var(--gray-100, #F1F3F5);
      padding: 2rem;
    }

    .success-card {
      background: white;
      padding: 3rem;
      border-radius: var(--border-radius, 4px);
      border: 1px solid var(--border-color, #DEE2E6);
      box-shadow: var(--box-shadow, 0 1px 3px rgba(0, 0, 0, 0.12));
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: var(--success-light, #D4EDDA);
      color: var(--success, #28A745);
      border-radius: var(--border-radius, 4px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      border: 2px solid var(--success, #28A745);
    }

    h1 {
      color: var(--text-primary, #212529);
      margin-bottom: 1rem;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .success-message {
      color: var(--text-secondary, #6C757D);
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .info-box {
      background: var(--gray-50, #F8F9FA);
      padding: 1.5rem;
      border-radius: var(--border-radius, 4px);
      margin-bottom: 2rem;
      text-align: left;
      border: 1px solid var(--border-color, #DEE2E6);
    }

    .info-box h2 {
      color: var(--text-primary, #212529);
      font-size: 1.1rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .info-box ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    .info-box li {
      color: var(--text-secondary, #6C757D);
      margin-bottom: 0.75rem;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .btn-home {
      display: inline-block;
      padding: 0.625rem 1.5rem;
      background: var(--primary-blue, #0066CC);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius, 4px);
      font-weight: 500;
      transition: background-color 0.15s ease-in-out;
      border: 1px solid var(--primary-blue, #0066CC);
      font-size: 0.95rem;
    }

    .btn-home:hover {
      background: var(--primary-blue-dark, #004C99);
      border-color: var(--primary-blue-dark, #004C99);
    }

    @media (max-width: 768px) {
      .success-card {
        padding: 2rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class SuccessComponent {}
