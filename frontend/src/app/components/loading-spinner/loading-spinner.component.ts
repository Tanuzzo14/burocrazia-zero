import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="spinner-text">{{ text }}</p>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .spinner-container {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--primary-blue-light, #E6F0FF);
      border-top-color: var(--primary-blue, #0066CC);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .spinner-text {
      color: var(--text-primary, #212529);
      font-size: 0.95rem;
      font-weight: 500;
      margin: 0;
    }

    @media (max-width: 768px) {
      .spinner-container {
        padding: 1.5rem;
        margin: 0 1rem;
      }

      .spinner {
        width: 40px;
        height: 40px;
      }

      .spinner-text {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() text: string = 'Caricamento...';
}
