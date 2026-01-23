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
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; color: var(--primary-blue);">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>
            Se hai cambiato idea, puoi tornare alla home e ricominciare il processo.
            I tuoi dati sono stati salvati e potremo ricontattarti in futuro se necessario.
          </p>
        </div>
        <div class="button-group">
          <a routerLink="/" class="btn-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Torna alla Home
          </a>
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
      background: linear-gradient(to bottom, #F8F9FA 0%, #E9ECEF 100%);
      padding: var(--spacing-xl, 2rem);
    }

    .cancel-card {
      background: white;
      padding: var(--spacing-2xl, 3rem);
      border-radius: var(--border-radius-lg, 12px);
      border: 1px solid var(--border-color, #DEE2E6);
      box-shadow: var(--box-shadow-xl, 0 20px 60px rgba(0, 0, 0, 0.15));
      text-align: center;
      max-width: 600px;
      width: 100%;
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cancel-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-xl, 2rem);
      box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
      animation: scaleIn 0.5s ease-out 0.2s backwards;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    h1 {
      color: var(--text-primary, #212529);
      margin-bottom: var(--spacing-lg, 1.5rem);
      font-size: 2rem;
      font-weight: 700;
    }

    .cancel-message {
      color: var(--text-secondary, #6C757D);
      font-size: 1.125rem;
      margin-bottom: var(--spacing-xl, 2rem);
      line-height: 1.8;
    }

    .info-box {
      background: var(--gray-50, #F8F9FA);
      padding: var(--spacing-xl, 2rem);
      border-radius: var(--border-radius, 8px);
      margin-bottom: var(--spacing-xl, 2rem);
      border: 2px solid var(--primary-blue-light, #E6F0FF);
    }

    .info-box p {
      color: var(--text-secondary, #6C757D);
      line-height: 1.8;
      margin: 0;
      font-size: 1rem;
      text-align: left;
    }

    .button-group {
      display: flex;
      gap: var(--spacing-md, 1rem);
      justify-content: center;
    }

    .btn-home {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg, 1rem) var(--spacing-xl, 2rem);
      background: var(--primary-gradient, linear-gradient(135deg, #0066CC 0%, #004C99 100%));
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius, 8px);
      font-weight: 600;
      transition: all var(--transition-normal, 0.3s ease-in-out);
      border: 2px solid var(--primary-blue, #0066CC);
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
      min-height: 48px;
    }

    .btn-home:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 102, 204, 0.3);
    }

    .btn-home:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
    }

    @media (max-width: 768px) {
      .cancel-container {
        padding: var(--spacing-md, 1rem);
      }

      .cancel-card {
        padding: var(--spacing-xl, 2rem);
      }

      .cancel-icon {
        width: 64px;
        height: 64px;
      }

      .cancel-icon svg {
        width: 40px;
        height: 40px;
      }

      h1 {
        font-size: 1.75rem;
      }

      .cancel-message {
        font-size: 1rem;
      }

      .info-box {
        padding: var(--spacing-lg, 1.5rem);
      }

      .info-box p {
        font-size: 0.95rem;
      }

      .btn-home {
        width: 100%;
        font-size: 1.0625rem;
        min-height: 52px;
      }
    }
  `]
})
export class CancelComponent {}
