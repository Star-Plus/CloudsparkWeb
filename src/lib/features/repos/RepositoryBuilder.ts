import Repository from "./Repository";
import { invoke } from "@tauri-apps/api/core";

export default class RepositoryBuilder {
    public static async buildRepository(path: string, init: boolean=true): Promise<Repository> {
        try {
            if (init){
                await invoke("scm_init", { rootPath: path });
            }
            const createdRepository: Repository = new Repository(path);
            return createdRepository;
        }
        catch (error) {
            throw new Error(`Failed to build repository for path: ${path}. Error: ${error}`);
        }
    }
}