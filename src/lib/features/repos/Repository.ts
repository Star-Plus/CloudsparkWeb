import {v4 as uuid4} from "uuid";

export default class Repository {

    private id: string;
    
    path: string;
    shortName: string | null;
    emoji: string;
    createdAt: Date;
    updatedAt: Date;
    storageUsedInBytes: number = 0;

    remoteId: string | null = null;

    constructor(path: string) {
        this.path = path;
        this.shortName = null;
        this.emoji = '📁';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.id = uuid4();
    }

    public get getId(): string {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public setShortName(name: string): void {
        this.shortName = name;
        this.updatedAt = new Date();
    }

    public setEmoji(emoji: string): void {
        this.emoji = emoji;
        this.updatedAt = new Date();
    }

    public updateTimestamps(): void {
        this.updatedAt = new Date();
    }
}