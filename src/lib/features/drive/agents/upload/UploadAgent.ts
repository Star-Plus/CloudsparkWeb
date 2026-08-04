import type AuthService from "$lib/features/auth/AuthService";
import BoxTask from "$lib/features/tasks/BoxTask.svelte";
import ConfirmableTask from "$lib/features/tasks/ConfirmableTask.svelte";
import ProgressingTask from "$lib/features/tasks/ProgressingTask.svelte";
import TaskManager from "$lib/features/tasks/TaskManager.svelte";
import { Mockable } from "$lib/utils/mock/Mockable";
import { logger } from "$lib/utils/observe/telemetry";
import type { AxiosInstance } from "axios"

export default class UploadAgent extends Mockable {
    
    private api: AxiosInstance;
    private authService: AuthService;
    private socketBaseUrl?: string;
    private vcsUrl?: string;

    constructor(api: AxiosInstance, authService: AuthService, socketUrl?: string, vcsUrl?: string) {
        super();
        this.api = api;
        this.authService = authService;
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

            await this.login();
            await this.createRepository(repoPath, remoteUrl);

            const relativePath = dest.split("/").slice(2).filter(p => p !== "").join("/");
            
            await this.switchBranch(repoPath, relativePath);
            await this.ghostStage(repoPath, src, relativePath);
            await this.commit(repoPath, `Uploading file ${relativePath} at ${new Date()}`);

            const socket = await this.handlePushSocket(repoPath);

            await this.push(repoPath, relativePath);
            socket?.close();

            await this.wash(repoPath);
            await this.prepareAsset(repoPath, src, relativePath);
        }
        catch (err: any) {
            logger.error(err.message);
            throw err;
        }
    }

    public handlePushSocket(repoPath: string): Promise<WebSocket | null> {
        if (!this.socketBaseUrl) return Promise.resolve(null);

        return new Promise((resolve, reject) => {
            const url = `${this.socketBaseUrl}/push?repo=${encodeURIComponent(repoPath)}`;
            const socket = new WebSocket(url);
    
            const taskManager = TaskManager.getInstance();
            const boxTask = new BoxTask(`Pushing ${repoPath} to ${this.vcsUrl}`);
    
            let isConnected = false;
    
            socket.onopen = () => {
                console.log("Push socket opened");
                boxTask.open();
                taskManager.addTask(boxTask);
            }
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("Push progress:", data);

                    switch (data.type) {
                        case "connected": {
                            if (!isConnected) {
                                isConnected = true;
                                resolve(socket);
                            }
                            break;
                        }
                        case "task": {
                            switch (data.taskType) {
                                case "progressing": {
                                    boxTask.addSubtask(new ProgressingTask(data.action, data.total));
                                    break;
                                }
                                case "confirmation": {
                                    boxTask.addSubtask(new ConfirmableTask(data.action));
                                    break;
                                }
                                default: {
                                    console.error("Unknown task type:", data.taskType);
                                    break;
                                }
                            }
                            break;
                        }
                        case "forward": {
                            const task = boxTask.findSubtask(data.action);
                            if (task instanceof ConfirmableTask) {
                                task.confirm();
                            }
                            else if (task instanceof ProgressingTask) {
                                task.progress = data.current;
                            }
                            else {
                                console.error("Unknown task:", task);
                            }
                            break;
                        }
                        case "error": {
                            boxTask.raiseError(new Error(data.message));
                            break;
                        }
                        default: {
                            console.error("Unknown message type:", data.type);
                            break;
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            socket.onerror = (event) => console.error("Push socket error:", event);
            socket.onclose = (event) => {
                console.log("Push socket closed:", event);
                boxTask.close();
                if (!isConnected) {
                    reject(new Error("Push socket closed"));
                }
            }
    
            return socket;
        })
    }

    private login() {
        if (!this.authService.isAuthenticated()) throw new Error("Not logged in");
        const user = this.authService.getUser();

        return this.api.get("/login", {
            params: { username: user?.username, token: user?.token}
        });
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
        const owner = repoPath.split("/")[0];
        const resp = await this.api.put(`/${repoPath}/switch`, null, {
            params: { branch: owner + ":" + branch, worldEffect: false }
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
        const owner = repoPath.split("/")[0];
        const resp = await this.api.post(`/${repoPath}/push`, null, {
            params: { branch: owner + ":" + branch }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async wash(repoPath: string) {
        const resp = await this.api.delete(`/${repoPath}/wash`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async prepareAsset(repoPath: string, filepath: string, destination: string) {
        const resp = await this.api.post(`/${repoPath}/prepareAsset?destination=${destination}`, null, {
            params: { filepath }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    public async error_uploadFile(_: string) {
        throw new Error("Failed to upload file");
    }
}