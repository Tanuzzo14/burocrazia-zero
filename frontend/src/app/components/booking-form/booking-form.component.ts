import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FocusHighlightDirective } from '../../directives/focus-highlight.directive';
import { FocusHighlightService } from '../../services/focus-highlight.service';
import { OperationIdentification } from '../../api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FocusHighlightDirective],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BookingFormComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() selectedOperation: OperationIdentification | null = null;
  @Input() isBooking = false;
  @Input() altchaVerified = false;
  
  @Output() submitBooking = new EventEmitter<{
    nomeCognome: string;
    telefono: string;
  }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() altchaVerifiedChange = new EventEmitter<string>();

  @ViewChildren(FocusHighlightDirective) highlightDirectives!: QueryList<FocusHighlightDirective>;

  bookingForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private formControlNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private focusHighlightService: FocusHighlightService
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      nomeCognome: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, this.italianPhoneValidator]],
      privacyAccepted: [false, [Validators.requiredTrue]]
    });

    this.formControlNames = ['nomeCognome', 'telefono', 'privacyAccepted'];

    // Monitor form value changes to update highlight
    this.bookingForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateHighlightToFirstInvalid();
      });
  }

  ngAfterViewInit(): void {
    // Initial highlight on the first invalid field
    setTimeout(() => this.updateHighlightToFirstInvalid(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusHighlightService.clearHighlight();
  }

  /**
   * Italian phone number validator
   */
  private italianPhoneValidator(control: any): {[key: string]: any} | null {
    if (!control.value) {
      return null;
    }

    const cleanPhone = control.value.replace(/[\s\-\.]/g, '');
    const italianPhoneRegex = /^(3\d{9}|0\d{8,10})$/;
    
    return italianPhoneRegex.test(cleanPhone) ? null : { invalidPhone: true };
  }

  /**
   * Update highlight to show the first invalid field
   */
  private updateHighlightToFirstInvalid(): void {
    // Find the first invalid control
    for (const controlName of this.formControlNames) {
      const control = this.bookingForm.get(controlName);
      
      if (control && (control.invalid || (controlName === 'privacyAccepted' && !control.value))) {
        // Find the corresponding directive
        const directive = this.findDirectiveByControlName(controlName);
        if (directive) {
          directive.triggerHighlight();
          return;
        }
      }
    }

    // All fields are valid, clear highlight
    this.focusHighlightService.clearHighlight();
  }

  /**
   * Find the highlight directive for a given control name
   */
  private findDirectiveByControlName(controlName: string): FocusHighlightDirective | undefined {
    const directives = this.highlightDirectives?.toArray() || [];
    // This is a simple approach - in production, you'd want a more robust mapping
    const index = this.formControlNames.indexOf(controlName);
    return directives[index];
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.bookingForm.valid && this.altchaVerified) {
      const { nomeCognome, telefono } = this.bookingForm.value;
      this.submitBooking.emit({ nomeCognome, telefono });
    } else {
      // Mark all fields as touched to show errors
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
      this.updateHighlightToFirstInvalid();
    }
  }

  /**
   * Handle cancel
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Handle ALTCHA verification
   */
  onAltchaVerified(event: any): void {
    const payload = event.detail.payload;
    this.altchaVerifiedChange.emit(payload);
    // After ALTCHA is verified, update highlight
    setTimeout(() => this.updateHighlightToFirstInvalid(), 100);
  }

  /**
   * Handle ALTCHA state change
   */
  onAltchaStateChange(event: any): void {
    if (event.detail.state === 'error') {
      this.altchaVerifiedChange.emit('');
    }
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.bookingForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Questo campo è obbligatorio';
    }
    if (control.errors['minlength']) {
      return 'Il nome deve avere almeno 3 caratteri';
    }
    if (control.errors['invalidPhone']) {
      return 'Numero di telefono non valido. Inserisci un numero italiano valido';
    }
    
    return '';
  }

  /**
   * Check if a field should show error
   */
  shouldShowError(fieldName: string): boolean {
    const control = this.bookingForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
