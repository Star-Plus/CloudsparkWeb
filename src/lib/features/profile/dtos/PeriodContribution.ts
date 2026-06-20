import BaseDTO from "$lib/utils/models/BaseDTO"

export type PeriodContributionPayload = { 
    start: Date,
    end: Date,
    days: number,
    counts: number[]
}

export default class PeriodContributionDto extends BaseDTO<PeriodContributionPayload> {}