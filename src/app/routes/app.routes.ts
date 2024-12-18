import { Routes } from '@angular/router';
import { ROUTES } from './routes.enum';

export const routes: Routes = [
    {
        path: '',
        redirectTo: ROUTES.HOME,
        pathMatch: 'full'
    },
    {
        path: ROUTES.HOME,
        loadComponent: () => import('../pages/home/home.component')
    },
    {
        path: ROUTES.REPORT,
        loadComponent: () => import('../pages/report/report.component')
    }
];
