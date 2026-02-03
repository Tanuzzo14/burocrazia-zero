# Sistema di Overlay Guidato - Guida Rapida

## 🎯 Cosa Fa

Il sistema di overlay guidato è una funzionalità mobile-first che aiuta gli utenti a compilare il form di prenotazione in modo intuitivo e senza errori.

## ✨ Caratteristiche Principali

### 1. Attivazione Automatica
- Si attiva dopo **10 secondi di inattività** (solo su mobile < 768px)
- Mostra un overlay scuro con effetto blur

### 2. "Buco di Luce" Dinamico
- Evidenzia il campo corrente da compilare
- Bordo luminoso animato con effetto pulse
- Transizioni fluide (0.4s cubic-bezier)

### 3. Flusso Guidato dalla Validazione
- Evidenzia automaticamente il **primo campo non valido**
- Si sposta al campo successivo quando quello corrente diventa valido
- Messaggi di aiuto contestuali

### 4. Validazione Intelligente
- **Nome e Cognome**: minimo 3 caratteri
- **Telefono**: numeri italiani (mobile e fisso)
  - Mobile: 3XX XXXXXXX (10 cifre)
  - Fisso: 0X XXXXXXXX (9-11 cifre)
- **Privacy**: accettazione obbligatoria

## 🚀 Come Funziona

1. L'utente apre il form di prenotazione su mobile
2. Dopo 10 secondi senza interazione, appare l'overlay
3. Un "buco di luce" evidenzia il primo campo non valido
4. Un messaggio di aiuto spiega cosa inserire
5. Quando il campo è valido, l'overlay si sposta automaticamente al successivo
6. Una volta compilati tutti i campi, l'overlay scompare

## 📱 Solo Mobile

Il sistema è attivo **solo su schermi < 768px** per fornire assistenza dove è più necessaria, senza disturbare gli utenti desktop.

## 🎨 Aspetto Visivo

- **Overlay**: Sfondo scuro rgba(0, 0, 0, 0.6) con blur di 5px
- **Buco di Luce**: Bordo blu luminoso con animazione pulse
- **Suggerimenti**: Box con gradiente blu e icona informativa
- **Animazioni**: Transizioni smooth di 0.4s

## 🛠️ Componenti Tecnici

1. **InactivityMonitorService**: Traccia l'attività dell'utente
2. **FocusHighlightService**: Gestisce le posizioni degli elementi
3. **FocusHighlightDirective**: Direttiva applicata ai campi del form
4. **GuidedOverlayComponent**: Componente dell'overlay visibile
5. **BookingFormComponent**: Form reattivo con validazione completa

## 📖 Documentazione Completa

Per dettagli tecnici completi, vedi:
- **GUIDED_OVERLAY_DOCUMENTATION.md**: Documentazione tecnica completa in italiano

## 🎯 Vantaggi

- ✅ Riduce gli errori di compilazione
- ✅ Guida l'utente passo-passo
- ✅ Migliora l'esperienza mobile
- ✅ Previene l'abbandono del form
- ✅ Aumenta il tasso di conversione

## 🔧 Personalizzazione

Puoi personalizzare:
- Tempo di inattività (default: 10 secondi)
- Messaggi di aiuto per ogni campo
- Padding intorno al "buco di luce"
- Colori e animazioni
- Breakpoint mobile (default: < 768px)

Vedi la documentazione completa per i dettagli.

## 🌟 Esempio Visivo

```
┌─────────────────────────────────┐
│  [Overlay scuro con blur]       │
│                                  │
│   ┌──────────────────┐          │
│   │ [Nome e Cognome] │ ← Luce   │
│   └──────────────────┘          │
│                                  │
│   💡 Campo obbligatorio:        │
│      inserisci il tuo nome      │
│                                  │
└─────────────────────────────────┘
```

## 📊 Performance

- Eventi gestiti fuori dalla zona Angular
- Debouncing per resize e scroll
- Lazy rendering dell'overlay
- Animazioni hardware-accelerated
- Bundle: ~541 KB (con tutte le funzionalità)

## 🔒 Sicurezza

✅ CodeQL scan: 0 vulnerabilità trovate
✅ Validazione lato client e server
✅ Protezione anti-robot (ALTCHA)

## 🎓 Per Sviluppatori

### Aggiungere un Nuovo Campo

```typescript
// In BookingFormComponent
this.bookingForm = this.fb.group({
  nuovoCampo: ['', [Validators.required]]
});
```

```html
<!-- Nel template -->
<div appFocusHighlight [highlightLabel]="'Messaggio di aiuto'">
  <input formControlName="nuovoCampo" />
</div>
```

## 🤝 Contribuire

Il sistema è modulare e facilmente estendibile. Per contribuire:
1. Consulta la documentazione tecnica
2. Segui le convenzioni di codice esistenti
3. Testa su dispositivi mobili reali
4. Aggiungi test se necessario

---

**Fatto con ❤️ per migliorare l'esperienza utente mobile**
