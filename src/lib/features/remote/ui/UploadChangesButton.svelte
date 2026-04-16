<script lang="ts">
    import type Repository from "$lib/features/repos/Repository";
    import Icon from "@iconify/svelte";
    import CommitUploadService from "$lib/features/remote/upload/CommitUploadService";
    import { loadingStore } from "$lib/stores/loadingStore";
    import { onMount } from "svelte";

    export let repo: Repository;

    let uploadingCommit = false;
    let needsUploadUpdate = false;
    let negotiationCount = 0;

    const commitUploadService = CommitUploadService.getInstance();

    onMount(async ()=>{
        if (!repo) return;

        try {
            needsUploadUpdate = await commitUploadService.negotiate(repo);
            negotiationCount = commitUploadService.negotiationCount();
        }
        catch (error) {
            console.error("Failed to check upload status", error);
        }
    })

    async function handleUploadCommit() {
        if (!repo) return;

        uploadingCommit = true;
        loadingStore.start("UPLOAD");

        try {
            await commitUploadService.uploadCommit(repo);
        } catch (error) {
            console.error("Failed to upload commit", error);
        } finally {
            uploadingCommit = false;
            loadingStore.stop();
        }
    }

</script>


<div class="relative group">
    <button
        class="btn btn-secondary size-10"
        class:btn-active={needsUploadUpdate}
        on:click={handleUploadCommit}
        disabled={uploadingCommit || !needsUploadUpdate}
        title="Upload changes to remote"
    >
        <Icon
            icon={uploadingCommit
                ? "mdi:loading"
                : needsUploadUpdate ? "mdi:upload" : "mdi:check-circle-outline"}
            class={uploadingCommit ? "animate-spin" : ""}
        />

        
    </button>

    {#if needsUploadUpdate}
        <div class="u-count absolute top-0 right-1/2 translate-x-1/2 px-2 pt-1 pb-6 bg-emerald-400 text-xs text-neutral-800 font-bold flex items-center justify-center z-1 rounded-b-xl opacity-0">{negotiationCount}</div>
    {/if}
</div>

<style>
    .btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        transition: all 0.15s ease;
        user-select: none;
        cursor: pointer;
        z-index: 10;
    }

    .btn:disabled {
        cursor: default;
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.3);
    }

    .btn-secondary {
        color: var(--color-txt-muted);
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        color: white;
        transform: translateY(-1px);
    }

    .btn-active {
        background: #7c3aed;
        color: white;
        border-color: #6d28d9;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
    }

    .btn-active:hover:not(:disabled) {
        background: #8b5cf6;
        border-color: #7c3aed;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .u-count {
        transition: all 0.2s ease-in;
        cursor: default;
    }

    .group:hover .u-count {
        transform: translateY(-24px);
        opacity: 1;
        border-radius: 10px 10px 0 0;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>