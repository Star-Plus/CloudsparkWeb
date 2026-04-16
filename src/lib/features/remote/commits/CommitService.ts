import assetApi from "$lib/utils/api/assetApi";
import type AuthorCommitResponse from "./dtos/AuthorCommitResponse";

export default class CommitService {

    static async getAuthorCommits(authorUsername: string, remote: string): Promise<AuthorCommitResponse> {

        const resp = await assetApi.get<AuthorCommitResponse>(`/remote/download/commits/${remote}/${authorUsername}`)

        return resp.data;

    }

}