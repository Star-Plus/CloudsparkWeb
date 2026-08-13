class RecordingState {
    isRecording = $state(false);
}

export const recording = new RecordingState();

let LogRocket: typeof import('logrocket').default | null = null;

export async function startRecording() {
    // 1. Bail if we are already recording or running on the server
    if (recording.isRecording || typeof window === 'undefined') return;

    try {
        const mod = await import('logrocket');
        LogRocket = mod.default;
        
        // 2. Prevent duplicate initialization during HMR (Development)
        // We check the window object because it survives SvelteKit hot-reloads.
        if (!(window as any)._logrocket_initialized) {
            LogRocket.init('m2blyc/euler');
            (window as any)._logrocket_initialized = true;
        }
        
        recording.isRecording = true;
        identifyFromLocalStorage();
        
    } catch (error) {
        console.error("Failed to start LogRocket recording:", error);
    }
}

export function identifyFromLocalStorage() {
    if (!recording.isRecording || !LogRocket) return;

    const username = localStorage.getItem('username');
    if (username) {
        LogRocket.identify(username, {
            name: username,
        });
    }
}