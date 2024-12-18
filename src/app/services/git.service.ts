import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class GitService {
    public BASE_URL = '';
    public TOKEN = '';
    public PROJECT_ID = '';
    public TYPE = '';

    constructor(
        private storageSvc: StorageService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.BASE_URL = this.storageSvc.get("BASE_URL");
            this.TOKEN = this.storageSvc.get("TOKEN");
            this.PROJECT_ID = this.storageSvc.get("PROJECT_ID");
            this.TYPE = this.storageSvc.get("TYPE");
        }
    }

    setValues(values: string[]) {
        this.BASE_URL = values[0];
        this.PROJECT_ID = values[1];
        this.TOKEN = values[2];
        this.TYPE = values[3];

        if (isPlatformBrowser(this.platformId)) {
            this.storageSvc.set("BASE_URL", this.BASE_URL);
            this.storageSvc.set("TOKEN", this.TOKEN);
            this.storageSvc.set("PROJECT_ID", this.PROJECT_ID);
            this.storageSvc.set("TYPE", this.TYPE);
        }
    }

}
