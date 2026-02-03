# Sistema di Overlay Guidato con Validazione (Guided Focus Overlay)

## Panoramica

Questo documento descrive il sistema di assistenza mobile-first implementato per guidare gli utenti attraverso la compilazione del form di prenotazione. Il sistema mostra un overlay con un "buco di luce" (light hole) che evidenzia il campo corrente che l'utente deve compilare, attivandosi automaticamente dopo 10 secondi di inattività.

## Componenti Implementati

### 1. InactivityMonitorService

**Posizione:** `src/app/services/inactivity-monitor.service.ts`

**Funzionalità:**
- Monitora l'attività dell'utente (mousemove, scroll, touchstart, keydown)
- Emette un segnale dopo 10 secondi di inattività
- Utilizza RxJS per gestire gli eventi in modo efficiente
- Esegue al di fuori della zona Angular per ottimizzare le performance

**Utilizzo:**
```typescript
constructor(private inactivityMonitor: InactivityMonitorService) {}

ngOnInit() {
  this.inactivityMonitor.startMonitoring()
    .pipe(takeUntil(this.destroy$))
    .subscribe(isInactive => {
      if (isInactive) {
        // Mostra overlay
      } else {
        // Nascondi overlay
      }
    });
}
```

### 2. FocusHighlightService

**Posizione:** `src/app/services/focus-highlight.service.ts`

**Funzionalità:**
- Gestisce lo stato dell'elemento corrente da evidenziare
- Calcola la posizione dell'elemento rispetto al viewport
- Fornisce un observable per tracciare i cambiamenti di posizione

**Interfaccia ElementPosition:**
```typescript
interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  element: HTMLElement;
  label?: string; // Testo di aiuto da mostrare
}
```

### 3. FocusHighlightDirective

**Posizione:** `src/app/directives/focus-highlight.directive.ts`

**Funzionalità:**
- Direttiva da applicare agli elementi del form
- Traccia automaticamente la posizione dell'elemento
- Supporta elementi raggruppati (radio buttons, checkboxes)
- Si aggiorna automaticamente su resize e scroll

**Utilizzo:**
```html
<div class="form-group" 
     appFocusHighlight 
     [highlightLabel]="'Campo obbligatorio: inserisci il tuo nome'"
     [isGroupElement]="false">
  <input type="text" formControlName="nome" />
</div>
```

### 4. GuidedOverlayComponent

**Posizione:** `src/app/components/guided-overlay/guided-overlay.component.ts`

**Funzionalità:**
- Mostra l'overlay con effetto blur (backdrop-filter: blur(5px))
- Crea il "buco di luce" intorno all'elemento evidenziato
- Mostra suggerimenti testuali contestuali
- Attivo solo su schermi < 768px (mobile-only)
- Animazioni fluide con cubic-bezier(0.4, 0, 0.2, 1)

**Caratteristiche Visive:**
- Sfondo scuro semi-trasparente (rgba(0, 0, 0, 0.6))
- Bordo luminoso animato intorno all'elemento evidenziato
- Box di suggerimento con gradiente blu
- Transizioni smooth di 0.4s

### 5. BookingFormComponent

**Posizione:** `src/app/components/booking-form/booking-form.component.ts`

**Funzionalità:**
- Form reattivo con validazione completa
- Gestisce il flusso di validazione campo per campo
- Evidenzia automaticamente il primo campo non valido
- Integrato con il sistema di overlay guidato

**Campi del Form:**
1. **Nome e Cognome**
   - Validazione: required, minLength(3)
   - Messaggio: "Campo obbligatorio: inserisci il tuo nome e cognome"

2. **Telefono**
   - Validazione: required, custom validator per numeri italiani
   - Pattern accettati: 
     - Mobile: 3XX XXXXXXX (10 cifre)
     - Fisso: 0X XXXXXXXX (9-11 cifre)
   - Messaggio: "Campo obbligatorio: inserisci il tuo numero di telefono italiano"

3. **Privacy Policy**
   - Validazione: requiredTrue
   - Messaggio: "Campo obbligatorio: accetta la Privacy Policy e i Termini per procedere"

## Flusso di Validazione

Il sistema implementa un flusso di validazione progressivo:

1. L'utente apre il form di prenotazione
2. Dopo 10 secondi di inattività (solo su mobile), si attiva l'overlay
3. Il sistema identifica il primo campo non valido
4. L'overlay evidenzia quel campo con il "buco di luce"
5. Viene mostrato un suggerimento contestuale
6. Quando l'utente compila correttamente il campo, l'overlay si sposta automaticamente al campo successivo non valido
7. Quando tutti i campi sono validi, l'overlay scompare

## Configurazione Mobile-Only

Il sistema utilizza `BreakpointObserver` di Angular CDK per attivare l'overlay solo su dispositivi mobili:

```typescript
this.breakpointObserver
  .observe([Breakpoints.XSmall, Breakpoints.Small, '(max-width: 767px)'])
  .pipe(takeUntil(this.destroy$))
  .subscribe(result => {
    this.isMobile = result.matches;
    if (!this.isMobile) {
      this.hideOverlay();
    }
  });
```

