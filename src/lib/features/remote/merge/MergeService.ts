import CommitApi from "$lib/features/repos/commit/CommitApi";
import assetApi from "$lib/utils/api/assetApi";
import CloudFileService from "$lib/utils/fs/CloudFileService";
import { LoadingTask } from "$lib/utils/fs/DownloadManager";
import type MergeRequest from "./dtos/MergeRequest";
import type MergeResponse from "./dtos/MergeResponse";
import { mkdir } from "@tauri-apps/plugin-fs";

export default class MergeService {

    static async fetchMergeAssets(request: MergeRequest, remote: string): Promise<MergeResponse> {
        const resp = await assetApi.post<MergeResponse>(`remote/download/merge/${remote}`, request.data);
        
        return resp.data;
    }

    static async downloadMergedAssets(merge: MergeResponse, repoPath: string): Promise<void> {

        const uniqueAssets = Array.from(new Map(merge.assetUrls.map(item => [item['path'], item])).values());

        let totalDownloadSize = 0;

        const downloadTask = new LoadingTask("CloudSpark", "CloudSpark User", true, "Downloading merged assets");

        await Promise.all(uniqueAssets.map(async (asset) => {
            const savePath = `${repoPath}/${asset.path.trim()}`.replaceAll('/', '\\');
            const downloadUrl = asset.url;

            await mkdir(savePath.substring(0, savePath.lastIndexOf('\\')), { recursive: true });
            
            let subTotal = 0;

            const networkProgressCallback = (progress: { loaded: number; total: number }) => {
                subTotal = progress.total;
                downloadTask.progressNetwork.set(progress.loaded);
            };

            const diskProgressCallback = (progress: { loaded: number; total: number }) => {
                downloadTask.progressDisk.set(progress.loaded);
            };

            await CloudFileService.downloadFile(downloadUrl, savePath, networkProgressCallback, diskProgressCallback);

            totalDownloadSize += subTotal;
        }));
        
        downloadTask.total.set(totalDownloadSize);
    }

    public static async merge(request: MergeRequest, remote: string, repoPath: string): Promise<void> {
        try {
            const resp = await this.fetchMergeAssets(request, remote);
            await this.downloadMergedAssets(resp, repoPath);
            await CommitApi.manualCommit(
                repoPath,
                resp.tree.hash,
                resp.tree.file,
                resp.commit.hash,
                resp.commit.file
            )
        }
        catch (error) {
            throw error;
        }
    }

}