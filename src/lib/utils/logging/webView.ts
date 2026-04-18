import { WebviewWindow } from "@tauri-apps/api/webviewWindow";



export async function openLoggerWindow() {
    const loggerWindow = new WebviewWindow("logger", {
        title: "Logger",
        width: 800,
        height: 600,
        url: "logging",
        decorations: false,
        resizable: true,
        maximizable: true,
        minimizable: true,
        alwaysOnTop: false,
    })

    loggerWindow.once("tauri://created", () => {
        console.log("Logger window created");
    });

    loggerWindow.once("tauri://error", (e) => {
        console.error("Error creating logger window:", e);
    });
}