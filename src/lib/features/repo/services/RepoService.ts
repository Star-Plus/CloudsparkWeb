import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import RepoPropsDto, { type RepoPropsPayload } from "../dtos/RepoPropsDto";
import RepoVcsMetadataDto, { type RepoVcsMetadata } from "../dtos/RepoVcsMetadataDto";

export default class RepoService extends Mockable {
    private api : AxiosInstance
    constructor(api : AxiosInstance) {
        super();
        this.api = api;
    }

    async getRepoProps(username: string, repoName: string) : Promise<RepoPropsDto> {
        const dto = new RepoPropsDto();
        try {
            const resp = await this.api.get<RepoPropsPayload>(`/repo/${username}/${repoName}/props`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }
        return dto;
    }

    async getRepoVcsMetadata(username: string, repoName: string) : Promise<RepoVcsMetadataDto> {
        const dto = new RepoVcsMetadataDto();
        try {
            const resp = await this.api.get<RepoVcsMetadata>(`/repo/${username}/${repoName}/vcs-metadata`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }
        return dto;
    }
    
    async mock_getRepoProps(_: string, __: string) : Promise<RepoPropsDto> {
        const dto = new RepoPropsDto();
        dto.setPayload(<RepoPropsPayload>{
            name: "Euler Core",
            ownerName: "owner",
            ownerAvatarUrl: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?q=80&w=768&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            description: "This is a description. Write anything you want. And we will take care of the rest.",
            private: Math.random() >= 0.5 ? true : false,
            size: 1,
            collaborators: [{avatarUrl: "avatarUrl", name: "collaborator"}],
            createdAt: new Date(),
            url: "http://eulercore.com/owner/name"
        });    
        return dto;
    }

    async mock_getRepoVcsMetadata(_: string, __: string) : Promise<RepoVcsMetadataDto> {
        const dto = new RepoVcsMetadataDto();
        dto.setPayload(<RepoVcsMetadata>{
            branches: [
                {name: "main", commitCount: Math.floor(Math.random() * 100)},
                {name: "dev", commitCount: Math.floor(Math.random() * 100)},
                {name: "feature", commitCount: Math.floor(Math.random() * 100)},
            ],
        });    
        return dto;
    }
}