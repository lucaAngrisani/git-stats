import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import Material from '@primeng/themes/material';
import { providePrimeNG } from 'primeng/config';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    providePrimeNG({
      theme: {
        preset: Material
      }
    }),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
