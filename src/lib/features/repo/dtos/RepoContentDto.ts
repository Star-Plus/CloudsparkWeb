import BaseDTO from "$lib/utils/models/BaseDTO.svelte"

export type AssetWindow = {
    name: string,
    previewUrl?: string,
    size?: number,
    type: string,
    metadata?: Map<string, any>
}

export type RepoContent = {
    assets: AssetWindow[]
}

export default class RepoContentDto extends BaseDTO<RepoContent> {}