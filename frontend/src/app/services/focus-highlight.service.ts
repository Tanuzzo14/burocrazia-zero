import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  element: HTMLElement;
  label?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FocusHighlightService {
  private currentHighlight$ = new BehaviorSubject<ElementPosition | null>(null);

  /**
   * Set the current element to highlight
   */
  setHighlight(position: ElementPosition | null): void {
    this.currentHighlight$.next(position);
  }

  /**
   * Get the current highlight position
   */
  getCurrentHighlight(): Observable<ElementPosition | null> {
    return this.currentHighlight$.asObservable();
  }

  /**
   * Clear the current highlight
   */
  clearHighlight(): void {
    this.currentHighlight$.next(null);
  }

  /**
   * Calculate element position relative to viewport
   */
  calculatePosition(element: HTMLElement, label?: string): ElementPosition {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height,
      element,
      label
    };
  }
}
