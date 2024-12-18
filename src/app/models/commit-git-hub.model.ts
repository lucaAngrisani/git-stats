
export interface CommitGitHub {
    sha: string;
    author: {
        login: string,
    };
    commit: {
        author: {
            name: string,
            email: string,
            date: string,
        }
    };
    files: {
        changes: number,
    }[]
}