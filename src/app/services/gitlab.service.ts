import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap, from, map, Observable, toArray } from 'rxjs';
import { Branch } from '../models/branch.model';
import { Commit } from '../models/commit.model';
import { GitService } from './git.service';

@Injectable({ providedIn: 'root' })
export class GitLabService {

    constructor(
        private http: HttpClient,
        private gitSvc: GitService,
    ) { }

    // Recupera i brach
    getBranches(): Observable<Branch[]> {
        return this.http.get<Branch[]>(
            `${this.gitSvc.BASE_URL}/projects/${this.gitSvc.PROJECT_ID}/repository/branches`
        );
    }

    // Recupera i commit
    getCommits(branchName: string, numMaxCommits: number = 1000): Observable<Commit[]> {
        const perPage = 100 > numMaxCommits ? numMaxCommits : 100; // Numero massimo di risultati per pagina
        const totalPages = Math.ceil(numMaxCommits / perPage); // Numero massimo di pagine da recuperare (adattabile)

        const requests = [];
        for (let page = 1; page <= totalPages; page++) {
            const url = `${this.gitSvc.BASE_URL}/projects/${this.gitSvc.PROJECT_ID}/repository/commits?ref_name=${branchName}&with_stats=true&page=${page}&per_page=${perPage}`;
            requests.push(this.http.get<any[]>(url));
        }

        // Emette tutte le richieste, raccoglie e concatena i risultati
        return from(requests).pipe(
            concatMap((request) => request),
            toArray(),
            map((responses) => responses.flat()) // Appiattisce i risultati
        );
    }

}
