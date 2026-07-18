import type { AxiosInstance } from "axios";

export default class DownloadAgent {

    private api: AxiosInstance;
    private socketBaseUrl?: string;
    private vcsUrl?: string;

    constructor(api: AxiosInstance, socketUrl?: string, vcsUrl?: string) {
        this.api = api;
        this.socketBaseUrl = socketUrl;
        this.vcsUrl = vcsUrl;
    }

    async openSaveFileDialog(filename: string) : Promise<string> {
        try {
            const resp = await this.api.get("/fs/saveFile", { params: { filename }});
            if (resp.status !== 200) throw new Error(resp.data);

            return resp.data;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

}