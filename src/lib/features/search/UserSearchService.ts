import appQL from "$lib/utils/api/appQL";
import type UserSearchResponse from "./dtos/UserSearchResponse";

export default class UserSearchService {

    public static async searchUsers(query: string, limit: number=4): Promise<UserSearchResponse[]> {
        const response = await appQL().query(`
            query ($query: String!, $limit: Int!) {
                searchUsers(query: $query, limit: $limit) {
                    username
                    avatarUrl
                }
            }
        `, { query, limit }).toPromise();

        if (response.error) {
            throw new Error(`GraphQL Error: ${response.error.message}`);
        }

        return response.data.searchUsers;
    }

    public static async getUsersByUsernames(usernames: string[]): Promise<UserSearchResponse[]> {
        const response = await appQL().query(`
            query ($usernames: String!) {
                usersByUsernames(usernames: $usernames) {
                    username
                    avatarUrl
                }
            }
        `, { usernames: usernames.join(",") }).toPromise();
        if (response.error) {
            throw new Error(`GraphQL Error: ${response.error.message}`);
        }

        return response.data.usersByUsernames;
    }

}