import type { FileEntry } from "./dtos/UploadIntentDtos";

export default class NegotationFilter {

    public static filterAssetFiles(files: {name: string, size: number}[]): FileEntry[] {
        return files.filter(file => {

            let path = file.name.replaceAll("\\", '/');

            const pathParts: string[] = path.split('/');

            if (pathParts.length < 4) return false;

            return pathParts[2] != "commits" && pathParts[2] != "trees";
        }).map(file => {
            return {name: file.name.replaceAll("\\", '/').trim(), size: file.size};
        });
    }

    public static filterTreeFiles(files: {name: string, size: number}[]): FileEntry[] {
        return files.filter(file => {
            let path = file.name.replaceAll("\\", '/');
            const pathParts = path.split('/');

            return pathParts[2] === "trees";
        }).map(file => {
            return {name: file.name.replaceAll("\\", '/').trim(), size: file.size};
        });
    }

    public static filterCommitFiles(files: {name: string, size: number}[]): FileEntry[] {
        return files.filter(file => {
            let path = file.name.replaceAll("\\", '/');
            const pathParts = path.split('/');
            
            return pathParts[2] === "commits";
        }).map(file => {
            return {name: file.name.replaceAll("\\", '/').trim(), size: file.size};
        });
    }
}