import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'altcha';
import 'altcha/i18n/it';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
