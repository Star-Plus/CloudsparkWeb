import { invoke } from "@tauri-apps/api/core";

export default class CheckoutApi {

    static async checkoutCommit(repoPath: string, commitHash: string): Promise<void> {
      try {
            await invoke("vcs_checkout", { rootPath: repoPath, commitId: commitHash });
        } catch (error) {
            throw new Error(`Failed to checkout commit: ${error}`);
        }
    }

}
