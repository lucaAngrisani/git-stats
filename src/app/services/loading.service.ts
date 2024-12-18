import { Injectable, signal, WritableSignal } from '@angular/core';

/**
 * Loading service
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {

    loadingSignal: WritableSignal<boolean> = signal<boolean>(false);
    loadingMap: Map<string, boolean> = new Map<string, boolean>();

    constructor() { }

    setLoading(caricamento: boolean, url: string): void {
        if (!url)
            throw new Error('An url occurred');

        if (caricamento === true) {
            this.loadingMap.set(url, caricamento);
            this.loadingSignal.set(true);
        }
        else if (caricamento === false && this.loadingMap.has(url)) {
            this.loadingMap.delete(url);
        }

        if (this.loadingMap.size === 0)
            this.loadingSignal.set(false);

    }

}