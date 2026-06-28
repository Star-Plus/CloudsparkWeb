import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import { PathObjectDto, type DirObject } from "../dtos/DirObject";

export default class DriveStorageService extends Mockable {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    async fetchPathContents(path: string) : Promise<PathObjectDto> {
        const dto = new PathObjectDto();
        try {
            const resp = await this.api.get<DirObject>(`/tree/${path}`);
            dto.setPayload(resp.data);
        }
        catch (err) {
            dto.setError(err as Error);
        }
        return dto;
    }

    async mock_fetchPathContents(path: string) : Promise<PathObjectDto> {
        const dto = new PathObjectDto();

        if (path == "aejkatappaja/vault") {
            dto.setPayload(<DirObject>{
                name: "root",
                path: "/",
                contents: [{
                    name: "test",
                    path: "/test",
                    type: "dir",
                }],
                count: 2
            });
        } else if (path == "aejkatappaja/vault/test") {
            dto.setPayload(<DirObject>{
                name: "test",
                path: "/test",
                contents: [{
                    name: "final",
                    path: "/test/final",
                    type: "file",
                }],
                count: 1
            });
        }
        else throw new Error(`Path not found: ${path}`);

        return dto;
    }
}