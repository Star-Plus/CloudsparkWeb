import type { DirObject } from "../dtos/DirObject";

export default class RecentFilesStore {

    private static instance: RecentFilesStore
    private constructor() {
        this.recentFiles = JSON.parse(localStorage.getItem("recentFiles") || "[]");
    }

    public static getInstance(): RecentFilesStore {
        if (!RecentFilesStore.instance) {
            RecentFilesStore.instance = new RecentFilesStore();
        }
        return RecentFilesStore.instance;
    }

    private CAPACITY = 10;
    public recentFiles = $state<DirObject[]>([])

    public add(file: DirObject) {
        if (!file) throw new Error("File is required");
        if (!file.path || file.path.split("/").length < 3) return;

        console.log(file)

        if (this.recentFiles.find((f) => f.path === file.path)) {
            // Put the file to the top of the list
            this.recentFiles = this.recentFiles.filter((f) => f.path !== file.path);
            this.recentFiles.unshift(file);
            return;
        }
        this.recentFiles.unshift(file);
        this.recentFiles = this.recentFiles.slice(0, this.CAPACITY);

        this.save();
    }

    public save() {
        localStorage.setItem("recentFiles", JSON.stringify(this.recentFiles));
    }
}