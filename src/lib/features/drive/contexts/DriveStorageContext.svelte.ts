import { createContext } from "svelte";
import type DriveStorageService from "../services/DriveStorageService";

export class DriveStorageContext {
    service: DriveStorageService;

    constructor(service: DriveStorageService) {
        this.service = service;
    }
}

export const [getDriveStorageContext, setDriveStorageContext] = createContext<DriveStorageContext>();