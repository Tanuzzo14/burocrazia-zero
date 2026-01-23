import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-cancel',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="cancel-container">
      <div class="cancel-card">
        <div class="cancel-icon">✕</div>
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
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      padding: 2rem;
    }

    .cancel-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 500px;
    }

    .cancel-icon {
      width: 80px;
      height: 80px;
      background: #e74c3c;
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

    .cancel-message {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .info-box {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .info-box p {
      color: #34495e;
      line-height: 1.6;
      margin: 0;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
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
export class CancelComponent {}
