import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, OperationIdentification } from './api.service';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Burocrazia Zero';
  
  // Step 1: Operation identification
  userQuery = '';
  isIdentifying = false;
  operationResult: OperationIdentification | null = null;
  
  // Step 2: Lead data collection
  nomeCognome = '';
  telefono = '';
  isBooking = false;
  
  // Error handling
  errorMessage = '';
  
  // Loading states
  loadingMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  searchOperation() {
    if (!this.userQuery.trim()) {
      this.errorMessage = 'Inserisci una descrizione dell\'operazione';
      return;
    }

    this.isIdentifying = true;
    this.loadingMessage = 'Identificazione operazione in corso...';
    this.errorMessage = '';
    this.operationResult = null;

    this.apiService.identifyOperation(this.userQuery).subscribe({
      next: (result) => {
        this.operationResult = result;
        this.isIdentifying = false;
        this.loadingMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Errore durante l\'identificazione dell\'operazione. Riprova.';
        this.isIdentifying = false;
        this.loadingMessage = '';
        console.error('Error:', error);
      }
    });
  }

  bookOperation() {
    if (!this.nomeCognome.trim() || !this.telefono.trim()) {
      this.errorMessage = 'Compila tutti i campi';
      return;
    }

    // Validate phone number format (international)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(this.telefono)) {
      this.errorMessage = 'Numero di telefono non valido. Usa il formato internazionale (es. +393331234567)';
      return;
    }

    if (!this.operationResult) {
      this.errorMessage = 'Devi prima identificare un\'operazione';
      return;
    }

    this.isBooking = true;
    this.loadingMessage = 'Creazione prenotazione e reindirizzamento al pagamento...';
    this.errorMessage = '';

    this.apiService.createBooking({
      nome_cognome: this.nomeCognome,
      telefono: this.telefono,
      tipo_operazione: this.operationResult.operation,
      totale_incassato: this.operationResult.totalCost,
      guida_url: this.operationResult.guideUrl
    }).subscribe({
      next: (response) => {
        this.isBooking = false;
        this.loadingMessage = '';
        // Redirect to Stripe checkout
        window.location.href = response.paymentUrl;
      },
      error: (error) => {
        this.errorMessage = 'Errore durante la prenotazione. Riprova.';
        this.isBooking = false;
        this.loadingMessage = '';
        console.error('Error:', error);
      }
    });
  }

  resetForm() {
    this.userQuery = '';
    this.operationResult = null;
    this.nomeCognome = '';
    this.telefono = '';
    this.errorMessage = '';
  }
}
