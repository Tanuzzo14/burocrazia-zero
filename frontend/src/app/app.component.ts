import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, OperationIdentification } from './api.service';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, CookieConsentComponent, FooterComponent, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'Burocrazia Zero: la nostra AI lavora, i nostri esperti risolvono. Al posto tuo.';
  
  // Step 1: Operation identification
  userQuery = '';
  isIdentifying = false;
  operationOptions: OperationIdentification[] = [];
  selectedOperation: OperationIdentification | null = null;
  
  // Step 2: Lead data collection
  nomeCognome = '';
  telefono = '';
  isBooking = false;
  
  // Privacy and terms acceptance
  privacyAccepted = false;
  
  // ALTCHA verification
  altchaVerified = false;
  altchaPayload = '';
  
  // Error handling
  errorMessage = '';
  
  // Loading states
  loadingMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  closeErrorMessage() {
    this.errorMessage = '';
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  onAltchaVerified(event: any) {
    this.altchaVerified = true;
    this.altchaPayload = event.detail.payload;
    console.log('ALTCHA verified:', this.altchaPayload);
  }

  onAltchaStateChange(event: any) {
    if (event.detail.state === 'error') {
      this.altchaVerified = false;
      this.altchaPayload = '';
    }
  }

  searchOperation() {
    if (!this.userQuery.trim()) {
      this.errorMessage = 'Inserisci una descrizione dell\'operazione';
      return;
    }

    this.isIdentifying = true;
    this.loadingMessage = 'Identificazione operazione in corso...';
    this.errorMessage = '';
    this.operationOptions = [];
    this.selectedOperation = null;

    this.apiService.identifyOperation(this.userQuery).subscribe({
      next: (result) => {
        this.operationOptions = result.options;
        // If only one option, auto-select it
        if (this.operationOptions.length === 1) {
          this.selectedOperation = this.operationOptions[0];
        }
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

  selectOperation(operation: OperationIdentification) {
    this.selectedOperation = operation;
  }

  handleOptionClick(option: OperationIdentification) {
    this.selectOperation(option);
  }

  bookOperation() {
    if (!this.nomeCognome.trim() || !this.telefono.trim()) {
      this.errorMessage = 'Compila tutti i campi';
      return;
    }

    // Validate Italian phone number format (remove spaces and common separators)
    const cleanPhone = this.telefono.replace(/[\s\-\.]/g, '');
    // Italian mobile numbers: 3XX XXXXXXX (10 digits total, starts with 3)
    // Italian landline: 0[1-9] followed by 8-10 more digits (9-11 digits total)
    const italianPhoneRegex = /^(3\d{9}|0\d{8,10})$/;
    
    if (!italianPhoneRegex.test(cleanPhone)) {
      this.errorMessage = 'Numero di telefono non valido. Inserisci un numero italiano valido (es. 333 123 4567)';
      return;
    }

    if (!this.privacyAccepted) {
      this.errorMessage = 'Devi accettare la Privacy Policy e i Termini e Condizioni per procedere';
      return;
    }

    if (!this.altchaVerified) {
      this.errorMessage = 'Completa la verifica anti-robot prima di procedere';
      return;
    }

    if (!this.selectedOperation) {
      this.errorMessage = 'Devi prima selezionare un\'opzione';
      return;
    }

    this.isBooking = true;
    this.loadingMessage = 'Creazione prenotazione e reindirizzamento al pagamento...';
    this.errorMessage = '';

    // Add +39 prefix to the phone number before sending to backend
    const phoneWithPrefix = '+39' + cleanPhone;

    this.apiService.createBooking({
      nome_cognome: this.nomeCognome,
      telefono: phoneWithPrefix,
      tipo_operazione: this.selectedOperation.operation,
      totale_incassato: this.selectedOperation.totalCost,
      guida_url: this.selectedOperation.guideUrl
    }).subscribe({
      next: (response) => {
        this.isBooking = false;
        this.loadingMessage = '';
        // Redirect to PayPal checkout
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
    this.operationOptions = [];
    this.selectedOperation = null;
    this.nomeCognome = '';
    this.telefono = '';
    this.privacyAccepted = false;
    this.altchaVerified = false;
    this.altchaPayload = '';
    this.errorMessage = '';
  }
}
