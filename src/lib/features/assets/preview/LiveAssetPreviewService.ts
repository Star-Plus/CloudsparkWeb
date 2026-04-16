import assetApi from "$lib/utils/api/assetApi";
import type PreviewUriResponse from "./dtos/PreviewUriResponse";

export default class LiveAssetPreviewService {
    static async getPreviewUrl(remoteID: string, asset: { id: string; type: string }): Promise<PreviewUriResponse> {
        try {
            const resp = await assetApi.get<PreviewUriResponse>(`/preview/${remoteID}/${asset.id}?type=${asset.type}`);
            return resp.data;
        }
        catch (error) {
            throw error;
        }
    }
}