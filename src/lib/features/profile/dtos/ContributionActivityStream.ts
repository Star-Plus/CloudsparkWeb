import type { Commit } from "$lib/features/commits/types/Commit";
import BaseDTO from "$lib/utils/models/BaseDTO";

export type ActivityStreamPayload = {
    page: number,
    pageSize: number,
    commits: Commit[],
}

export default class ContributionActivityStreamDto extends BaseDTO<ActivityStreamPayload> {}