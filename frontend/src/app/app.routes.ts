import { Routes } from '@angular/router';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { CookiePolicyComponent } from './pages/cookie-policy/cookie-policy.component';
import { AccessibilityComponent } from './pages/accessibility/accessibility.component';

export const routes: Routes = [
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-conditions', component: TermsConditionsComponent },
  { path: 'cookie-policy', component: CookiePolicyComponent },
  { path: 'accessibility', component: AccessibilityComponent }
];
