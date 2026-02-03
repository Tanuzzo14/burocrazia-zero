# Guided Overlay System - Sistema di Assistenza Interattivo

## 📋 Overview

Il sistema di assistenza interattivo guida l'utente passo-passo attraverso la compilazione del form di prenotazione, evidenziando i campi da compilare con un overlay visivo elegante e animato.

## ✨ Caratteristiche Principali

### 1. Attivazione Duale
- **Automatica**: Dopo 10 secondi di inattività dell'utente (nessun movimento del mouse, scroll, touch o digitazione)
- **Manuale**: Tramite il pulsante "GUIDAMI" nella navbar

### 2. Responsive Design del Pulsante GUIDAMI
- **Desktop (> 1024px)**: Posizionato al centro della navbar
- **Tablet (768-1024px)**: Posizionato a destra della navbar
- **Mobile (< 768px)**: Posizionato a destra, mostra solo l'icona

### 3. Overlay Intelligente
- Effetto "buco di luce" con sfondo sfocato (backdrop-filter: blur(5px))
- Evidenzia il primo campo non valido del form
- Si sposta fluidamente al campo successivo quando quello corrente diventa valido
- Include tooltip contestuali con suggerimenti specifici per ogni campo
- Animazioni fluide con cubic-bezier per transizioni professionali

## 🏗️ Architettura

### Componenti

#### 1. **InactivityService** (`services/inactivity.service.ts`)
- Monitora l'attività dell'utente (mousemove, scroll, touchstart, keydown, click)
- Usa RxJS per gestire gli eventi in modo efficiente
- Esegue fuori dalla Angular zone per migliori performance
- Emette un segnale dopo 10 secondi di inattività

#### 2. **GuidedFocusDirective** (`directives/guided-focus.directive.ts`)
- Direttiva applicata ai campi del form
- Calcola le coordinate dell'elemento usando `getBoundingClientRect()`
- Monitora le modifiche di validità del FormControl
- Reagisce a resize e scroll per mantenere le posizioni aggiornate
- Comunica le posizioni tramite eventi

#### 3. **GuidaOverlayComponent** (`components/guida-overlay/guida-overlay.component.ts`)
- Componente standalone per l'overlay
- Gestisce la visualizzazione del "buco di luce"
- Mostra tooltip con testi di aiuto
- Supporta chiusura con click o tasto ESC
- Animazioni fluide per tutte le transizioni

#### 4. **NavbarComponent** (aggiornato)
- Aggiunto pulsante "GUIDAMI" con layout responsive
- Emette evento quando cliccato per attivare l'overlay

### Integrazione nel Form

Il sistema è integrato nell'AppComponent con un ReactiveForm che include:
- Campo Nome e Cognome (validazione: required, minLength)
- Campo Telefono (validazione: required, pattern per numeri italiani)
- Checkbox Privacy (validazione: requiredTrue)

## 🎨 Design UI/UX

### Effetti Visivi
- **Backdrop**: rgba(0,0,0,0.6) con blur di 5px
- **Evidenziazione**: Bordo blu con ombra e animazione pulsante
- **Transizioni**: `cubic-bezier(0.4, 0, 0.2, 1)` per movimento naturale
- **Tooltip**: Design moderno con freccia e ombra
- **Angoli arrotondati**: 12px per un look professionale

### Accessibilità
- Supporto completo per tastiera (ESC per chiudere)
- ARIA labels appropriati
- Rispetto delle preferenze di movimento ridotto (prefers-reduced-motion)
- Contrasto colori conforme WCAG

## 📱 Comportamento Responsive

### Mobile (< 768px)
- Pulsante GUIDAMI: solo icona, posizionato a destra
- Overlay adattato per schermi piccoli
- Tooltip a larghezza piena con padding ridotto
- Touch-friendly (eventi touchstart monitorati)

### Tablet (768-1024px)
- Pulsante GUIDAMI: testo completo, posizionato a destra
- Overlay ottimizzato per tablet

### Desktop (> 1024px)
- Pulsante GUIDAMI: testo completo, centrato
- Layout completo con tutti i menu visibili
- Overlay con dimensioni ottimali

## 🔧 Utilizzo

### 1. Nel Template
```html
<input 
  type="text"
  formControlName="nomeCognome"
  appGuidedFocus
  [guidedFocusName]="'nomeCognome'"
  [guidedFocusHelp]="'Inserisci il tuo nome e cognome completo'"
  (positionChange)="onFieldPositionChange($event)"
/>
```

### 2. Nel Component
```typescript
// Attivare manualmente l'overlay
activateGuidedOverlay(): void {
  this.showOverlay = true;
  this.currentFieldIndex = 0;
  this.updateOverlayPosition();
}

// Gestire i cambiamenti di posizione
onFieldPositionChange(position: FieldPosition): void {
  this.fieldPositions.set(position.controlName, position);
  if (this.showOverlay) {
    this.updateOverlayPosition();
  }
}
```

### 3. Nella Navbar
```html
<app-navbar (guidaClick)="onGuidaClick()"></app-navbar>
```

## 🚀 Performance

- Eventi monitorati fuori dalla Angular zone
- Debouncing degli eventi di scroll e resize (100ms)
- ResizeObserver per rilevamento efficiente delle modifiche di dimensione
- Passive event listeners per scroll e touch
- Animazioni con GPU acceleration (transform, opacity)

## 🔐 Sicurezza

- Nessun dato sensibile memorizzato
- Form validation lato client e server
- Pattern validation per numeri di telefono italiani
- RequiredTrue validator per privacy acceptance

## 📊 Stati del Form

1. **Iniziale**: Form vuoto, overlay non attivo
2. **In compilazione**: Utente compila i campi
3. **Inattività rilevata**: Dopo 10s, overlay si attiva automaticamente
4. **Guidato**: Overlay evidenzia campo per campo
5. **Completato**: Tutti i campi validi, overlay si chiude automaticamente

## 🎯 Campo Ordine di Focus

1. Nome e Cognome
2. Telefono
3. Privacy Checkbox

L'overlay si sposta automaticamente al prossimo campo non valido quando l'utente completa un campo.

## 🐛 Debug

Per testare il sistema:
1. Aprire la pagina e cercare un'operazione
2. Selezionare un'opzione per visualizzare il form
3. Cliccare "GUIDAMI" o attendere 10 secondi di inattività
4. L'overlay dovrebbe evidenziare il primo campo non valido
5. Compilare il campo e verificare che l'overlay si sposti al successivo

## 📝 Note Tecniche

- Il sistema usa Angular Signals per comunicazione reattiva
- RxJS operators: takeUntil, debounceTime, switchMap
- CSS Grid per layout responsive della navbar
- Standalone components per modularità
- TypeScript strict mode per type safety
