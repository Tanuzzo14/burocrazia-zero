import { Injectable, NgZone } from '@angular/core';
import { fromEvent, merge, Observable, Subject, timer } from 'rxjs';
import { debounceTime, map, switchMap, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityMonitorService {
  private inactivityThreshold = 10000; // 10 seconds
  private inactivityDetected$ = new Subject<boolean>();

  constructor(private ngZone: NgZone) {}

  /**
   * Starts monitoring user activity (mousemove, scroll, touchstart)
   * Emits true when user is inactive for the threshold duration
   */
  startMonitoring(): Observable<boolean> {
    return this.ngZone.runOutsideAngular(() => {
      const mousemove$ = fromEvent(document, 'mousemove');
      const scroll$ = fromEvent(document, 'scroll', { capture: true, passive: true });
      const touchstart$ = fromEvent(document, 'touchstart', { passive: true });
      const keydown$ = fromEvent(document, 'keydown');

      // Merge all activity events
      const activity$ = merge(mousemove$, scroll$, touchstart$, keydown$);

      return activity$.pipe(
        startWith(null), // Start immediately
        debounceTime(this.inactivityThreshold),
        map(() => true), // Emit true when inactive
        switchMap(() => {
          // Once inactivity is detected, wait for next activity
          return activity$.pipe(
            map(() => false), // Emit false when active again
            startWith(true) // But first emit the inactivity signal
          );
        })
      );
    });
  }

  /**
   * Reset the inactivity timer
   */
  resetTimer(): void {
    this.inactivityDetected$.next(false);
  }
}
