import { exists, readFile } from "@tauri-apps/plugin-fs";
import RepositoryStore from "../RepositoryStore";
import { invoke } from "@tauri-apps/api/core";

export default class IgnoreApi {

    static async getIgnoreFileContent(repoId: string) : Promise<string> {
        try {
            const repo = RepositoryStore.getInstance().getRepository(repoId);
            if (!repo) {
                throw new Error(`Repository with id ${repoId} not found`);
            }

            const ignoreFile = repo.path + '/.split.ignore';

            if (!await exists(ignoreFile)) {
                return "";
            }

            const content = await readFile(ignoreFile);

            const decoder = new TextDecoder("utf-8");
            return decoder.decode(content);

        } catch (error) {
            throw new Error(`Failed to get ignore file content: ${error}`);
        }
    }

    static async addIgnorePattern(repoId: string, pattern: string) : Promise<void> {
        try {
            const repo = RepositoryStore.getInstance().getRepository(repoId);
            if (!repo) {
                throw new Error(`Repository with id ${repoId} not found`);
            }

            await invoke("vcs_add_ignore", {rootPath: repo.path, pattern: pattern});
        } catch (error) {
            throw new Error(`Failed to add ignore pattern: ${error}`);
        }
    }

    static async removeIgnorePattern(repoId: string, pattern: string) : Promise<void> {
        try {
            const repo = RepositoryStore.getInstance().getRepository(repoId);
            if (!repo) {
                throw new Error(`Repository with id ${repoId} not found`);
            }
            await invoke("vcs_remove_ignore", {rootPath: repo.path, pattern: pattern});
        } catch (error) {
            throw new Error(`Failed to remove ignore pattern: ${error}`);
        }
    }

    static async isIgnored(repoId: string, path: string) : Promise<boolean> {
        try {
            const repo = RepositoryStore.getInstance().getRepository(repoId);
            if (!repo) {
                throw new Error(`Repository with id ${repoId} not found`);
            }
            return await invoke("vcs_is_ignored", {rootPath: repo.path, filePath: path});
        } catch (error) {
            throw new Error(`Failed to check if path is ignored: ${error}`);
        }
    }
}