import type GeneralSearchResponse from "./dtos/GeneralSearchResponse";
import SearchTarget from "./SearchTarget";
import UserSearchService from "./UserSearchService";

export default class SearchService {

    private static instance: SearchService;
    private constructor() { }

    public static getInstance(): SearchService {
        if (!SearchService.instance) {
            SearchService.instance = new SearchService();
        }
        return SearchService.instance;
    }

    public async search(query: string, target: SearchTarget) : Promise<GeneralSearchResponse> {
        try {
            switch (target) {
                case SearchTarget.Users:
                    const response = await UserSearchService.searchUsers(query);
                    return { users: response };
                default:
                    throw new Error("Invalid search target");
            }
        }
        catch (error) {
            throw error;
        }
    }

}