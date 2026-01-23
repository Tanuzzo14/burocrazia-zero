import { Routes } from '@angular/router';
import { SuccessComponent } from './pages/success/success.component';
import { CancelComponent } from './pages/cancel/cancel.component';

export const routes: Routes = [
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent }
];
