import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { FocusHighlightService } from '../services/focus-highlight.service';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[appFocusHighlight]',
  standalone: true
})
export class FocusHighlightDirective implements OnInit, OnDestroy {
  @Input() highlightLabel?: string;
  @Input() isGroupElement: boolean = false; // For radio groups, checkboxes, etc.
  
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private focusHighlightService: FocusHighlightService
  ) {}

  ngOnInit(): void {
    // Update position on window resize
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updatePosition());

    // Update position on scroll
    fromEvent(window, 'scroll', { passive: true })
      .pipe(
        debounceTime(50),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updatePosition());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update the position of this element in the highlight service
   */
  updatePosition(): void {
    const element = this.getTargetElement();
    if (element) {
      const position = this.focusHighlightService.calculatePosition(
        element,
        this.highlightLabel
      );
      this.focusHighlightService.setHighlight(position);
    }
  }

  /**
   * Get the target element (handles group elements)
   */
  private getTargetElement(): HTMLElement {
    if (this.isGroupElement) {
      // For groups, return the container that wraps all options
      return this.el.nativeElement;
    }
    return this.el.nativeElement;
  }

  /**
   * Trigger highlight for this element
   */
  public triggerHighlight(): void {
    this.updatePosition();
  }
}
