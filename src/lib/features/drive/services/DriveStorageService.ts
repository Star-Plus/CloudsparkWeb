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

        if (path == "aejkatappaja") {
            dto.setPayload(<DirObject>{
                name: "root",
                path: "/",
                contents: [
                    {
                        name: "vault",
                        path: "/vault",
                        type: "dir",
                    },
                    {
                        name: "shared",
                        path: "/shared",
                        type: "dir",
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
}