import AuthService from "$lib/features/auth/AuthService";
import { invoke } from "@tauri-apps/api/core";
import { loadingStore } from "$lib/stores/loadingStore";

export default class CommitApi {

    async commitChanges(repoPath: string, message: string, selectedFiles: Set<string>, selectAll: boolean): Promise<void> {
        try {
            loadingStore.start('COMMIT', 'Preparing commit...');

            let relativePaths: string[] = [];

            selectedFiles.forEach(file => {
                if (!file) {
                    throw new Error(`FileUnit ${file} does not have a valid path.`);
                }

                relativePaths.push(file);
            });

            const author = AuthService.getInstance().getUser()?.username || "Unknown Author";

            const files = relativePaths.join(",");

            loadingStore.setMessage(`Adding files...`);
            await invoke("vcs_add", { rootPath: repoPath, files: files, selectAll });

            loadingStore.setMessage('Finalizing commit...');
            loadingStore.updateProgress(95);
            await invoke("vcs_commit", { rootPath: repoPath, message, author });

            loadingStore.updateProgress(100);
        }
        catch (error) {
            throw new Error(`Failed to commit changes: ${error}`);
        } finally {
            loadingStore.stop();
        }
    }

    static async manualCommit(
        repoPath: string,
        treeHash: string,
        treeFile: string,
        commitHash: string,
        commitFile: string,
        checkout: boolean = true
    ): Promise<void> {

        try {
            await invoke("vcs_manual_upload_tree", {
                repoPath: repoPath,
                treeHash: treeHash,
                treeContent: treeFile,
            });

            await invoke("vcs_manual_upload_commit", {
                repoPath: repoPath,
                commitHash: commitHash,
                commitContent: commitFile,
            });

          await invoke("vcs_reset", {
                repoPath: repoPath,
            });

            if (checkout) {
                await invoke("vcs_checkout", {
                    rootPath: repoPath,
                    commitId: commitHash,
                });
            }
        }
        catch (e) {
            console.error("Error during manual commit upload:", e);
            throw e;
        }
    }

    static async getCommitHistory(repoPath: string) : Promise<string[]> {
        try {
            const result : string = await invoke("vcs_get_commit_history", { rootPath: repoPath });
            return result.split("\n").filter(line => line.trim() !== "");
        }
        catch (error) {
            console.error("Error fetching commit history:", error);
            throw error;
        }
    }

}
