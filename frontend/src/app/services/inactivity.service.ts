import { Injectable, NgZone } from '@angular/core';
import { Observable, fromEvent, merge, Subject, timer } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivitySubject = new Subject<void>();
  private stopMonitoring$ = new Subject<void>();
  private isMonitoring = false;
  
  // Inactivity timeout in milliseconds (10 seconds)
  private readonly INACTIVITY_TIMEOUT = 10000;

  constructor(private ngZone: NgZone) {}

  /**
   * Starts monitoring user activity
   * Emits when user is inactive for the specified timeout period
   */
  startMonitoring(): Observable<void> {
    if (this.isMonitoring) {
      return this.inactivitySubject.asObservable();
    }

    this.isMonitoring = true;

    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      // Monitor multiple user activity events
      const activity$ = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'scroll', { passive: true, capture: true }),
        fromEvent(document, 'touchstart', { passive: true }),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'click')
      );

      // Debounce activity events and start inactivity timer
      activity$
        .pipe(
          debounceTime(300), // Debounce to avoid excessive timer resets
          switchMap(() => timer(this.INACTIVITY_TIMEOUT)), // Start timer after activity stops
          takeUntil(this.stopMonitoring$)
        )
        .subscribe(() => {
          // Run in Angular zone when emitting
          this.ngZone.run(() => {
            this.inactivitySubject.next();
          });
        });
    });

    return this.inactivitySubject.asObservable();
  }

  /**
   * Stops monitoring user activity
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.stopMonitoring$.next();
  }

  /**
   * Resets the inactivity timer without stopping monitoring
   */
  resetTimer(): void {
    // Simply triggering a new event will reset the timer through the switchMap
    this.ngZone.runOutsideAngular(() => {
      document.dispatchEvent(new Event('click'));
    });
  }
}
