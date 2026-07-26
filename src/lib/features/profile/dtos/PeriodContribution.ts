import BaseDTO from "$lib/utils/models/BaseDTO.svelte"

export type PeriodContributionPayload = { 
    start: Date,
    end: Date,
    days: number,
    counts: number[]
}

export default class PeriodContributionDto extends BaseDTO<PeriodContributionPayload> {}