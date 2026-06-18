import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import RepositoryDTO, { type RepositoryPayload } from "../dtos/RepositoryResponse";

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
}