export default interface AuthorCommitResponse {
    commits: CommitReponse[];
}

export interface CommitReponse {
    hash: string;
    timestamp: string;
    message: string;
    tree: TreeResponse;
}

interface TreeResponse {
    entries: {
        name: string;
        hash: string;
    }[];
}


