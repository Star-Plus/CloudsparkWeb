import type Repository from "$lib/features/repos/Repository";
import assetApi from "$lib/utils/api/assetApi";
import { invoke } from "@tauri-apps/api/core";
import type NegotiateResponse from "./dtos/NegotiateResponse";
import NegotationFilter from "./NegotiationFilter";
import { UploadIntentRequest, type FileEntry, type UploadIntentResponse } from "./dtos/UploadIntentDtos";
import { readFile } from "@tauri-apps/plugin-fs";
import { loadingStore } from "$lib/stores/loadingStore";
import DownloadManager, { LoadingTask } from "$lib/utils/fs/DownloadManager";
import CloudFileService from "$lib/utils/fs/CloudFileService";

export default class CommitUploadService {
  private static instance: CommitUploadService;
  private negotiationData: FileEntry[] = [];

  private constructor() { }

  public static getInstance(): CommitUploadService {
    if (!CommitUploadService.instance) {
      CommitUploadService.instance = new CommitUploadService();
    }
    return CommitUploadService.instance;
  }

  public async negotiate(repo: Repository): Promise<boolean> {
    try {
      const response = await assetApi.get<NegotiateResponse>(`/remote/upload/negotiate/${repo.remoteId}`);
      let requestedCommitId = response.data.latestCommitHash ? response.data.latestCommitHash : "EMPTY";

      let innerNegotiateResponse = await invoke("vcs_negotiate", { rootPath: repo.path, requestedCommitId }) as string;
      console.log(innerNegotiateResponse);
      innerNegotiateResponse = innerNegotiateResponse.trim();

      if (!innerNegotiateResponse) return false;
      if (innerNegotiateResponse === "EMPTY:0") return false;

      this.negotiationData = innerNegotiateResponse.split("\n").map((line) => {
        const [name, size] = line.split(':');
        return { name, size: parseInt(size) };
      });

      return this.negotiationData.length > 0;
    } catch (error) {
      throw error;
    }
  }

  public negotiationCount(): number {
    return this.negotiationData.length;
  }

  private async fetchUploadIntent(repo: Repository): Promise<UploadIntentResponse> {
    const filteredNegotiation = NegotationFilter.filterAssetFiles(this.negotiationData);
    const requestBody = new UploadIntentRequest(repo.remoteId!, filteredNegotiation);
    const uploadResponse = await assetApi.post<UploadIntentResponse>(`/remote/upload/intent`, requestBody);
    return uploadResponse.data;
  }

  public async uploadCommit(repo: Repository): Promise<void> {
    if (repo.remoteId == null) {
      throw new Error("Repository is not linked to a remote.");
    }

    try {
      loadingStore.setMessage('Negotiating upload...');
      loadingStore.updateProgress(10);

      const negotiationResult = await this.negotiate(repo);
      if (!negotiationResult) {
        loadingStore.stop();
        return;
      }

      loadingStore.setMessage('Preparing secure upload channels...');
      loadingStore.updateProgress(50);

      const intentData = await this.fetchUploadIntent(repo);

      loadingStore.updateProgress(100);
      loadingStore.stop();

      this.runBackgroundUploadSequence(repo, intentData).catch(error => {
        console.error("Background upload sequence failed:", error);
        // Optional: trigger a toast notification here to tell the user the background upload failed
      });

    } catch (error) {
      loadingStore.stop();
      throw error;
    }
  }

  private async runBackgroundUploadSequence(repo: Repository, intentData: UploadIntentResponse): Promise<void> {
    const uploadTask = new LoadingTask("CloudSpark", "CloudSpark User", false, "Uploading commit assets");
    DownloadManager.getInstance().addTask(uploadTask);

    try {
      await this.uploadAssets(repo, intentData.uploadUrls, uploadTask);

      await this.completeUpload(intentData.intentId);
      await this.uploadTrees(repo, intentData.intentId);
      await this.uploadCommits(repo, intentData.intentId);

      uploadTask.finish();

    } catch (error) {
      uploadTask.fail(error instanceof Error ? error : "Unknown error during upload");
      throw error;
    }
  }

  private async uploadAssets(repo: Repository, uploadUrls: { name: string, url: string }[], uploadTask: LoadingTask): Promise<void> {
    const CONCURRENCY_LIMIT = 3;
    const activeUploads = new Set<Promise<void>>();
    const fileProgressMap = new Map<string, number>();
    let totalUploadSize = 0;

    for (const uploadUrl of uploadUrls) {
      const filePath = repo.path + "/" + uploadUrl.name;
      fileProgressMap.set(uploadUrl.name, 0);

      const networkProgressCallback = (progress: { loaded: number; total: number }) => {
        if (progress.total > 0 && !fileProgressMap.has(uploadUrl.name + "_total")) {
          fileProgressMap.set(uploadUrl.name + "_total", progress.total);
          totalUploadSize += progress.total;
        }

        fileProgressMap.set(uploadUrl.name, progress.loaded);

        let globalLoaded = 0;
        for (const [name, loaded] of fileProgressMap.entries()) {
          if (!name.endsWith("_total")) {
            globalLoaded += loaded;
          }
        }
        uploadTask.updateNetworkProgress(globalLoaded);
      };

      const uploadPromise = CloudFileService.uploadFile(
        uploadUrl.url, filePath, networkProgressCallback
      ).catch(error => {
        console.error(`Failed to upload ${uploadUrl.name}:`, error);
        throw error;
      }).finally(() => {
        activeUploads.delete(uploadPromise);
      });

      activeUploads.add(uploadPromise);

      if (activeUploads.size >= CONCURRENCY_LIMIT) {
        await Promise.race(activeUploads);
      }
    }
    await Promise.all(activeUploads);
  }

  private async completeUpload(intentId: string): Promise<void> {
    const response = await assetApi.put(`/remote/upload/complete/${intentId}`);
    if (response.status !== 200) {
      throw new Error("Failed to complete upload.");
    }
  }

  private async uploadTrees(repo: Repository, intentId: string): Promise<void> {
    const filteredTrees = NegotationFilter.filterTreeFiles(this.negotiationData);

    const CONCURRENCY_LIMIT = 20;
    const activeUploads = new Set<Promise<any>>();

    for (const treePath of filteredTrees) {
      const uploadPromise = readFile(repo.path + "/" + treePath.name)
        .then(data => {
          return assetApi.post(
            `/remote/upload/tree?hash=${treePath.name.split('/').pop()}`,
            data,
            {
              headers: {
                'Content-Type': 'application/octet-stream',
                'Upload-Intent-ID': intentId
              }
            }
          );
        })
        .catch(error => {
          console.error(`Failed to upload tree ${treePath.name}:`, error);
          throw error;
        })
        .finally(() => {
          activeUploads.delete(uploadPromise);
        });

      activeUploads.add(uploadPromise);

      if (activeUploads.size >= CONCURRENCY_LIMIT) {
        await Promise.race(activeUploads);
      }
    }

    await Promise.all(activeUploads);
  }

  private async uploadCommits(repo: Repository, intentId: string): Promise<void> {
    const filteredCommits = NegotationFilter.filterCommitFiles(this.negotiationData);

    for (const commitPath of filteredCommits) {
      const data = await readFile(repo.path + "/" + commitPath.name);
      await assetApi.post(
        `/remote/upload/commit?hash=${commitPath.name.split('/').pop()}`,
        data,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Upload-Intent-ID': intentId
          }
        }
      );
    }
  }
}
