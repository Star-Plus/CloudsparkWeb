import BoxTask from "$lib/features/tasks/BoxTask.svelte";
import TaskManager from "$lib/features/tasks/TaskManager.svelte";
import type { AxiosInstance } from "axios"

export default class UploadAgent {
    
    private api: AxiosInstance;
    private socketBaseUrl?: string;
    private vcsUrl?: string;

    constructor(api: AxiosInstance, socketUrl?: string, vcsUrl?: string) {
        this.api = api;
        this.socketBaseUrl = socketUrl;
        this.vcsUrl = vcsUrl;
    }

    public async openPickDialog() : Promise<string> {
        try {
            const resp = await this.api.get("/fs/pickFile");
            if (resp.status !== 200) throw new Error(resp.data);

            return resp.data;
        }
        catch (err) {
            console.error(err);
            return "";
        }
    }

    public async uploadFile(src: string, dest: string) {
        try {
            const repoPath = dest.split("/").slice(0, 2).join("/");
            
            const remoteUrl = this.vcsUrl + "/api/" + repoPath;
            await this.createRepository(repoPath, remoteUrl);

            const relativePath = dest.split("/").slice(2).filter(p => p !== "").join("/");
            
            await this.switchBranch(repoPath, relativePath);
            await this.ghostStage(repoPath, src, relativePath);
            await this.commit(repoPath, `Uploading file ${relativePath} at ${new Date()}`);

            const socket = this.handlePushSocket(repoPath);

            await this.push(repoPath, relativePath);
            socket?.close();

            await this.wash(repoPath);
            await this.prepareAsset(repoPath, src);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    public handlePushSocket(repoPath: string): WebSocket | null {
        if (!this.socketBaseUrl) return null;

        const url = `${this.socketBaseUrl}/?repo=${encodeURIComponent(repoPath)}`;
        const socket = new WebSocket(url);

        const taskManager = TaskManager.getInstance();
        const boxTask = new BoxTask(`Pushing ${repoPath} to ${this.vcsUrl}`);

        socket.onopen = () => {
            console.log("Push socket opened");
            boxTask.open();
            taskManager.addTask(boxTask);
        }
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Push progress:", data);
            } catch (err) {
                console.error(err);
            }
        };
        socket.onerror = (event) => console.error("Push socket error:", event);
        socket.onclose = (event) => {
            console.log("Push socket closed:", event);
            boxTask.close();
        }

        return socket;
    }

    private async createRepository(repoPath: string, remoteUrl: string) {
        const resp = await this.api.post(`/initialize/repository/${repoPath}`, null, {
            params: { remote: remoteUrl }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async ghostStage(repoPath: string, filepath: string, ghostName: string) {
        const resp = await this.api.post(`/${repoPath}/ghostStage`, null, {
            params: { filepath, ghostName }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async switchBranch(repoPath: string, branch: string) {
        const resp = await this.api.put(`/${repoPath}/switch`, null, {
            params: { branch, worldEffect: false }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async commit(repoPath: string, message?: string) {
        const resp = await this.api.post(`/${repoPath}/commit`, null, {
            params: { message }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async push(repoPath: string, branch: string) {
        const resp = await this.api.post(`/${repoPath}/push`, null, {
            params: { branch }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async wash(repoPath: string) {
        const resp = await this.api.delete(`/${repoPath}/wash`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async prepareAsset(repoPath: string, filepath: string) {
        const resp = await this.api.post(`/${repoPath}/prepareAsset`, null, {
            params: { filepath }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }
}