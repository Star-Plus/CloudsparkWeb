import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import { PathObjectDto, type DirObject } from "../dtos/DirObject";
import type { ShareVaultObjectRequest } from "../dtos/ShareVaultObjectRequest";
import { ShareVaultObjectResponse } from "../dtos/ShareVaultObjectResponse";

export default class DriveStorageService extends Mockable {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    async fetchPathContents(path: string) : Promise<PathObjectDto> {
        const dto = new PathObjectDto();
        try {
            const resp = await this.api.get<DirObject>(`/drive/${path}`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }
        return dto;
    }

    async shareObject(object: ShareVaultObjectRequest) : Promise<ShareVaultObjectResponse> {
        const dto = new ShareVaultObjectResponse();
        try {
            const resp = await this.api.post(`/drive/share/${object.payload?.objectPath}`, object.payload);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }

        return dto;
    }

    async createFolder(root: string, path: string) : Promise<void> {
        try {
            await this.api.post(`/drive/${root}/create-folder`, {path});
        }
        catch (err) {
            throw err as Error;
        }
    }

    async mock_fetchPathContents(path: string) : Promise<PathObjectDto> {
        const dto = new PathObjectDto();

        if (path == "ahmed") {
            dto.setPayload(<DirObject>{
                name: "root",
                path: "ahmed",
                contents: [
                    {
                        name: "vault",
                        path: "ahmed/vault",
                        type: "folder",
                    },
                    {
                        name: "shared",
                        path: "ahmed/shared",
                        type: "folder",
                    },
                ],
                count: 4
            });
        } else if (path == "ahmed/vault") {
            dto.setPayload(<DirObject>{
                name: "vault",
                path: "ahmed/vault",
                contents: [{
                    name: "final",
                    path: "ahmed/vault/final",
                    type: "file",
                }],
                count: 1
            });
        }
        else if (path == "ahmed/shared") {
            dto.setPayload(<DirObject>{
                name: "shared",
                path: "ahmed/shared",
                contents: [
                    {
                        name: "final",
                        path: "ahmed/shared/final",
                        type: "file",
                    },
                ],
                count: 0
            });
        }
        else throw new Error(`Path not found: ${path}`);

        return dto;
    }

    async mock_shareObject(object: ShareVaultObjectRequest) : Promise<ShareVaultObjectResponse> {
        const dto = new ShareVaultObjectResponse();
        dto.setPayload("Object shared successfully");
        return dto;
    }
}