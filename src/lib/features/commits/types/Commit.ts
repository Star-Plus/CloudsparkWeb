export type Commit = {
    hash: string,
    message: string,
    author: string,
    timestamp: Date,
    remote: string,
    parents: Commit[]
}