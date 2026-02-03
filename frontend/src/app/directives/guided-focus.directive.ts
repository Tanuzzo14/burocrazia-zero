import { Directive, ElementRef, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

export interface FieldPosition {
  element: HTMLElement;
  rect: DOMRect;
  controlName: string;
  isValid: boolean;
  helpText?: string;
}

@Directive({
  selector: '[appGuidedFocus]',
  standalone: true
})
export class GuidedFocusDirective implements OnInit, OnDestroy {
  @Input() guidedFocusName: string = '';
  @Input() guidedFocusHelp: string = '';
  @Output() positionChange = new EventEmitter<FieldPosition>();
  
  private destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private ngControl: NgControl
  ) {}

  ngOnInit(): void {
    // Emit initial position
    this.emitPosition();

    // Listen for value changes to update validity state
    if (this.ngControl.statusChanges) {
      this.ngControl.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.emitPosition();
        });
    }

    // Listen for window resize to update positions
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitPosition();
      });

    // Use ResizeObserver for element-specific size changes
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.emitPosition();
      });
      this.resizeObserver.observe(this.el.nativeElement);
    }

    // Listen for scroll events on all scrollable parents
    this.addScrollListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private addScrollListeners(): void {
    let parent = this.el.nativeElement.parentElement;
    while (parent) {
      const hasScroll = parent.scrollHeight > parent.clientHeight || 
                       parent.scrollWidth > parent.clientWidth;
      
      if (hasScroll) {
        fromEvent(parent, 'scroll', { passive: true })
          .pipe(
            debounceTime(100),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            this.emitPosition();
          });
      }
      parent = parent.parentElement;
    }

    // Also listen to document scroll
    fromEvent(document, 'scroll', { passive: true, capture: true })
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitPosition();
      });
  }

  private emitPosition(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const isValid = this.ngControl.valid || false;
    
    this.positionChange.emit({
      element: this.el.nativeElement,
      rect: rect,
      controlName: this.guidedFocusName || this.ngControl.name?.toString() || '',
      isValid: isValid,
      helpText: this.guidedFocusHelp
    });
  }

  /**
   * Public method to manually trigger position update
   */
  updatePosition(): void {
    this.emitPosition();
  }
}
