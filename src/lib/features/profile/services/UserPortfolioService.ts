import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import RepositoryDTO, { type RepositoryPayload } from "../dtos/RepositoryResponse";
import PeriodContributionDto, { type PeriodContributionPayload } from "../dtos/PeriodContribution";

export default class UserPortfolioService extends Mockable {
    api : AxiosInstance;

    constructor(api : AxiosInstance) {
        super();
        this.api = api;
    }

    async fetchUserCloudRepositories(username: string) : Promise<RepositoryDTO> {
        const dto = new RepositoryDTO();
        try {
            const resp = await this.api.get<RepositoryPayload[]>(`/remotes/${username}`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }

        return dto;
    }

    async fetchUserContributionOverPeriod(username: string, start: Date, end: Date) : Promise<PeriodContributionDto> {
        const dto = new PeriodContributionDto();

        try {
            const resp = await this.api.get<PeriodContributionPayload>(`/commits/${username}/activity?start=${start.toISOString()}&end=${end.toISOString()}`);            
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }

        return dto;
    }

    async mock_fetchUserCloudRepositories(username: string) : Promise<RepositoryDTO> {
        const dto = new RepositoryDTO();
        const payload : RepositoryPayload[] = [];

        for (let i = 0; i < 5; i++) {
            payload.push({
                id: "repo-" + i,
                name: "repo-" + i,
                public: true,
                sizeGB: Math.random() * 10,
                createdAt: new Date()
            })
        }

        dto.setPayload([] as RepositoryPayload[]);
        return dto;
    }

    async mock_fetchUserContributionOverPeriod(username: string, start: Date, end: Date) : Promise<PeriodContributionDto> {
        const dto = new PeriodContributionDto();

        const daysInBetween: number = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

        const payload : PeriodContributionPayload = {
            start,
            end,
            days: daysInBetween,
            counts: Array.from({length: daysInBetween}, () => Math.floor(Math.random() * 100))
        };

        dto.setPayload(payload);
        return dto;
        
    }
}