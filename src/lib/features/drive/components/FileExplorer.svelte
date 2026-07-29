<script lang="ts">
	import Icon from "@iconify/svelte";
	import { PathObjectDto, type DirObject } from "../dtos/DirObject";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import FileIconSelector from "../ui/FileIconSelector.svelte";
	import UvPreviewer from "$lib/features/ultraviolet/ui/UvPreviewer.svelte";
	import { getAuthContext } from "$lib/features/auth/AuthContext.svelte";
	import ShareButton from "./ShareButton.svelte";
	import vcsApi from "$lib/utils/apis/vcsApi";
	import DownloadButton from "./DownloadButton.svelte";
	import { TransferState } from "$lib/utils/models/BaseDTO.svelte";
	import RecentFilesStore from "../stores/RecentFilesStore.svelte";

    let { openFolder } : { openFolder: (path: string) => Promise<PathObjectDto> } = $props();

    let subPathQuery = $derived(page.params.path || "/");
    let root = $state<PathObjectDto>(new PathObjectDto());

    $effect(() => {
        openFolder(subPathQuery).then((dto) => {
            root = dto;
            if (dto.payload) {
                RecentFilesStore.getInstance().add(dto.payload);
            }
        })
    })

    const authService = getAuthContext().service;

    async function handleOpenFile(dir: DirObject) {
        if (dir.type === "folder") {
            const oldUrl = page.url.pathname;
            if (oldUrl.startsWith("/preview/")) {
                goto(`/preview/drive/${dir.path}`);
            }
            else {
                goto(`/drive/${dir.path}`);
            }
        }
        else {
            fileToPreview = `${dir.path}/${dir.version}/${dir.type.split("/")[0]}`;
        }
    }

    async function handleGoBack() {
        history.back();
    }

    let fileToPreview = $state<string | null>(null)
    let selected = $state<Set<string>>(new Set());

    function toggleSelected(path: string) {
        if (selected.has(path)) {
            selected.delete(path);
        } else {
            selected.add(path);
        }
        selected = new Set(selected);
    }

</script>

<div class="w-full">

{#if root.state == TransferState.LOADING}
    <div class="flex items-center gap-2 text-text-950/60 py-6 px-3">
        <Icon icon="material-symbols:progress-activity" class="animate-spin" />
        <span>Loading…</span>
    </div>
{:else if root.state == TransferState.SUCCESS}
    {#if root.payload}

        <div class="flex items-center mb-4">
            {#if root.payload.path?.split('/').length >= 2}
                <button
                    onclick={handleGoBack}
                    class="flex items-center justify-center rounded hover:bg-muted mr-1"
                    aria-label="Go back"
                >
                    <span class="material-symbols-rounded text-primary-500 text-xl" >                    
                        arrow_back
                    </span>
                </button>
            {/if}
            <span class="font-medium">All files / </span>
            <span class="text-text-950/60">{root.payload?.path}</span>
        </div>

        {#if root.payload.contents.length === 0}
            <div class="flex flex-col items-center justify-center gap-2 py-16 text-text-950/60">
                <Icon icon="fluent:folder-20-filled" class="text-3xl text-text-950/30" />
                <p>No files found</p>
            </div>
        {:else}

            <div class="w-full">
                <!-- header row -->
                <div class="flex items-center text-sm text-text-900/60 border-b border-text-400/30 pb-3 mb-3">
                    <div class="w-10 shrink-0 px-3"></div>
                    <div class="flex-1 min-w-0">
                        <button class="flex items-center gap-1 hover:text-text-950 transition-colors">
                            Name
                            <Icon icon="material-symbols:arrow-upward-rounded" class="text-xs" />
                        </button>
                    </div>
                    <div class="w-32 px-3 border-l border-text-400/20 shrink-0">Type</div>
                    <div class="w-40 px-3 border-l border-text-400/20 shrink-0 text-right">Actions</div>
                </div>

                <!-- rows -->
                {#each root.payload?.contents as child (child.path)}
                <div class="group flex items-center hover:bg-muted/50 transition-colors hover:outline-2 outline-background-100 rounded-lg">
                    <div class="w-10 shrink-0 px-3 py-2.5 flex items-center">
                        <input
                            type="checkbox"
                            class="checkbox-hover w-4 h-4 rounded border border-text-400/50 appearance-none cursor-pointer
                                   checked:bg-primary-500 checked:border-primary-500
                                   opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                            class:!opacity-100={selected.has(child.path)}
                            checked={selected.has(child.path)}
                            onchange={() => toggleSelected(child.path)}
                            aria-label={`Select ${child.name}`}
                        />
                    </div>

                    <div class="flex-1 min-w-0 py-2.5">
                        <button onclick={() => handleOpenFile(child)} class="flex gap-2.5 items-center text-base font-medium w-full text-left">
                            <FileIconSelector type={child.type} />
                            <span class="truncate">{child.name}</span>
                        </button>
                    </div>

                    <div class="w-32 px-3 shrink-0 text-sm text-text-950/60">
                        {#if child.type === "folder"}
                            <span>Folder</span>
                            {:else}
                            <span>File</span>
                        {/if}
                    </div>

                    <div class="w-40 px-3 shrink-0">
                        <div class="flex gap-2 justify-end items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <ShareButton objectPath={`${child.path}`} />
                            <DownloadButton objectPath={`${child.path}`} />
                            <button class="p-1 rounded hover:bg-muted" aria-label="More options">
                                <Icon icon="material-symbols:more-horiz" class="text-lg text-text-950/60" />
                            </button>
                        </div>
                    </div>
                </div>
                {/each}
            </div>
        {/if}
    {/if}

    {#if fileToPreview}
    <div class="absolute w-full h-full bg-neutral-950/70 top-0 left-0 p-30 overflow-y-auto">
        <UvPreviewer 
            apiSource={vcsApi} 
            assetPath={fileToPreview} 
            isMock={authService.isMock()}
            onClickOutside={() => fileToPreview = null}
        />
    </div>
    {/if}

{:else}
    <p class="text-text-950/60 px-3">{root.error?.message}</p>
{/if}
    

</div>

<style>
    .checkbox-hover::after {
        content: "";
        position: absolute;
    }

    .checkbox-hover:checked {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M3 8l3 3 7-7'/%3E%3C/svg%3E");
        background-size: 10px 10px;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>