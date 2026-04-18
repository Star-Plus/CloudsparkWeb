export default interface PresignedUrlResponse {
    presignedUrl: string;
    fileUrl: string;
    expiration: Date;
}