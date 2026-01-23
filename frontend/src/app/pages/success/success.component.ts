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
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Pagamento Completato!</h1>
        <p class="success-message">
          Il pagamento è stato elaborato con successo.
        </p>
        <div class="info-box">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;">
              <path d="M12 2v20M2 12h20"></path>
            </svg>
            Prossimi Passi
          </h2>
          <ol>
            <li>Riceverai un messaggio WhatsApp dal nostro operatore</li>
            <li>Ti verranno richiesti i documenti necessari</li>
            <li>L'operatore completerà la tua pratica</li>
          </ol>
        </div>
        <a routerLink="/" class="btn-home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Torna alla Home
        </a>
      </div>
    </div>
  `,
    styles: [`
    .success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, #F8F9FA 0%, #E9ECEF 100%);
      padding: var(--spacing-xl, 2rem);
    }

    .success-card {
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

    .success-icon {
      width: 80px;
      height: 80px;
      background: var(--success-gradient, linear-gradient(135deg, #28A745 0%, #20893a 100%));
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-xl, 2rem);
      box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
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

    .success-message {
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
      text-align: left;
      border: 2px solid var(--primary-blue-light, #E6F0FF);
    }

    .info-box h2 {
      color: var(--text-primary, #212529);
      font-size: 1.125rem;
      margin-bottom: var(--spacing-lg, 1.5rem);
      font-weight: 700;
      display: flex;
      align-items: center;
    }

    .info-box ol {
      margin: 0;
      padding-left: var(--spacing-xl, 2rem);
    }

    .info-box li {
      color: var(--text-secondary, #6C757D);
      margin-bottom: var(--spacing-md, 1rem);
      line-height: 1.8;
      font-size: 1rem;
    }

    .info-box li:last-child {
      margin-bottom: 0;
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
      .success-container {
        padding: var(--spacing-md, 1rem);
      }

      .success-card {
        padding: var(--spacing-xl, 2rem);
      }

      .success-icon {
        width: 64px;
        height: 64px;
      }

      .success-icon svg {
        width: 40px;
        height: 40px;
      }

      h1 {
        font-size: 1.75rem;
      }

      .success-message {
        font-size: 1rem;
      }

      .info-box {
        padding: var(--spacing-lg, 1.5rem);
      }

      .info-box h2 {
        font-size: 1rem;
      }

      .info-box li {
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
export class SuccessComponent {}
