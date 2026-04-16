import axios from "axios";
import type UploadFileResponse from "./dtos/UploadFileResponse";

export default class FileService {

    static async uploadFile(uploadUrl: string, file: Blob, contentType: string): Promise<UploadFileResponse> {
        try {
            const res = await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': contentType
                }
            });

            return res.data;
        }
        catch (error) {
            throw error;
        }
    }

}