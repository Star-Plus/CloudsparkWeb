import BaseDTO from "$lib/utils/models/BaseDTO"

export type RepoVcsMetadata = {
    branches: {
        name: string,
        commitCount: number,
    }[],
}

export default class RepoVcsMetadataDto extends BaseDTO<RepoVcsMetadata> {}