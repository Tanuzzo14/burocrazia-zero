import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface GuidedField {
  element: HTMLElement;
  rect: DOMRect;
  controlName: string;
  isValid: boolean;
  helpText: string;
}

export interface ScrollDirection {
  show: boolean;
  direction: 'up' | 'down';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class GuidaService {
  private fields: Map<string, GuidedField> = new Map();
  private currentFieldIndex = 0;
  private fieldOrder: string[] = [];
  
  // Observable streams
  private activeSubject = new BehaviorSubject<boolean>(false);
  private currentFieldSubject = new BehaviorSubject<GuidedField | null>(null);
  private scrollDirectionSubject = new BehaviorSubject<ScrollDirection>({ show: false, direction: 'down', message: '' });
  
  public active$ = this.activeSubject.asObservable();
  public currentField$ = this.currentFieldSubject.asObservable();
  public scrollDirection$ = this.scrollDirectionSubject.asObservable();

  constructor() {
    // Listen to scroll events globally
    fromEvent(window, 'scroll', { passive: true })
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.updateScrollDirection();
      });
  }

  /**
   * Register a field for guided navigation
   */
  registerField(field: GuidedField): void {
    this.fields.set(field.controlName, field);
    
    // Update field order if not already present
    if (!this.fieldOrder.includes(field.controlName)) {
      this.fieldOrder.push(field.controlName);
    }
    
    // Update current field if it's the active one
    if (this.activeSubject.value && this.getCurrentFieldName() === field.controlName) {
      this.updateCurrentField();
    }
  }

  /**
   * Update an existing field's data
   */
  updateField(field: GuidedField): void {
    this.fields.set(field.controlName, field);
    
    // If this is the current field and guidance is active, update display
    if (this.activeSubject.value && this.getCurrentFieldName() === field.controlName) {
      this.updateCurrentField();
      
      // Auto-advance if field becomes valid
      if (field.isValid) {
        this.moveToNextInvalidField();
      }
    }
  }

  /**
   * Activate the guidance system
   */
  activate(startFieldIndex: number = 0): void {
    this.currentFieldIndex = startFieldIndex;
    this.activeSubject.next(true);
    this.updateCurrentField();
  }

  /**
   * Deactivate the guidance system
   */
  deactivate(): void {
    this.activeSubject.next(false);
    this.currentFieldSubject.next(null);
    this.scrollDirectionSubject.next({ show: false, direction: 'down', message: '' });
  }

  /**
   * Set the order of fields for navigation
   */
  setFieldOrder(order: string[]): void {
    this.fieldOrder = order;
  }

  /**
   * Get the name of the current field
   */
  private getCurrentFieldName(): string {
    return this.fieldOrder[this.currentFieldIndex] || '';
  }

  /**
   * Update the current field being guided
   */
  private updateCurrentField(): void {
    const fieldName = this.getCurrentFieldName();
    const field = this.fields.get(fieldName);
    
    if (field && !field.isValid) {
      this.currentFieldSubject.next(field);
      this.updateScrollDirection();
    } else {
      // Field is valid or not found, try next field
      this.moveToNextInvalidField();
    }
  }

  /**
   * Move to the next invalid field
   */
  private moveToNextInvalidField(): void {
    const startIndex = this.currentFieldIndex;
    let attempts = 0;
    
    // Find next invalid field
    while (attempts < this.fieldOrder.length) {
      this.currentFieldIndex = (this.currentFieldIndex + 1) % this.fieldOrder.length;
      const fieldName = this.getCurrentFieldName();
      const field = this.fields.get(fieldName);
      
      if (field && !field.isValid) {
        this.currentFieldSubject.next(field);
        this.updateScrollDirection();
        return;
      }
      
      // If we've cycled through all fields and all are valid, deactivate
      if (this.currentFieldIndex === startIndex) {
        this.deactivate();
        return;
      }
      
      attempts++;
    }
    
    // No invalid fields found, deactivate
    this.deactivate();
  }

  /**
   * Check if element is in viewport and update scroll direction
   */
  private updateScrollDirection(): void {
    const currentField = this.currentFieldSubject.value;
    if (!currentField || !this.activeSubject.value) {
      this.scrollDirectionSubject.next({ show: false, direction: 'down', message: '' });
      return;
    }

    const rect = currentField.element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Consider element visible if at least 50% is in viewport
    const elementMiddle = rect.top + rect.height / 2;
    const isInViewport = elementMiddle >= 0 && elementMiddle <= viewportHeight;
    
    if (isInViewport) {
      // Element is visible, no arrows needed
      this.scrollDirectionSubject.next({ show: false, direction: 'down', message: '' });
    } else if (rect.top > viewportHeight) {
      // Element is below viewport
      this.scrollDirectionSubject.next({
        show: true,
        direction: 'down',
        message: 'SCORRI VERSO IL BASSO'
      });
    } else if (rect.bottom < 0) {
      // Element is above viewport
      this.scrollDirectionSubject.next({
        show: true,
        direction: 'up',
        message: 'SCORRI VERSO L\'ALTO'
      });
    }
  }

  /**
   * Manually trigger scroll direction update (useful after programmatic scrolls)
   */
  public refreshScrollDirection(): void {
    this.updateScrollDirection();
  }

  /**
   * Clear all registered fields (useful when navigating to new page)
   */
  clearFields(): void {
    this.fields.clear();
    this.fieldOrder = [];
  }

  /**
   * Check if guidance is currently active
   */
  isActive(): boolean {
    return this.activeSubject.value;
  }
}
