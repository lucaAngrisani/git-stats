import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Material from '@primeng/themes/material';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { httpInterceptor } from './interceptor/http-interceptor';
import { routes } from './routes/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Material
      }
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([httpInterceptor])
    ),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    MessageService,
  ]
};
