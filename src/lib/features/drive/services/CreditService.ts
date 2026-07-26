import type { AxiosInstance } from "axios";
import { CreditsInfoDto, type CreditsInfo } from "../dtos/CreditsInfo";
import { Mockable } from "$lib/utils/mock/Mockable";

export default class CreditService extends Mockable {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    async fetchCredits(username: string) : Promise<CreditsInfoDto> {
        const dto = new CreditsInfoDto();
        try {
            const resp = await this.api.get<CreditsInfo>(`/credits/${username}`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }

        return dto;
    }

    async mock_fetchCredits(_: string) : Promise<CreditsInfoDto> {
        const dto = new CreditsInfoDto();
        dto.setPayload(<CreditsInfo>{
            totalStorage: 1000,
            consumedStorage: 500 
        });    
        return dto;
    }
}