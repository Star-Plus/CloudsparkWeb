import BaseDTO from "$lib/utils/models/BaseDTO"

export type RepoContent = {
    name: string,
    previewUrl: string,
    size: number,
    type: string
}

export default class RepoContentDto extends BaseDTO<RepoContent> {}