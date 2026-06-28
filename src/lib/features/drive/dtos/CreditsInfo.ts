import BaseDTO from "$lib/utils/models/BaseDTO"

export type CreditsInfo = {
    // in GB
    totalStorage: number
    consumedStorage: number
}

export class CreditsInfoDto extends BaseDTO<CreditsInfo> {}