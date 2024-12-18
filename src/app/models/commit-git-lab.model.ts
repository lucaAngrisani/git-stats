import { Stats } from "./stats.model";

export interface CommitGitHub {
    id: string;
    author_email: string;
    author_name: string;
    created_at: string;
    stats: Stats;
}