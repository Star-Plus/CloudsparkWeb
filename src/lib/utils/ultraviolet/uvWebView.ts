import { WebviewWindow } from "@tauri-apps/api/webviewWindow";



export async function openUvWindow(assetPath: string) {

    const uniqueLable = `uv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const uvWindow = new WebviewWindow(uniqueLable, {
        title: "Ultraviolet",
        width: 800,
        height: 600,
        url: `ultraviolet?asset=${encodeURIComponent(assetPath)}`,
        decorations: false,
        resizable: true,
        maximizable: true,
        minimizable: true,
        alwaysOnTop: false,
    })

    uvWindow.once("tauri://created", () => {
        console.log("Ultraviolet window created");
    });

    uvWindow.once("tauri://error", (e) => {
        console.error("Error creating Ultraviolet window:", e);
    });
}