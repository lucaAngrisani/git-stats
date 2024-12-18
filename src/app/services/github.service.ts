import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap, forkJoin, from, map, mergeMap, Observable, of, toArray } from 'rxjs';
import { Branch } from '../models/branch.model';
import { CommitGitHub } from '../models/commit-git-hub.model';
import { Commit } from '../models/commit.model';
import { GitService } from './git.service';

@Injectable({ providedIn: 'root' })
export class GitHubService {

    constructor(
        private http: HttpClient,
        private gitSvc: GitService,
    ) { }

    // Recupera i brach
    getBranches(): Observable<Branch[]> {
        return this.http.get<Branch[]>(
            `${this.gitSvc.BASE_URL}/${this.gitSvc.PROJECT_ID}/branches`
        );
    }

    // Recupera i commit
    getCommits(branchName: string, numMaxCommits: number = 1000): Observable<Commit[]> {
        const perPage = 100 > numMaxCommits ? numMaxCommits : 100;
        const totalPages = Math.ceil(numMaxCommits / perPage);

        const requests = [];
        for (let page = 1; page <= totalPages; page++) {
            const url = `${this.gitSvc.BASE_URL}/${this.gitSvc.PROJECT_ID}/commits?sha=${branchName}&page=${page}&per_page=${perPage}`;
            requests.push(this.http.get<CommitGitHub[]>(url));
        }

        // Emette tutte le richieste per la lista dei commit
        return from(requests).pipe(
            concatMap((request) => request),
            toArray(),
            // Appiattisce i risultati della lista commit
            map((responses) => responses.flat()),
            // Ciclo per elaborare ogni commit e recuperare le statistiche
            mergeMap((commitList) => {
                return forkJoin([
                    of(commitList), // Mantenere i dati del commit originale
                    from(commitList.map(commit => this.http.get<CommitGitHub>(`${this.gitSvc.BASE_URL}/${this.gitSvc.PROJECT_ID}/commits/${commit.sha}`))).pipe(
                        concatMap((request) => request),
                        toArray(),
                    ) // Richiesta separata per le statistiche
                ]);
            }),
            // Trasforma i risultati in array di Commit
            map(([commitList, stats]) => commitList.map((commit, index) => new Commit().toModel({
                id: commit.sha,
                author_email: commit.commit?.author?.email,
                author_name: commit.author?.login,
                created_at: commit.commit?.author?.date,
                stats: {
                    total: stats[index]?.files?.reduce((acc, curr) => acc += curr.changes, 0),
                }
            })))
        );
    }

}