## Personalizzazione

### Modificare il tempo di inattività

In `InactivityMonitorService`:
```typescript
private inactivityThreshold = 10000; // Modificare questo valore (in millisecondi)
```

### Modificare lo stile del "buco di luce"

In `GuidedOverlayComponent.ts`:
```typescript
const padding = 12; // Spazio extra intorno all'elemento
const borderRadius = 8; // Angoli arrotondati
```

### Personalizzare i messaggi di aiuto

Nel template HTML del form, modificare l'attributo `highlightLabel`:
```html
<div appFocusHighlight [highlightLabel]="'Il tuo messaggio personalizzato'">
```

## Integrazione nel Progetto

Il sistema è già integrato in `AppComponent` e si attiva automaticamente quando l'utente visualizza il form di prenotazione. Non richiede configurazione aggiuntiva.

**Componenti utilizzati in app.component.html:**
```html
<!-- Overlay guidato -->
<app-guided-overlay></app-guided-overlay>

<!-- Form di prenotazione con validazione -->
<app-booking-form
  [selectedOperation]="selectedOperation"
  [isBooking]="isBooking"
  [altchaVerified]="altchaVerified"
  (submitBooking)="handleBookingSubmit($event)"
  (cancel)="resetForm()"
  (altchaVerifiedChange)="onAltchaVerifiedChange($event)"
></app-booking-form>
```

## Dipendenze

- **@angular/cdk**: Per BreakpointObserver (versione compatibile con Angular 19.x)
- **rxjs**: Per la gestione degli eventi asincroni
- **@angular/forms**: Per ReactiveFormsModule

## Performance

Il sistema è ottimizzato per le performance:
- Eventi gestiti fuori dalla zona Angular quando possibile
- Debouncing degli eventi di resize e scroll
- Lazy rendering dell'overlay (solo quando necessario)
- Animazioni CSS hardware-accelerated

## Browser Support

Il sistema utilizza funzionalità moderne CSS:
- `backdrop-filter` (con fallback)
- `mask-image` per il "buco di luce"
- CSS custom properties (variabili CSS)
- Flexbox e Grid

Supportato da:
- Chrome/Edge 76+
- Firefox 103+
- Safari 9+
- iOS Safari 9+

## Accessibilità

- L'overlay può essere chiuso cliccando sul backdrop
- Il sistema resetta il timer di inattività quando l'utente interagisce
- I messaggi di aiuto sono chiari e descrittivi
- Supporto keyboard navigation (attraverso il form standard)

## Manutenzione

Per mantenere il sistema:
1. Assicurarsi che i campi del form abbiano la direttiva `appFocusHighlight`
2. Fornire messaggi di aiuto descrittivi tramite `highlightLabel`
3. Testare su dispositivi mobili reali
4. Verificare che le validazioni siano coerenti con i messaggi di aiuto

## Esempio Completo

Ecco un esempio di come aggiungere un nuovo campo al form:

```typescript
// Nel BookingFormComponent
ngOnInit(): void {
  this.bookingForm = this.fb.group({
    // ... campi esistenti
    email: ['', [Validators.required, Validators.email]]
  });
  
  this.formControlNames = ['nomeCognome', 'telefono', 'email', 'privacyAccepted'];
}
```

```html
<!-- Nel template -->
<div class="form-group" 
     appFocusHighlight 
     [highlightLabel]="'Campo obbligatorio: inserisci il tuo indirizzo email'">
  <label for="email">
    Email
    <span style="color: var(--error);">*</span>
  </label>
  <input 
    type="email" 
    id="email"
    formControlName="email"
    placeholder="esempio@email.it"
    [disabled]="isBooking"
    [class.error]="shouldShowError('email')"
  />
  <small class="error-message" *ngIf="shouldShowError('email')">
    {{ getErrorMessage('email') }}
  </small>
</div>
```

## Troubleshooting

### L'overlay non si attiva
- Verificare che il dispositivo sia mobile (< 768px)
- Controllare che ci sia inattività per almeno 10 secondi
- Verificare che il form abbia campi non validi

### Il "buco di luce" non è posizionato correttamente
- Assicurarsi che l'elemento abbia la direttiva `appFocusHighlight`
- Verificare che l'elemento sia visibile (non nascosto o fuori viewport)
- Controllare che non ci siano trasformazioni CSS che alterano la posizione

### L'overlay non si sposta al campo successivo
- Verificare che il campo corrente diventi `valid` dopo la compilazione
- Controllare l'ordine dei campi in `formControlNames`
- Assicurarsi che i validatori siano configurati correttamente

## Conclusione

Il sistema di Overlay Guidato fornisce un'esperienza utente moderna e intuitiva, particolarmente utile su dispositivi mobili dove la compilazione di form può essere più complessa. Il sistema è altamente personalizzabile e può essere esteso per supportare casi d'uso aggiuntivi.
