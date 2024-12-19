import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  constructor(private location: Location) { }

  switchLanguage(lang: string): void {
    const currentUrl = this.location.path();
    const newUrl = `/${lang}${currentUrl.replace(/^\/(en|it)/, '')}`;
    window.location.href = newUrl; // Ricarica con il prefisso della lingua
  }

}
