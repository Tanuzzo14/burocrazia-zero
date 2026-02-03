# Active Guidance System

## Overview
The Active Guidance System is a comprehensive user guidance feature that provides a dynamic, omnipresent experience to help users navigate through form completion. It's especially designed for inexperienced users who need clear, visual guidance.

## Key Features

### 1. Smart Scrim with Cutout
- The overlay darkens and blurs the entire screen
- The active form field remains crisp, illuminated, and fully clickable
- Creates a "spotlight" effect that focuses user attention

### 2. Giant Directional Arrows
When the target field is outside the viewport:
- **Down Arrow**: Shows "SCORRI VERSO IL BASSO" (Scroll Down)
- **Up Arrow**: Shows "SCORRI VERSO L'ALTO" (Scroll Up)
- Animated with bounce effects for high visibility
- Real-time updates as user scrolls

### 3. Validation-Based Navigation
- Fields cannot be skipped if they are invalid
- System automatically advances to next invalid field when current one becomes valid
- Arrows insistently guide users back to incomplete fields

### 4. Cross-Platform Responsive Design
- **Desktop (>1024px)**: GUIDAMI button centered in navbar
- **Tablet (769-1024px)**: GUIDAMI button on right, text visible (16px bold)
- **Mobile (<768px)**: GUIDAMI button on right, text visible (16px bold)

## Architecture

### GuidaService (`services/guida.service.ts`)
Global service that manages the guidance state:
- **Observable Streams**:
  - `active$`: Whether guidance is currently active
  - `currentField$`: The field currently being guided
  - `scrollDirection$`: Direction arrows to show (up/down/none)
- **Field Management**:
  - Registers and tracks all form fields
  - Monitors field validity in real-time
  - Maintains field navigation order
- **Scroll Detection**:
  - Uses `getBoundingClientRect()` to check viewport visibility
  - Listens to scroll events globally
  - Calculates whether to show directional arrows

### GuidaOverlayComponent
Renders the guidance UI:
- Backdrop with blur effect
- Highlight box around active field
- Giant directional arrows with animations
- Help tooltips
- Close button

### GuidedFocusDirective
Applied to form fields to enable guidance:
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

## Usage

### 1. Set Field Order
```typescript
this.guidaService.setFieldOrder(['nomeCognome', 'telefono', 'privacy']);
```

### 2. Register Fields
Fields are automatically registered when they emit position changes via the directive:
```typescript
onFieldPositionChange(position: FieldPosition): void {
  const guidedField: GuidedField = {
    element: position.element,
    rect: position.rect,
    controlName: position.controlName,
    isValid: position.isValid,
    helpText: position.helpText || this.getDefaultHelpText(position.controlName)
  };
  
  this.guidaService.updateField(guidedField);
}
```

### 3. Activate Guidance
```typescript
this.guidaService.activate(0); // Start from first field
```

### 4. Subscribe to State Changes
```typescript
this.guidaService.active$.subscribe(active => {
  this.showOverlay = active;
});

this.guidaService.currentField$.subscribe(field => {
  // Update overlay position
});

this.guidaService.scrollDirection$.subscribe(direction => {
  // Update arrow visibility
});
```

### 5. Deactivate Guidance
```typescript
this.guidaService.deactivate();
```

## CSS Animations

### Bounce Animation (Down)
```css
@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(20px); }
}
```

### Bounce Animation (Up)
```css
@keyframes bounceUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

### Arrow Pulse
```css
@keyframes arrowPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}
```

## Accessibility
- Supports keyboard navigation (ESC to close)
- Respects `prefers-reduced-motion` preference
- Proper ARIA labels on interactive elements
- High contrast colors for visibility

## Browser Compatibility
- Modern browsers with ES6+ support
- CSS Grid and Flexbox
- Backdrop filter support (graceful degradation)
- Observable/RxJS support

## Future Enhancements
1. **Multi-page Support**: Automatically detect and guide through forms on all pages
2. **Smart Help Text**: AI-powered contextual help based on user behavior
3. **Progress Indicators**: Show completion percentage
4. **Custom Themes**: Allow customization of colors and animations
5. **Analytics**: Track where users get stuck and need guidance most

## Security Considerations
- No security vulnerabilities detected by CodeQL
- Follows Angular best practices for XSS prevention
- All user inputs are validated and sanitized
- No sensitive data stored in service state

## Performance
- Debounced scroll listeners (100ms) to prevent excessive updates
- Efficient use of Angular change detection
- Minimal DOM manipulations
- Bundle size: ~496KB (within acceptable range)

## Testing
To test the guidance system:
1. Navigate to the home page
2. Search for an operation and select one
3. Click the "GUIDAMI" button in the navbar
4. Try scrolling to see directional arrows
5. Fill in fields to see automatic advancement
6. Test on different screen sizes

## Troubleshooting

### Arrows Not Appearing
- Check that the field is actually outside the viewport
- Verify scroll listeners are active
- Ensure `scrollDirection$` is being subscribed to

### Field Not Advancing
- Check that the current field is marked as valid
- Verify field order is set correctly
- Ensure all fields are registered with the service

### Overlay Not Showing
- Verify `activate()` was called
- Check that `active$` subscription is active
- Ensure component is not being recreated

## Credits
Developed as part of the Burocrazia Zero Active Guidance System implementation.
