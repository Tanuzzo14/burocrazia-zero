import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, OperationIdentification } from './api.service';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GuidaOverlayComponent, HighlightPosition, ScrollDirection } from './components/guida-overlay/guida-overlay.component';
import { InactivityService } from './services/inactivity.service';
import { GuidaService, GuidedField } from './services/guida.service';
import { GuidedFocusDirective, FieldPosition } from './directives/guided-focus.directive';
import { OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, CookieConsentComponent, FooterComponent, NavbarComponent, GuidaOverlayComponent, GuidedFocusDirective],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit, OnDestroy {
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
  bookingForm!: FormGroup;
  
  // Privacy and terms acceptance
  privacyAccepted = false;
  
  // ALTCHA verification
  altchaVerified = false;
  altchaPayload = '';
  
  // Error handling
  errorMessage = '';
  
  // Loading states
  loadingMessage = '';

  // Guided overlay system
  showOverlay = false;
  overlayPosition: HighlightPosition | null = null;
  scrollDirection: ScrollDirection | null = null;
  showOptionsGuide = false;
  private fieldPositions: Map<string, FieldPosition> = new Map();
  private currentFieldIndex = 0;
  private fieldOrder = ['nomeCognome', 'telefono', 'privacy'];
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private inactivityService: InactivityService,
    private fb: FormBuilder,
    private guidaService: GuidaService
  ) {}

  ngOnInit(): void {
    // Initialize reactive form for guided overlay system
    this.bookingForm = this.fb.group({
      nomeCognome: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern(/^(3\d{9}|0\d{8,10})$/)]],
      privacy: [false, [Validators.requiredTrue]]
    });

    // Sync reactive form with template-driven form
    this.bookingForm.get('nomeCognome')?.valueChanges.subscribe(value => {
      this.nomeCognome = value;
    });
    this.bookingForm.get('telefono')?.valueChanges.subscribe(value => {
      this.telefono = value;
    });
    this.bookingForm.get('privacy')?.valueChanges.subscribe(value => {
      this.privacyAccepted = value;
    });
    
    // Set field order for guided navigation
    this.guidaService.setFieldOrder(this.fieldOrder);
    
    // Subscribe to GuidaService observables
    this.guidaService.active$
      .pipe(takeUntil(this.destroy$))
      .subscribe(active => {
        this.showOverlay = active;
        if (!active) {
          this.overlayPosition = null;
          this.scrollDirection = null;
        }
      });
    
    this.guidaService.currentField$
      .pipe(takeUntil(this.destroy$))
      .subscribe(field => {
        if (field) {
          this.overlayPosition = {
            top: field.rect.top,
            left: field.rect.left,
            width: field.rect.width,
            height: field.rect.height,
            helpText: field.helpText
          };
        } else {
          this.overlayPosition = null;
        }
      });
    
    this.guidaService.scrollDirection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(direction => {
        this.scrollDirection = direction;
      });

    this.guidaService.optionsGuide$
      .pipe(takeUntil(this.destroy$))
      .subscribe(active => {
        this.showOptionsGuide = active;
      });
    
    // Only start monitoring inactivity on home page
    if (this.isHomePage()) {
      this.inactivityService.startMonitoring()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          // Auto-show overlay after 10 seconds of inactivity, only if booking form is visible
          if (this.selectedOperation && !this.showOverlay) {
            this.activateGuidedOverlay();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.inactivityService.stopMonitoring();
  }

  onGuidaClick(): void {
    if (!this.isHomePage()) {
      return;
    }

    // Stage 1: Search bar - focus on search input
    if (this.operationOptions.length === 0 && !this.selectedOperation) {
      this.focusSearchBar();
      return;
    }

    // Stage 2: Options selection - show scroll message
    if (this.operationOptions.length > 0 && !this.selectedOperation) {
      this.showOptionsScrollGuide();
      return;
    }

    // Stage 3: Booking form - activate guided overlay
    if (this.selectedOperation) {
      this.activateGuidedOverlay();
    }
  }

  private focusSearchBar(): void {
    // Focus on the search input and activate keyboard
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input-modern') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.click(); // Ensures keyboard activation on mobile
      }
    }, 100);
  }

  private showOptionsScrollGuide(): void {
    // Show a message to scroll down for options
    this.guidaService.activateOptionsGuide();
  }

  activateGuidedOverlay(): void {
    this.guidaService.activate(0);
  }

  closeOverlay(): void {
    this.guidaService.deactivate();
  }

  onFieldPositionChange(position: FieldPosition): void {
    this.fieldPositions.set(position.controlName, position);
    
    // Register/update field with GuidaService
    const guidedField: GuidedField = {
      element: position.element,
      rect: position.rect,
      controlName: position.controlName,
      isValid: position.isValid,
      helpText: position.helpText || this.getDefaultHelpText(position.controlName)
    };
    
    this.guidaService.updateField(guidedField);
  }

  private getDefaultHelpText(fieldName: string): string {
    const helpTexts: { [key: string]: string } = {
      'nomeCognome': 'Inserisci il tuo nome e cognome completo',
      'telefono': 'Inserisci un numero di telefono italiano valido (es. 333 123 4567)',
      'privacy': 'Accetta la Privacy Policy e i Termini e Condizioni per procedere'
    };
    return helpTexts[fieldName] || 'Completa questo campo';
  }

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
