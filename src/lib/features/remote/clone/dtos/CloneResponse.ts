export default interface CloneResponse {
    assetUrls: { path: string; url: string, size: number }[];
    trees: { hash: string; file: string }[];
    commits: { hash: string; file: string }[];
}