import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-cancel',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="cancel-container">
      <div class="cancel-card">
        <div class="cancel-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1>Pagamento Annullato</h1>
        <p class="cancel-message">
          Il pagamento è stato annullato. Nessun addebito è stato effettuato.
        </p>
        <div class="info-box">
          <p>
            Se hai cambiato idea, puoi tornare alla home e ricominciare il processo.
            I tuoi dati sono stati salvati e potremo ricontattarti in futuro se necessario.
          </p>
        </div>
        <div class="button-group">
          <a routerLink="/" class="btn-home">Torna alla Home</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .cancel-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--gray-100, #F1F3F5);
      padding: 2rem;
    }

    .cancel-card {
      background: white;
      padding: 3rem;
      border-radius: var(--border-radius, 4px);
      border: 1px solid var(--border-color, #DEE2E6);
      box-shadow: var(--box-shadow, 0 1px 3px rgba(0, 0, 0, 0.12));
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .cancel-icon {
      width: 64px;
      height: 64px;
      background: var(--warning-light, #FFF3CD);
      color: var(--warning, #FFC107);
      border-radius: var(--border-radius, 4px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      border: 2px solid var(--warning, #FFC107);
    }

    h1 {
      color: var(--text-primary, #212529);
      margin-bottom: 1rem;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .cancel-message {
      color: var(--text-secondary, #6C757D);
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .info-box {
      background: var(--gray-50, #F8F9FA);
      padding: 1.5rem;
      border-radius: var(--border-radius, 4px);
      margin-bottom: 2rem;
      border: 1px solid var(--border-color, #DEE2E6);
    }

    .info-box p {
      color: var(--text-secondary, #6C757D);
      line-height: 1.6;
      margin: 0;
      font-size: 0.95rem;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
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
      .cancel-card {
        padding: 2rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class CancelComponent {}
