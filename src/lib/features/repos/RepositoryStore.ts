import { exists } from "@tauri-apps/plugin-fs";
import type Repository from "./Repository";
import RepositoryParser from "./RepositoryParser";
import Logger from "$lib/utils/logging/Logger";
import { get, writable } from "svelte/store";

export const repositories = writable<Repository[]>([]);

export default class RepositoryStore {

    private static instance: RepositoryStore | null = null;
    private loadedPaths: Set<string> = new Set();
    
    private constructor() {
        const parsedRepos = JSON.parse(localStorage.getItem("repositories") || "[]");
        
        parsedRepos.forEach(async (repoData: any) => {
            const repo = RepositoryParser.fromJSON(repoData);

            if (this.loadedPaths.has(repo.path)) return;

            repositories.update(current => [...current, repo]);
            this.loadedPaths.add(repo.path);

            this.checkRepositoryPhysicalExistence(repo).then(exists => {
                if (!exists) {
                    this.removeRepository(repo.getId);
                    Logger.info(`Repository at path ${repo.path} removed from store as it no longer exists.`);
                }
            });
        });        
    }

    public static getInstance(): RepositoryStore {
        if (this.instance === null) {
            this.instance = new RepositoryStore();
        }
        return this.instance;
    }

    private async checkRepositoryPhysicalExistence(repo: Repository): Promise<boolean> {
        try {
            const state = await exists(repo.path + "/.split");
            Logger.debug(`Checked physical existence for repository at path ${repo.path}: ${state}`);
            return state;
        }
        catch {
            return false;
        }
    }

    public async addRepository(repo: Repository): Promise<void> {

        if (! await this.checkRepositoryPhysicalExistence(repo)) {
            throw new Error(`Repository path ${repo.path} does not exist or is not a valid .split repository.`);
        }

        let shortName = repo.path.split(/[/\\]/).pop();

        let sameNameRepos = Array.from(get(repositories).values()).filter(r => r.shortName === shortName);

        if (sameNameRepos.length > 0) {
            sameNameRepos.forEach(repo => {
                const parts = repo.path.split(/[/\\]/);
                const newShortName = parts[parts.length - 2] + "/" + parts[parts.length - 1];
                repo.shortName = newShortName;
                repositories.update(current => current.map(r => r.getId === repo.getId ? repo : r));
            });

            shortName = repo.path.split(/[/\\]/).slice(-2).join("/");
        }

        repo.shortName = shortName!;

        repositories.update(current => [...current, repo]);
        this.saveToLocalStorage();
    }

    public getRepoShortName(id: string): string | undefined {
        const item = sessionStorage.getItem(id);
        if (item) {
            return item;
        }
        const repo = get(repositories).find(r => r.getId === id);
        if (repo) {
            sessionStorage.setItem(id, repo.shortName!);
            return repo.shortName!;
        }
        return undefined;
    }

    public getRepository(id: string): Repository | null {
        Logger.debug(`Fetching repository with id: ${id}`);
        return get(repositories).find(r => r.getId === id) || null;
    }

    public removeRepository(id: string): Repository {
        const repo = get(repositories).find(r => r.getId === id);
        if (!repo) {
            throw new Error(`Repository with id ${id} not found.`);
        }
        
        repositories.update(current => current.filter(r => r.getId !== id));
        this.saveToLocalStorage();
        return repo;
    }

    public updateRepository(id: string, updatedRepo: Repository): void {
        if (get(repositories).some(r => r.getId === id)) {
            updatedRepo.updateTimestamps();
            repositories.update(current => current.map(r => r.getId === id ? updatedRepo : r));
            repositories.update(current => {
                const repo = current.find(r => r.getId === id);
                if (repo) {
                    sessionStorage.setItem(id, repo.shortName!);
                }
                return current;
            });

            this.saveToLocalStorage();
        }
    }

    public shadowUpdateRepository(id: string, updatedRepo: Repository): void {
        if (get(repositories).some(r => r.getId === id)) {
            repositories.update(current => current.map(r => r.getId === id ? updatedRepo : r));
            this.saveToLocalStorage();
        }
    }

    private saveToLocalStorage(): void {
        localStorage.setItem("repositories", JSON.stringify(Array.from(get(repositories).values())));
    }
}