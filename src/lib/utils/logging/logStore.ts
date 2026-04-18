import { writable, type Writable } from "svelte/store";
import type LogUnit from "./LogUnit";

const internalStore: Writable<LogUnit[]> = writable<LogUnit[]>([]);

export const logStore: Writable<LogUnit[]> = {
    subscribe: (fn) => {
        const unsubscribe = internalStore.subscribe(fn);
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "__logStore__") {
                try {
                    const newLogs = JSON.parse(e.newValue || "[]");
                    internalStore.set(newLogs);
                } catch (err) {
                    console.error("Failed to parse logs from storage:", err);
                }
            }
        };
        
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            unsubscribe();
            window.removeEventListener("storage", handleStorageChange);
        };
    },
    set: (value: LogUnit[]) => {
        internalStore.set(value);
        try {
            localStorage.setItem("__logStore__", JSON.stringify(value));
        } catch (err) {
            console.error("Failed to save logs to storage:", err);
        }
    },
    update: (fn) => {
        internalStore.update((current) => {
            const updated = fn(current);
            try {
                localStorage.setItem("__logStore__", JSON.stringify(updated));
                window.dispatchEvent(new StorageEvent("storage", {
                    key: "__logStore__",
                    newValue: JSON.stringify(updated),
                    oldValue: JSON.stringify(current),
                    storageArea: localStorage,
                }));
            } catch (err) {
                console.error("Failed to update logs storage:", err);
            }
            return updated;
        });
    }
};

try {
    const savedLogs = localStorage.getItem("__logStore__");
    if (savedLogs) {
        internalStore.set(JSON.parse(savedLogs));
    }
} catch (err) {
    console.error("Failed to load logs from storage:", err);
}

if (typeof window !== "undefined") {
    (window as any).__logStore = logStore;
}

export default logStore;

