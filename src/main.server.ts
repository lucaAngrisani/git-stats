import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => {
    // Rileva la lingua dalla richiesta
    const language = globalThis.location?.pathname.split('/')[1] || 'en'; // Default: 'en'

    config.providers.push({
        provide: 'LOCALE_ID',
        useValue: language,
    });

    return bootstrapApplication(AppComponent, config);
};

export default bootstrap;
