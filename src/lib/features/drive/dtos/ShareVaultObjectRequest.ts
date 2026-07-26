import BaseDTO from "$lib/utils/models/BaseDTO.svelte";

export type ShareVaultObjectPayload = {
    objectPath: string;
    shareWith: string;
    permissionRoles: {
        canShare: boolean;
        canWrite: boolean;
        canRead: boolean;
        canPreview: boolean;
    }
}

export class ShareVaultObjectRequest extends BaseDTO<ShareVaultObjectPayload> {}