import Repository from "./Repository";

export default class RepositoryParser {
    static fromJSON(json: any): Repository {
        const repo = new Repository(json.path);
        
        repo.setId(json.id);
        repo.shortName = json.shortName;
        repo.emoji = json.emoji;
        repo.createdAt = new Date(json.createdAt);
        repo.updatedAt = new Date(json.updatedAt);
        repo.storageUsedInBytes = json.storageUsedInBytes || 0;
        repo.remoteId = json.remoteId || null;
        return repo;
    }
}