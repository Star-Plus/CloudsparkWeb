import { remove } from "@tauri-apps/plugin-fs";
import RepositoryStore from "../RepositoryStore";

export default async function UnmountRepository(repoId: string, purge: boolean): Promise<void> {
    try {
        const repoStore = RepositoryStore.getInstance();
        const repo = repoStore.removeRepository(repoId);
        if (purge){
            await remove(repo.path, { recursive: true });
        }
    }
    catch (error) {
        throw error;
    }
}