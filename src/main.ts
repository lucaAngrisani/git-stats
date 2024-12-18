/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Ottieni il parametro "lang" dall'URL
const lang = new URLSearchParams(window.location.search).get('lang') || 'en';

// Cambia il tag HTML per la lingua
document.documentElement.lang = lang;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
