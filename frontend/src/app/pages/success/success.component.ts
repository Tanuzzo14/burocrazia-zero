import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-success',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="success-container">
      <div class="success-content">
        <div class="success-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Operazione Completata con Successo!</h1>
        <p class="success-message">
          Il tuo pagamento è stato elaborato correttamente. Un operatore ti contatterà a breve per completare la tua pratica.
        </p>
        <div class="refund-guarantee">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <div>
            <strong>Garanzia di Rimborso Totale:</strong> Se l'intelligenza artificiale dovesse commettere un errore e l'operazione richiesta non fosse effettivamente completabile online, riceverai il rimborso completo dell'importo pagato.
          </div>
        </div>
        <a routerLink="/" class="btn-home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Torna alla Home
        </a>
      </div>
      
      <div class="success-footer">
        <div class="footer-content">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;">
              <path d="M12 2v20M2 12h20"></path>
            </svg>
            Prossimi Passi
          </h2>
          <ol>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Riceverai un messaggio WhatsApp dal nostro operatore
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Ti verranno richiesti i documenti necessari
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              L'operatore completerà la tua pratica
            </li>
          </ol>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .success-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(to bottom, #F8F9FA 0%, #E9ECEF 100%);
    }

    .success-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl, 3rem);
      text-align: center;
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
      width: 120px;
      height: 120px;
      background: var(--success-gradient, linear-gradient(135deg, #28A745 0%, #20893a 100%));
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-xl, 2rem);
      box-shadow: 0 12px 30px rgba(40, 167, 69, 0.4);
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
      font-size: 2.5rem;
      font-weight: 700;
      max-width: 700px;
      line-height: 1.2;
    }

    .success-message {
      color: var(--text-secondary, #6C757D);
      font-size: 1.25rem;
      margin-bottom: var(--spacing-lg, 1.5rem);
      line-height: 1.8;
      max-width: 600px;
    }

    .refund-guarantee {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md, 0.75rem);
      background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
      border: 2px solid #4CAF50;
      border-radius: var(--border-radius, 8px);
      padding: var(--spacing-lg, 1.5rem);
      margin-bottom: var(--spacing-xl, 2rem);
      max-width: 700px;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
    }

    .refund-guarantee svg {
      color: #4CAF50;
      margin-top: 2px;
    }

    .refund-guarantee strong {
      color: var(--text-primary, #212529);
      display: block;
      margin-bottom: 4px;
      font-size: 1.125rem;
    }

    .refund-guarantee div {
      color: var(--text-secondary, #424242);
      line-height: 1.6;
      font-size: 1rem;
    }

    .btn-home {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg, 1rem) var(--spacing-2xl, 3rem);
      background: var(--primary-gradient, linear-gradient(135deg, #0066CC 0%, #004C99 100%));
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius, 8px);
      font-weight: 600;
      transition: all var(--transition-normal, 0.3s ease-in-out);
      border: 2px solid var(--primary-blue, #0066CC);
      font-size: 1.125rem;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
      min-height: 56px;
    }

    .btn-home:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 102, 204, 0.3);
    }

    .btn-home:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
    }

    .success-footer {
      background: white;
      border-top: 3px solid var(--primary-blue, #0066CC);
      padding: var(--spacing-2xl, 3rem) var(--spacing-xl, 2rem);
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-content h2 {
      color: var(--text-primary, #212529);
      font-size: 1.25rem;
      margin-bottom: var(--spacing-lg, 1.5rem);
      font-weight: 700;
      display: flex;
      align-items: center;
    }

    .footer-content ul,
    .footer-content ol {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-lg, 1.5rem);
    }

    .footer-content li {
      color: var(--text-secondary, #6C757D);
      line-height: 1.6;
      font-size: 1rem;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md, 1rem);
      padding: var(--spacing-md, 1rem);
      background: var(--gray-50, #F8F9FA);
      border-radius: var(--border-radius, 8px);
      border-left: 3px solid var(--primary-blue, #0066CC);
    }

    .footer-content li svg {
      flex-shrink: 0;
      color: var(--primary-blue, #0066CC);
      margin-top: 2px;
    }

    @media (max-width: 768px) {
      .success-content {
        padding: var(--spacing-xl, 2rem) var(--spacing-md, 1rem);
      }

      .success-icon {
        width: 96px;
        height: 96px;
      }

      .success-icon svg {
        width: 48px;
        height: 48px;
      }

      h1 {
        font-size: 1.875rem;
      }

      .success-message {
        font-size: 1.0625rem;
      }

      .btn-home {
        width: 100%;
        font-size: 1.0625rem;
        padding: var(--spacing-lg, 1rem) var(--spacing-xl, 2rem);
      }

      .success-footer {
        padding: var(--spacing-xl, 2rem) var(--spacing-md, 1rem);
      }

      .footer-content h2 {
        font-size: 1.125rem;
      }

      .footer-content ul {
        grid-template-columns: 1fr;
        gap: var(--spacing-md, 1rem);
      }

      .footer-content li {
        font-size: 0.95rem;
      }

      .refund-guarantee {
        padding: var(--spacing-md, 1rem);
        font-size: 0.95rem;
      }

      .refund-guarantee strong {
        font-size: 1.0625rem;
      }
    }
  `]
})
export class SuccessComponent {}
