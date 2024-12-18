import { Component, inject } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from './services/loading.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, ToastModule],
})
export class AppComponent {
  public loadingSvc = inject(LoadingService);

  currentLang = 'en';

  constructor() {

  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    this.loadTranslations(lang);
    window.location.href = url.toString();
  }

  private async loadTranslations(lang: string) {
    const translations = await import(`../locale/messages.${lang}.json`);
    loadTranslations(translations.translations);
  }
}
