<script lang="ts">
	import type { DirObject } from "../dtos/DirObject";
	import RecentFilesStore from "../stores/RecentFilesStore.svelte";
	import FileIconSelector from "../ui/FileIconSelector.svelte";

    let files = $derived<DirObject[]>([]);
    let collapsed = $state(false);

    $effect(() => {
        if (collapsed) return
        files = RecentFilesStore.getInstance().recentFiles
    })

</script>

<div class="mb-5 flex flex-col gap-2">
    <div class="flex justify-between items-center gap-2">
        <h2 class="font-medium">Recent files</h2>
        <button
            type="button"
            class="text-text-600 hover:text-text-900 transition-colors"
            aria-label={collapsed ? "Expand section" : "Collapse section"}
            aria-expanded={!collapsed}
            onclick={() => collapsed = !collapsed}
        >
            <span
                class="material-symbols-rounded transition-transform duration-200"
                style:transform={collapsed ? "rotate(-90deg)" : "rotate(0deg)"}
            >
                expand_more
            </span>
        </button>
    </div>

    {#if !collapsed}
    {#if files.length === 0}
    <div class="flex flex-col items-center gap-2 bg-background-100 py-8 rounded-sm text-text-600">
        <span class="material-symbols-rounded">
            folder_off
        </span>
        <span>No recent files</span>
    </div>
    {:else}
    <div class="flex gap-2">
        {#each files as file}
        <div class="bg-background-100/50 border-2 border-background-100/60 size-30 flex flex-col items-center justify-center rounded-sm">
            <FileIconSelector type={file.type} classes="text-6xl!" />
            <span class="text-md block text-center">{file.name}</span>
        </div>
        {/each}
    </div>
    {/if}
    {/if}
</div>