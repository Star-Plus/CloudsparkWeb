<script lang="ts">
    import { page } from "$app/stores";
    import { convertFileSrc } from "@tauri-apps/api/core";
    import { readTextFile, stat } from "@tauri-apps/plugin-fs";
    import { onMount } from "svelte";

    let rawPath = decodeURIComponent($page.url.searchParams.get("asset") || "");
    
    let fileType: 'image' | 'video' | 'text' | 'binary' | 'loading' = 'loading';
    let textContent = "";
    let srcUrl = "";
    let fileSizeStr = "";

    function formatBytes(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    onMount(async () => {
        try {
            await detectAndLoad();
        } catch (e) {
            console.error(e);
            fileType = 'binary';
        }
    });

    async function detectAndLoad() {
        const metadata = await stat(rawPath);
        fileSizeStr = formatBytes(metadata.size);

        const ext = rawPath.split('.').pop()?.toLowerCase() || "";
        
        const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
        const videoExts = ['mp4', 'webm', 'mov', 'mkv', 'avi'];

        if (imageExts.includes(ext)) {
            fileType = 'image';
            srcUrl = convertFileSrc(rawPath);
        } 
        else if (videoExts.includes(ext)) {
            fileType = 'video';
            srcUrl = convertFileSrc(rawPath);
        } 
        else {
            if (metadata.size > 1024 * 1024) { 
                fileType = 'binary';
                textContent = "File is too large to preview.";
            } else {
                fileType = 'text';
                textContent = await readTextFile(rawPath);
            }
        }
    }
</script>

<div class="w-full h-full flex flex-col p-4 overflow-hidden">
    
    <div class="mb-4 text-center">
        <h3 class="text-txt-muted font-medium truncate">{rawPath.split(/[/\\]/).pop()}</h3>
        <p class="text-xs text-gray-400">{fileSizeStr}</p>
    </div>

    <div class="flex-1 pb-10 w-full h-full overflow-hidden rounded-lg shadow-sm flex items-center justify-center relative">
        
        {#if fileType === 'loading'}
            <div class="animate-pulse text-gray-400">Loading...</div>

        {:else if fileType === 'image'}
            <img src={srcUrl} class="w-full h-full object-contain" alt="Preview" />

        {:else if fileType === 'video'}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video controls class="w-full h-full max-h-full">
                <source src={srcUrl} />
                Your browser does not support video.
            </video>

        {:else if fileType === 'text'}
            <div class="w-full h-full overflow-auto p-4 text-gray-100 text-sm font-mono text-left">
                <pre>{textContent}</pre>
            </div>

        {:else}
            <div class="text-center p-6">
                <div class="text-6xl mb-4">📄</div>
                <p class="text-gray-500 font-medium">Preview not available</p>
                <p class="text-gray-400 text-sm mt-2">Binary file or too large to display.</p>
            </div>
        {/if}

    </div>
</div>