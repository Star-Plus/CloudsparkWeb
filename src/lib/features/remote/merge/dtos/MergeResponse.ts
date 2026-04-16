export default interface MergeResponse {

    assetUrls: {
        url: string,
        path: string,
    }[]

    tree: {
        hash: string,
        file: string,
    }

    commit: {
        hash: string,
        file: string,
    }

}