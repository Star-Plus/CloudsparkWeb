import assetApi from "$lib/utils/api/assetApi";
import UserSearchService from "$lib/features/search/UserSearchService";
import type { CollaborationListResponse, CollaboratorUser } from "../dtos/CollaborationDtos";

export default class CollaborationService {
    public static async listCollaborators(remoteId: string): Promise<string[]> {
        const resp = await assetApi.get<CollaborationListResponse>("/remote/collaboration/list", {
            params: { remote: remoteId }
        });

        return resp.data?.collaborators ?? [];
    }

    public static async getCollaboratorUsers(usernames: string[]): Promise<CollaboratorUser[]> {
        if (!usernames || usernames.length === 0) return [];
        const users = await UserSearchService.getUsersByUsernames(usernames);
        return users ?? [];
    }

    public async addCollaborator(remoteId: string, collaborator: string): Promise<void> {
        const resp = await assetApi.post(`/remote/collaboration/add-collaborator?remote=${remoteId}`, {
            collaborator: collaborator
        });

        if (resp.status !== 200) {
            throw new Error(`Failed to add collaborator: ${resp.statusText}`);
        }
    }
}
