import { Injectable, signal, WritableSignal } from "@angular/core";
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import { Commit } from "../../models/commit.model";
import { COLORS } from "../../shared/colors";

Chart.register(...registerables);

@Injectable({ providedIn: 'root' })
export class ChartService {

    chartsRefs = [
        { id: 'num-commits-per-contributor', load: () => this.loadNumCommitsPerContributor() },
        { id: 'mean-time-betweeen-commits-per-contributor', load: () => this.loadTimeBetweenCommitsPerContributor() },
        { id: 'num-commits-per-week-per-contributor', load: () => this.loadNumCommitsPerWeekPerContributor() },
        { id: 'num-active-days-per-week-per-contributor', load: () => this.loadActiveDaysPerWeekPerContributor() },
        { id: 'mean-rows-updated-per-week-per-contributor', load: () => this.loadMeanRowsUpdatedPerWeekPerContributorChart() },
    ];

    charts: Chart[] = [];

    commitsPerBranch: WritableSignal<Commit[][]> = signal([]);
    reloadChart: WritableSignal<boolean> = signal(false);
    loadedData: WritableSignal<boolean> = signal(false);

    loadCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts = this.chartsRefs.map(chart =>
            new Chart(
                document.getElementById(chart.id) as HTMLCanvasElement,
                chart.load(),
            )
        );
    }

    loadMeanRowsUpdatedPerWeekPerContributorChart() {
        const commits = this.commitsPerBranch().flat();
        return this.getChartRowsOption(this.aggregateRowsUpdatedDataByWeek(commits));
    }

    loadTimeBetweenCommitsPerContributor() {
        const commits = this.commitsPerBranch().flat();
        return this.getChartTimeBetweenCommitsOption(this.aggregateTimeBetweenCommits(commits));
    }

    loadNumCommitsPerWeekPerContributor() {
        const commits = this.commitsPerBranch().flat();
        return this.getChartTotCommitWeekOption(this.aggregateNumCommitsDataByWeek(commits));
    }

    loadActiveDaysPerWeekPerContributor() {
        const commits = this.commitsPerBranch().flat();
        return this.getChartActiveDaysWeekOption(this.aggregateActiveDaysByWeek(commits));
    }

    loadNumCommitsPerContributor() {
        const commits = this.commitsPerBranch().flat();
        return this.getChartTotCommitOption(this.aggregateNumCommitsData(commits));
    }

    aggregateRowsUpdatedDataByWeek(commits: Commit[]) {
        const weekMap: { [week: string]: { [author: string]: number[] } } = {};

        commits.forEach((commit) => {
            const week = this.getWeekFromDate(commit.created_at);
            if (!weekMap[week]) {
                weekMap[week] = {};
            }

            const author = commit.author_name;
            if (!weekMap[week][author]) {
                weekMap[week][author] = [];
            }

            // Aggiungi il totale delle righe aggiornate
            weekMap[week][author].push(commit.stats.total);
        });

        // Calcola la media per ogni autore per settimana
        const result: { week: string; author: string; average: number }[] = [];

        Object.keys(weekMap).forEach((week) => {
            Object.keys(weekMap[week]).forEach((author) => {
                const totalLines = weekMap[week][author].reduce((a, b) => a + b, 0);
                const average = totalLines / weekMap[week][author].length;
                result.push({ week, author, average });
            });
        });

        return result.sort((w1, w2) => w1.week > w2.week ? 1 : -1);
    }

    aggregateTimeBetweenCommits(commits: Commit[]) {
        const commitsByAuthor: Record<string, Date[]> = commits.reduce((acc: Record<string, Date[]>, commit) => {
            (acc[commit.author_name] || (acc[commit.author_name] = [])).push(new Date(commit.created_at));
            return acc;
        }, {});

        const averageTimes: Record<string, number> = {};
        for (const author in commitsByAuthor) {
            const dates = commitsByAuthor[author].sort((a, b) => a.getTime() - b.getTime());
            const totalDiff = dates.reduce((acc, date, index) => {
                if (index > 0) {
                    acc += date.getTime() - dates[index - 1].getTime();
                }
                return acc;
            }, 0);
            const averageDiffDays = totalDiff / ((dates.length - 1) * 24 * 60 * 60 * 1000);
            averageTimes[author] = averageDiffDays;
        }

        // Calcola il tempo medio tra due commit consecutivi per ogni autore
        const result: { author: string; average: number }[] = [];

        Object.keys(averageTimes).forEach((author) => {
            result.push({ author, average: averageTimes[author] });
        });

        return result;
    }

    aggregateNumCommitsDataByWeek(commits: Commit[]) {
        const weekMap: { [week: string]: { [author: string]: number } } = {};

        commits.forEach((commit) => {
            const week = this.getWeekFromDate(commit.created_at);
            if (!weekMap[week]) {
                weekMap[week] = {};
            }

            const author = commit.author_name;
            if (!weekMap[week][author]) {
                weekMap[week][author] = 0;
            }

            // Aggiungi al totale dei commit svolti
            weekMap[week][author]++;
        });

        // Calcola il totale per ogni autore per settimana
        const result: { week: string; author: string; tot: number }[] = [];

        Object.keys(weekMap).forEach((week) => {
            Object.keys(weekMap[week]).forEach((author) => {
                const tot = weekMap[week][author];
                result.push({ week, author, tot });
            });
        });

        return result.sort((w1, w2) => w1.week > w2.week ? 1 : -1);
    }

    aggregateActiveDaysByWeek(commits: Commit[]) {
        const weekMap: { [week: string]: { [author: string]: Set<string> } } = {};

        commits.forEach((commit) => {
            const week = this.getWeekFromDate(commit.created_at);
            const author = commit.author_name;
            const day = commit.created_at.split('T')[0]; // Prende solo la parte della data (YYYY-MM-DD)

            if (!weekMap[week]) {
                weekMap[week] = {};
            }

            if (!weekMap[week][author]) {
                weekMap[week][author] = new Set();
            }

            weekMap[week][author].add(day); // Aggiunge il giorno alla lista dei giorni unici
        });

        // Trasforma i Set in numeri di giorni attivi
        const result: { [week: string]: { [author: string]: number } } = {};
        Object.keys(weekMap).forEach((week) => {
            result[week] = {};
            Object.keys(weekMap[week]).forEach((author) => {
                result[week][author] = weekMap[week][author].size; // Conta i giorni unici
            });
        });

        return result;
    }

    aggregateNumCommitsData(commits: Commit[]) {
        const authorMap: { [author: string]: number } = {};

        commits.forEach((commit) => {
            const author = commit.author_name;
            if (!authorMap[author]) {
                authorMap[author] = 0;
            }

            // Aggiungi al totale dei commit svolti
            authorMap[author]++;
        });

        // Calcola il totale per ogni autore per settimana
        const result: { author: string; tot: number }[] = [];

        Object.keys(authorMap).forEach((author) => {
            const tot = authorMap[author];
            result.push({ author, tot });
        });

        return result;
    }

    getWeekFromDate(dateString: string): string {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const week = Math.ceil(
            ((date.getTime() - new Date(year, date.getMonth(), 1).getTime()) / 86400000 + 1) / 7
        );
        return `${year}/${month < 10 ? `0${month}` : month} W${week}`;
    }

    getChartRowsOption(aggregatedData: any[]): {
        type: ChartType,
        data: ChartData;
        options: ChartOptions;
    } {
        const weeks = Array.from(new Set(aggregatedData.map((d) => d.week)));
        const authors = Array.from(new Set(aggregatedData.map((d) => d.author)));

        const datasets = authors.map((author, index) => {
            return {
                label: author,
                data: weeks.map((week) => {
                    const entry = aggregatedData.find(
                        (d) => d.week === week && d.author === author
                    );
                    return entry ? entry.average : 0;
                }),
                borderColor: COLORS[index],
                fill: false,
            };
        });

        return {
            type: 'line',
            data: {
                labels: weeks,
                datasets: datasets,
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: $localize`:@@CHART1_TITLE:Mean rows updated per week per contributor`,
                    },
                },
                scales: {
                    x: {
                        title: { display: true, text: $localize`:@@CHART1_X:Weeks` },
                    },
                    y: {
                        title: { display: true, text: $localize`:@@CHART1_Y:Mean rows updated` },
                    },
                },
            },
        };
    }

    getChartTimeBetweenCommitsOption(aggregatedData: any[]): {
        type: ChartType,
        data: ChartData;
        options: ChartOptions;
    } {
        const authors = Array.from(new Set(aggregatedData.map((d) => d.author)));

        const datasets = [{
            data: authors.map((author, index) => aggregatedData.find((d) => d.author === author)?.average ?? 0),
            backgroundColor: authors.map((author, index) => COLORS[index]),
            borderColor: authors.map((author, index) => COLORS[index]),
        }];

        return {
            type: 'bar',
            data: {
                labels: authors,
                datasets: datasets,
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: $localize`:@@CHART2_TITLE:Mean time between commits per contributor (in days)`,
                    },
                    legend: {
                        display: false,
                    }
                },
            },
        };
    }

    getChartTotCommitWeekOption(aggregatedData: any[]): {
        type: ChartType,
        data: ChartData;
        options: ChartOptions;
    } {
        const weeks = Array.from(new Set(aggregatedData.map((d) => d.week)));
        const authors = Array.from(new Set(aggregatedData.map((d) => d.author)));

        const datasets = authors.map((author, index) => {
            return {
                label: author,
                data: weeks.map((week) => {
                    const entry = aggregatedData.find(
                        (d) => d.week === week && d.author === author
                    );
                    return entry ? entry.tot : 0;
                }),
                borderColor: COLORS[index],
                fill: false,
            };
        });

        return {
            type: 'line',
            data: {
                labels: weeks,
                datasets: datasets,
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: $localize`:@@CHART3_TITLE:Tot commits per week per contributor`,
                    },
                },
                scales: {
                    x: {
                        title: { display: true, text: $localize`:@@CHART3_X:Weeks` },
                    },
                    y: {
                        title: { display: true, text: $localize`:@@CHART3_Y:Tot commits` },
                    },
                },
            },
        };
    }

    getChartTotCommitOption(aggregatedData: any[]): {
        type: ChartType,
        data: ChartData;
        options: ChartOptions;
    } {
        const authors = Array.from(new Set(aggregatedData.map((d) => d.author)));

        const datasets = [{
            label: $localize`:@@CHART4_LABEL:Tot commits`,
            data: authors.map((author) => {
                const entry = aggregatedData.find(
                    (d) => d.author === author
                );
                return entry ? entry.tot : 0;
            }),
            borderColor: authors.map((author, index) => COLORS[index]),
            backgroundColor: authors.map((author, index) => COLORS[index]),
        }];

        return {
            type: 'pie',
            data: {
                labels: authors,
                datasets: datasets,
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: $localize`:@@CHART4_TITLE:Tot commits per contributor`,
                    },
                },
            },
        };
    }

    getChartActiveDaysWeekOption(aggregatedData: { [week: string]: { [author: string]: number } }): {
        type: ChartType,
        data: ChartData;
        options: ChartOptions;
    } {
        const weeks = Object.keys(aggregatedData).sort((w1, w2) => w1 > w2 ? 1 : -1);;
        const authors = Array.from(
            new Set(Object.values(aggregatedData).flatMap((weekData) => Object.keys(weekData)))
        );

        const datasets = authors.map((author, index) => {
            return {
                label: author,
                data: weeks.map((week) => aggregatedData[week][author] || 0), // Giorni attivi (0 se non presenti)
                backgroundColor: COLORS[index],
            };
        });

        const ctx = document.getElementById('activeDaysChart') as HTMLCanvasElement;
        return {
            type: 'bar',
            data: {
                labels: weeks,
                datasets: datasets,
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: $localize`:@@CHART5_TITLE:Num active days per week per contributor`,
                    },
                },
                scales: {
                    x: { title: { display: true, text: $localize`:@@CHART5_X:Weeks` } },
                    y: { title: { display: true, text: $localize`:@@CHART5_Y:Active days` }, beginAtZero: true },
                },
            },
        };
    }

}