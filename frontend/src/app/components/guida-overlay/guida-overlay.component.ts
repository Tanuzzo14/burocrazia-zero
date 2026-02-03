import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  helpText: string;
}

@Component({
  selector: 'app-guida-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guida-overlay.component.html',
  styleUrl: './guida-overlay.component.css'
})
export class GuidaOverlayComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() position: HighlightPosition | null = null;
  @Output() close = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Listen for ESC key to close overlay
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.visible) {
      this.closeOverlay();
    }
  };

  closeOverlay(): void {
    this.close.emit();
  }

  get overlayStyle(): { [key: string]: string } {
    if (!this.position) {
      return {};
    }

    // Create a cutout effect using clip-path
    const padding = 8; // Padding around the highlighted element
    const borderRadius = 12; // Rounded corners for the cutout
    
    return {
      'clip-path': `polygon(
        0 0,
        0 100%,
        100% 100%,
        100% 0,
        0 0,
        0 ${this.position.top - padding}px,
        ${this.position.left - padding}px ${this.position.top - padding}px,
        ${this.position.left - padding}px ${this.position.top + this.position.height + padding}px,
        ${this.position.left + this.position.width + padding}px ${this.position.top + this.position.height + padding}px,
        ${this.position.left + this.position.width + padding}px ${this.position.top - padding}px,
        0 ${this.position.top - padding}px
      )`
    };
  }

  get highlightStyle(): { [key: string]: string } {
    if (!this.position) {
      return {};
    }

    const padding = 8;
    
    return {
      top: `${this.position.top - padding}px`,
      left: `${this.position.left - padding}px`,
      width: `${this.position.width + padding * 2}px`,
      height: `${this.position.height + padding * 2}px`
    };
  }

  get tooltipStyle(): { [key: string]: string } {
    if (!this.position) {
      return {};
    }

    const tooltipOffset = 16;
    const top = this.position.top + this.position.height + tooltipOffset;
    
    return {
      top: `${top}px`,
      left: `${this.position.left}px`
    };
  }
}
