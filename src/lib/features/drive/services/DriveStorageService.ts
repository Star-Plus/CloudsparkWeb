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

    async mock_fetchPathContents(path: string) : Promise<PathObjectDto> {
        const dto = new PathObjectDto();

        if (path == "aejkatappaja") {
            dto.setPayload(<DirObject>{
                name: "root",
                path: "/",
                contents: [
                    {
                        name: "vault",
                        path: "/vault",
                        type: "folder",
                    },
                    {
                        name: "shared",
                        path: "/shared",
                        type: "folder",
                    },
                ],
                count: 4
            });
        } else if (path == "aejkatappaja/vault") {
            dto.setPayload(<DirObject>{
                name: "vault",
                path: "/vault",
                contents: [{
                    name: "final",
                    path: "/vault/final",
                    type: "file",
                }],
                count: 1
            });
        }
        else if (path == "aejkatappaja/shared") {
            dto.setPayload(<DirObject>{
                name: "shared",
                path: "/shared",
                contents: [
                    {
                        name: "final",
                        path: "/shared/final",
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