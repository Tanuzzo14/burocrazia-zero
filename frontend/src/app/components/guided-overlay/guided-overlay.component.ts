import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FocusHighlightService, ElementPosition } from '../../services/focus-highlight.service';
import { InactivityMonitorService } from '../../services/inactivity-monitor.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-guided-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guided-overlay.component.html',
  styleUrls: ['./guided-overlay.component.css']
})
export class GuidedOverlayComponent implements OnInit, OnDestroy {
  showOverlay = false;
  currentPosition: ElementPosition | null = null;
  isMobile = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private focusHighlightService: FocusHighlightService,
    private inactivityMonitor: InactivityMonitorService,
    private breakpointObserver: BreakpointObserver,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Check if mobile
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, '(max-width: 767px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        if (!this.isMobile) {
          this.hideOverlay();
        }
      });

    // Monitor inactivity (only on mobile)
    this.inactivityMonitor
      .startMonitoring()
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.isMobile)
      )
      .subscribe(isInactive => {
        this.ngZone.run(() => {
          if (isInactive && this.currentPosition) {
            this.showOverlay = true;
          } else {
            this.hideOverlay();
          }
        });
      });

    // Listen to highlight changes
    this.focusHighlightService
      .getCurrentHighlight()
      .pipe(takeUntil(this.destroy$))
      .subscribe(position => {
        this.ngZone.run(() => {
          this.currentPosition = position;
          // If overlay is showing and position changes, keep it visible
          if (this.showOverlay && position) {
            // Position updated, overlay stays visible
          }
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hideOverlay(): void {
    this.showOverlay = false;
  }

  /**
   * Get the mask style for creating the "light hole" effect
   */
  getMaskStyle(): any {
    if (!this.currentPosition) {
      return {};
    }

    const { top, left, width, height } = this.currentPosition;
    const padding = 12; // Extra space around the element
    const borderRadius = 8; // Rounded corners

    // Calculate the hole dimensions with padding
    const holeTop = top - padding;
    const holeLeft = left - padding;
    const holeWidth = width + (padding * 2);
    const holeHeight = height + (padding * 2);

    // Create a radial gradient mask to create the hole effect
    // This creates a transparent area where the element is
    const maskImage = `
      radial-gradient(
        ellipse ${holeWidth / 2}px ${holeHeight / 2}px at ${holeLeft + holeWidth / 2}px ${holeTop + holeHeight / 2}px,
        transparent 0%,
        transparent 100%,
        black 100%
      ),
      linear-gradient(black, black)
    `;

    return {
      'mask-image': maskImage,
      '-webkit-mask-image': maskImage,
      'mask-composite': 'exclude',
      '-webkit-mask-composite': 'destination-out'
    };
  }

  /**
   * Get the style for the highlight box (visible border around the hole)
   */
  getHighlightBoxStyle(): any {
    if (!this.currentPosition) {
      return { display: 'none' };
    }

    const { top, left, width, height } = this.currentPosition;
    const padding = 12;
    const borderRadius = 8;

    return {
      position: 'absolute',
      top: `${top - padding}px`,
      left: `${left - padding}px`,
      width: `${width + (padding * 2)}px`,
      height: `${height + (padding * 2)}px`,
      border: '2px solid rgba(66, 153, 225, 0.8)',
      'border-radius': `${borderRadius}px`,
      'box-shadow': '0 0 20px rgba(66, 153, 225, 0.5), inset 0 0 20px rgba(66, 153, 225, 0.2)',
      'pointer-events': 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      'z-index': '10001'
    };
  }

  /**
   * Get the style for the hint text
   */
  getHintStyle(): any {
    if (!this.currentPosition) {
      return { display: 'none' };
    }

    const { top, left, width, height, label } = this.currentPosition;
    const padding = 12;

    return {
      position: 'absolute',
      top: `${top + height + padding + 16}px`,
      left: `${left}px`,
      'max-width': `${Math.max(width, 200)}px`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      'z-index': '10002'
    };
  }

  /**
   * Handle click on overlay backdrop (hide overlay)
   */
  onOverlayClick(): void {
    this.hideOverlay();
    this.inactivityMonitor.resetTimer();
  }
}
