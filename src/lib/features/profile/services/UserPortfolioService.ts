import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import RepositoryDTO, { type RepositoryPayload } from "../dtos/RepositoryResponse";
import PeriodContributionDto, { type PeriodContributionPayload } from "../dtos/PeriodContribution";
import ContributionActivityStreamDto, { type ActivityStreamPayload } from "../dtos/ContributionActivityStream";
import type { Commit } from "$lib/features/commits/types/Commit";

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

    async fetchUserActivityStream(username: string, pageSize: number, page: number) : Promise<ContributionActivityStreamDto> {
        const dto = new ContributionActivityStreamDto();
        try {
            const resp = await this.api.get<ActivityStreamPayload>(`/commits/${username}?pageSize=${pageSize}&page=${page}`);
            for (let i = 0; i < resp.data.commits.length; i++) {
                const commit = resp.data.commits[i];
                commit.timestamp = new Date(commit.timestamp);
            }          
            dto.setPayload(resp.data);
        }
        catch(err) {
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

        dto.setPayload(payload as RepositoryPayload[]);
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

    async mock_fetchUserActivityStream(username: string, pageSize: number, page: number) : Promise<ContributionActivityStreamDto> {
        const dto = new ContributionActivityStreamDto();

        const commits: Commit[] = [];

        for (let i = 0; i < pageSize; i++) {
            commits.push({
                hash: "hash-" + i,
                message: "message-" + i,
                author: "author-" + i,
                timestamp: new Date(),
                remote: "remote-" + i,
                parents: []
            });
        }

        console.log(commits)

        const payload : ActivityStreamPayload = {
            page,
            pageSize,
            commits
        };

        dto.setPayload(payload);
        return dto;
    }
}