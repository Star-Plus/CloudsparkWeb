import {readDir, stat} from "@tauri-apps/plugin-fs";

export class FileUnit {
    public name: string;
    public parent: FileUnit | null;
    public path?: string;
    public sizeInBytes: number;
    public children: FileUnit[];
    public isDirectory: boolean;

    constructor(name: string, parent: FileUnit | null = null, isDirectory: boolean = false) {
        this.name = name;
        this.parent = parent;
        this.sizeInBytes = 0;
        this.children = [];
        this.isDirectory = isDirectory;
    }
}

export default class FsInfo {

    public static async getDirectorySizeInBytes(path: string): Promise<number> {
        
        let totalSize = 0;

        const entries = await readDir(path);

        for (const entry of entries) {

            const fullPath = path + "/" + entry.name;

            if (entry.isFile) {
                const metadata = await stat(fullPath);
                totalSize += metadata.size;
            }
            else {
                totalSize += await FsInfo.getDirectorySizeInBytes(fullPath);
            }
        }

        return totalSize;
    }

    public static async buildDirectoryTree(path: string, name: string = "root", parent: FileUnit | null = null): Promise<FileUnit | null> {
        if (path.endsWith("/.split")) {
            return null;
        }
        
        const dirUnit = new FileUnit(name, parent, true);
        
        const entries = await readDir(path);
        for (const entry of entries) {
            const fullPath = path + "/" + entry.name;
            if (entry.isFile) {
                const metadata = await stat(fullPath);
                const fileUnit = new FileUnit(entry.name, dirUnit, false);
                fileUnit.sizeInBytes = metadata.size;
                fileUnit.path = fullPath;
                dirUnit.children.push(fileUnit);
                dirUnit.sizeInBytes += metadata.size;
            }
            else {
                const subDirUnit = await FsInfo.buildDirectoryTree(fullPath, entry.name, dirUnit);
                if (subDirUnit === null) continue;

                dirUnit.children.push(subDirUnit);
                dirUnit.sizeInBytes += subDirUnit.sizeInBytes;
            }
        }
        return dirUnit;
    }

    public static async flattenDirectoryTree(unit: FileUnit): Promise<FileUnit[]> {
        const fileUnits: FileUnit[] = [];

        if (!unit.isDirectory) {
            fileUnits.push(unit);
            return fileUnits;
        }
        
        for (const child of unit.children) {
            const units = await FsInfo.flattenDirectoryTree(child);
            fileUnits.push(...units);
        }

        unit.children = [];

        return fileUnits;
    }

    public static async getDirectoryDirectContents(path: string): Promise<FileUnit[]> {
        const contents: FileUnit[] = [];
        const entries = await readDir(path);
        for (const entry of entries) {
            const fullPath = path + "/" + entry.name;
            const fileUnit = new FileUnit(entry.name, null, entry.isDirectory);
            // Always set full path for both files and directories for caching/selection
            fileUnit.path = fullPath;
            if (entry.isFile) {
                const metadata = await stat(fullPath);
                fileUnit.sizeInBytes = metadata.size;
            } else {
                fileUnit.path += "/";
            }

            if (entry.isDirectory && entry.name == ".split") continue;

            contents.push(fileUnit);
        }

        return contents;
    }

    public static async getFileSizeInBytes(path: string): Promise<number> {
        const metadata = await stat(path);
        return metadata.size;
    }
    
    public static getRelativePath(basePath: string, fullPath: string): string {
        if (!fullPath.startsWith(basePath)) {
            throw new Error(`The fullPath "${fullPath}" does not start with the basePath "${basePath}".`);
        }
        
        return fullPath.substring(basePath.length + 1);
    }
}