export default class MergeRequest {
    data: RequestScheme

    constructor(data: RequestScheme){
        this.data = data;
    }
}

interface RequestScheme {
    authors: {
        author: string,
        versions: {
            commitHash: string,
            entries: string[],
        }[]
    }[]
}