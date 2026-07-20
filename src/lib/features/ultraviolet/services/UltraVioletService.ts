import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import { FastPreviewDto, type FastPreviewPayload } from "../dtos/FastPreviewDto";

export default class UltraVioletService extends Mockable {
    private api : AxiosInstance;

    constructor(api : AxiosInstance) {
        super();
        this.api = api;
    }

    async fetchFastPreviewUrl(assetPath: string) : Promise<FastPreviewDto> {
        const dto = new FastPreviewDto();

        try {
            const resp = await this.api.get<FastPreviewPayload>(`/preview/${assetPath}`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }

        return dto;
    }

    async mock_fetchFastPreviewUrl(_: string, __: string, ___: string) : Promise<FastPreviewDto> {
        const dto = new FastPreviewDto();
        dto.setPayload({url: "https://www.historyhit.com/app/uploads/2022/08/Leonhard_Euler-Cover-Image.jpg", type: "image/jpeg"});
        return dto;
    }
}