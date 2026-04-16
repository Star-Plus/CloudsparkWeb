import api from "$lib/utils/api/appApi";
import assetApi from "$lib/utils/api/assetApi";
import Logger from "$lib/utils/logging/Logger";
import type CreateProfileRequest from "./dtos/CreateProfileRequest";
import type ProfileRepositoryResponse from "./dtos/ProfileRepositoryResponse";
import type UserProfileResponse from "./dtos/UserProfileResponse";

export default class UserProfileService {

    private static instance: UserProfileService;

    private constructor() {
    }

    public static getInstance(): UserProfileService {
        if (!UserProfileService.instance) {
            UserProfileService.instance = new UserProfileService();
        }
        return UserProfileService.instance;
    }

    public async createUserProfile(request: CreateProfileRequest): Promise<void> {
        try {
            await api.post("/user/profile", request);
        }
        catch (error) {
            throw error;
        }
    }

    public async getUserProfile(username: string): Promise<UserProfileResponse> {
        try {
            const response = await api.get<UserProfileResponse>(`/user/profile/${username}`);
            Logger.info(`Fetched profile for user: ${username}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    public async getUserRepositories(username: string): Promise<ProfileRepositoryResponse[]> {
        try {
            const response = await assetApi.get(`/remote/profile/${username}/repositories`);
            Logger.info(`Fetched repositories for user: ${username}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
}
