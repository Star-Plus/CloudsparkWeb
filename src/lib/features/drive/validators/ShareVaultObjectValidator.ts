import DataValidator, { type ReviewResult } from "$lib/utils/validation/DataValidator.svelte";

export default class ShareVaultObjectValidator extends DataValidator {
    review(key: string, value: any): ReviewResult {
        switch (key) {
            case "shareWith":
                return this.reviewShareWith(value);
            case "objectPath":
                return this.reviewObjectPath(value);
            case "permissionRoles":
                return this.reviewPermissionRoles(value);
        }

        throw new Error("Unknown key");
    }

    private reviewShareWith(value: string): ReviewResult {
        let isValid: boolean = true;
        let message: string = "";

        if (!value) {
            isValid = false;
            message = "Share with is required.";
        }

        return { isValid, message };
    }

    private reviewObjectPath(value: string): ReviewResult {
        let isValid: boolean = true;
        let message: string = "";

        if (!value) {
            isValid = false;
            message = "Object path is required.";
        }

        return { isValid, message };
    }

    private reviewPermissionRoles(value: any): ReviewResult {
        let isValid: boolean = true;
        let message: string = "";

        if (!value) {
            isValid = false;
            message = "Permission roles is required.";
        }

        if (!value.canRead && !value.canWrite && !value.canShare && !value.canPreview) {
            isValid = false;
            message = "Permission roles is required.";
        }

        return { isValid, message };
    }
}