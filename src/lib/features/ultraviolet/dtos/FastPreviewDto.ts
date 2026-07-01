import BaseDTO from "$lib/utils/models/BaseDTO"

export type FastPreviewPayload = {
    url: string,
    type: string
}

export class FastPreviewDto extends BaseDTO<FastPreviewPayload> {}