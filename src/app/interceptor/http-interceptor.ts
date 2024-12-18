import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { MessageService } from "primeng/api";
import { catchError, finalize } from "rxjs";
import { GitService } from "../services/git.service";
import { LoadingService } from "../services/loading.service";

export const httpInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const msg = inject(MessageService);
    const gitSvc = inject(GitService);
    const loadingService = inject(LoadingService);
    const timestamp: number = new Date().getTime();

    loadingService.setLoading(true, `${request.url}?${timestamp}`);

    if (gitSvc.TOKEN) {
        request = request.clone({
            setHeaders: {
                'Authorization': `Bearer ${gitSvc.TOKEN}`
            },
        });
    }

    return next(request).pipe(
        catchError((error) => {
            msg.add({ severity: 'error', summary: error.statusText, detail: error.error?.message ?? error.error?.error, life: 3000 });
            throw Error(error);
        }),
        finalize(() => {
            loadingService.setLoading(false, `${request.url}?${timestamp}`);
        })
    );
}