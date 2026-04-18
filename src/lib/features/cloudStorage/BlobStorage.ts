import api from "$lib/utils/api/appApi";
import type PresignedUrlResponse from "./dtos/PresignedUrlResponse";

export default class BlobStorage {
    
    static async getUploadUrl(blobName: string): Promise<PresignedUrlResponse> {
        try {
            const response = await api.post<PresignedUrlResponse>(`/storage?fileName=${encodeURIComponent(blobName)}`);

            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

}