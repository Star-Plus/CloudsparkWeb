import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import RepoPropsDto, { type RepoPropsPayload } from "../dtos/RepoPropsDto";
import RepoVcsMetadataDto, { type RepoVcsMetadata } from "../dtos/RepoVcsMetadataDto";
import RepoContentDto, { type RepoContent } from "../dtos/RepoContentDto";

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

    async getRepoContent(username: string, repoName: string, path: string) : Promise<RepoContentDto> {
        const dto = new RepoContentDto();
        try {
            const resp = await this.api.get<RepoContent>(`/repo/${username}/${repoName}/tree/${path}`);
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
            collaborators: [
                {avatarUrl: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHVzZXJzfGVufDB8fDB8fHww", name: "collaborator"}, 
                {avatarUrl: "https://images.unsplash.com/photo-1739242572316-c6a4d7199087?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHVzZXJzfGVufDB8fDB8fHww", name: "21"}
            ],
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

    async mock_getRepoContent(_: string, __: string, ___: string) : Promise<RepoContentDto> {
        const dto = new RepoContentDto();
        dto.setPayload(<RepoContent>{
            assets: [
                {
                    name: "concept1",
                    previewUrl: "https://images.unsplash.com/photo-1779243829348-85bf26cff23b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE1fENEd3V3WEpBYkV3fHxlbnwwfHx8fHw%3D",
                    size: 1,
                    type: "image/png"
                },
                {
                    name: "concept2",
                    previewUrl: "https://images.unsplash.com/photo-1779878603870-dad73869e4dc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDI0fENEd3V3WEpBYkV3fHxlbnwwfHx8fHw%3D",
                    size: 1,
                    type: "image/png"
                },
                {
                    name: "concept3",
                    previewUrl: "https://images.unsplash.com/photo-1777971636631-ec8b991f608d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDg2fENEd3V3WEpBYkV3fHxlbnwwfHx8fHw%3D",
                    size: 2,
                    type: "image/png"
                },
                {
                    name: "models",
                    type: "DIR"
                },
                {
                    name: "assets",
                    type: "DIR"
                }
            ]
        })
        return dto;
    }
}