import assetApi from "$lib/utils/api/assetApi";
import type CreateRemoteRequest from "./dtos/CreateRemoteRequest";
import type CreateRemoteResponse from "./dtos/CreateRemoteResponse";

export default class RemoteService {

    public async createRemote(request: CreateRemoteRequest): Promise<CreateRemoteResponse> {
        const response = await assetApi.post<CreateRemoteResponse>("/remote/initialize", request);
        return response.data;
    }
    
}