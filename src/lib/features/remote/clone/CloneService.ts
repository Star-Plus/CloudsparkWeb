import CommitApi from "$lib/features/repos/commit/CommitApi";
import RepositoryBuilder from "$lib/features/repos/RepositoryBuilder";
import RepositoryStore from "$lib/features/repos/RepositoryStore";
import assetApi from "$lib/utils/api/assetApi";
import CloudFileService from "$lib/utils/fs/CloudFileService";
import { mkdir } from "@tauri-apps/plugin-fs";
import type CloneResponse from "./dtos/CloneResponse";
import DownloadManager, { LoadingTask } from "$lib/utils/fs/DownloadManager";

export default class CloneService {

    async cloneRepository(
        selectedPath: string,
        remoteID: string,
        remoteName: string,
        latestCommitHash: string | null
    ): Promise<void> {
        try {

            // Modify path
            const targetPath = `${selectedPath}/${remoteName}`;
            await mkdir(targetPath);

            // Initialize a local repo
            const repo = await RepositoryBuilder.buildRepository(targetPath);
            repo.remoteId = remoteID;
            repo.shortName = remoteName;

            // Save the local repo data to the RepositoryStore

            // Get clone response from backend
            const cloneResponse = await assetApi.get<CloneResponse>(`/remote/download/clone/${remoteID}${latestCommitHash ? `?lastCommitRequested=${latestCommitHash}` : ''}`);
            const data = cloneResponse.data;

            if (data.assetUrls === null) {
                console.warn('No assetUrls found in clone response');
                return;
            }


            let totalSize = 0;
            for (const asset of data.assetUrls) {
                totalSize += asset.size;
            }

            const task = new LoadingTask(remoteID, targetPath, true, `Cloning from ${remoteName}`);
            task.total.set(totalSize);
            DownloadManager.getInstance().addTask(task);

            let downloadedSize = 0;

            // Download assets from response
            for (const asset of data.assetUrls) {
                // Make sure target directory exists
                const dirPath = `${targetPath}/${asset.path.substring(0, asset.path.lastIndexOf('/'))}`;
                await mkdir(dirPath, { recursive: true });
                await CloudFileService.downloadFile(asset.url, `${targetPath}/${asset.path}`, (progress) => {
                    downloadedSize += progress.loaded;
                    task.updateNetworkProgress(downloadedSize);
                });
            }

            await RepositoryStore.getInstance().addRepository(repo);

            // Create commits and trees directory
            await mkdir(`${targetPath}/.split/objects/commits`, { recursive: true });
            await mkdir(`${targetPath}/.split/objects/trees`, { recursive: true });

            // Manual commit if tree or commit in response are not empty
            for (let i = 0; i < data.trees.length; i++) {
                const tree = data.trees[i];
                const commit = data.commits[i];

                await CommitApi.manualCommit(
                    targetPath,
                    tree.hash,
                    tree.file,
                    commit.hash,
                    commit.file,
                    i === data.trees.length - 1
                );
            }

            task.finish();
        }
        catch (error) {
            throw error;
        }
    }

}
