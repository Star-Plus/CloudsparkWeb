import BaseDTO from "$lib/utils/models/BaseDTO.svelte"

export type FastPreviewPayload = {
    previewUrl: string;
}

export class FastPreviewDto extends BaseDTO<FastPreviewPayload> {}