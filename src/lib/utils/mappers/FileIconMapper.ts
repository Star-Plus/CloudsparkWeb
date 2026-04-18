import type { FileUnit } from "../fs/FsInfo";

export default class FileIconMapper {
    public static getFileIcon(fileUnit: FileUnit): string {

        const parts = fileUnit.name.split('.');
        if (fileUnit.isDirectory) {
            return 'flat-color-icons:folder';
        }

        const extension = parts.pop()?.toLowerCase();

        if (fileUnit.name == "package.json") {
            return "material-icon-theme:nodejs-alt";
        }

        switch (extension) {
            case 'env':
                return "fluent-color:settings-24"
            case 'js':
                return "logos:javascript";
            case 'txt':
                return 'eva:file-text-fill';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'mdi:file-image-outline';
            case 'psd':
                return 'skill-icons:photoshop';
            default:
                return 'mdi:file-outline';
        }
    }
}