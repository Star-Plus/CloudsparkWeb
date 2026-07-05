<script lang="ts">
	import Icon from "@iconify/svelte";
	import { PathObjectDto, type DirObject } from "../dtos/DirObject";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import FileIconSelector from "../ui/FileIconSelector.svelte";
	import UvPreviewer from "$lib/features/ultraviolet/ui/UvPreviewer.svelte";
	import { getAuthContext } from "$lib/features/auth/AuthContext.svelte";
	import ShareButton from "./ShareButton.svelte";

    let { openFolder } : { openFolder: (path: string) => Promise<DirObject> } = $props();

    let owner = $derived(page.url.searchParams.get("owner") || "");
    let subPathQuery = $derived(page.url.searchParams.get("path") || "");
    let root = $state<PathObjectDto>(new PathObjectDto());

    $effect(() => {
        openFolder(subPathQuery).then((resp) => {
            root.setPayload(resp);
        })
    })

    const authService = getAuthContext().service;
    let user = $derived(owner || authService.getUser()?.username || "");

    async function handleOpenFile(dir: DirObject) {
        if (dir.type === "dir") {
            const newParams = new URLSearchParams(page.url.searchParams);
            newParams.set("path", dir.path);
            goto(`?${newParams.toString()}`, {keepFocus: true, noScroll: true});
        }
        else {
            // TODO: Open file
            console.log("Opening file", dir);
            fileToPreview = `${user}/${dir.path}/${dir.version}/${dir.type.split("/")[0]}`;
        }
    }

    async function handleGoBack() {
        history.back();
    }

    let fileToPreview = $state<string | null>(null)

</script>

<div class="w-full">
    
    {#if root.payload?.contents}
    <table class="felx flex-col gap-3 container w-full">
        <caption class="text-start">
            {#if root.payload.path !== "/"}
                <button onclick={handleGoBack} class="inline text-xl">
                    <Icon icon="fluent:arrow-left-12-regular" class="text-primary-500" />
                </button>
            {/if}
            <span class="font-medium">
            All files 
            </span>
            {root.payload?.path}
        </caption>
        <thead>
            <tr class="text-left text-text-950/60">
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        {#each root.payload?.contents as child (child.path)}
        <tr>
            <td>
                <button onclick={() => handleOpenFile(child)} class="flex gap-2 items-center text-xl item w-full py-1">
                    {#if child.type === "dir"}
                        <Icon icon="fluent:folder-20-filled" class="text-primary-500" />
                        <p class="font-medium">{child.name}</p>
                        {:else}
                        <!-- TODO: Ultraviolet -->
                        <FileIconSelector type={child.type} />
                        <div>{child.name}</div>
                    {/if}
                </button>
            </td>
            <td>
                {#if child.type === "dir"}
                    <span>Folder</span>
                    {:else}
                    <span>File</span>
                {/if}
            </td>

            <td>
                <ShareButton objectPath={`${user}${child.path}`} />
            </td>
        </tr>
        {/each}
        </tbody>
    </table>
    {/if}

    {#if fileToPreview}
    <div class="absolute w-full h-full bg-neutral-950/70 top-0 left-0 p-30 overflow-y-auto">
        <UvPreviewer assetPath={fileToPreview} isMock={authService.isMock()} />
    </div>
    {/if}
    

</div>



<style>
    thead > tr > th {
        padding: 0.9rem 0;
    }
</style>