<script lang="ts">
	import Icon from "@iconify/svelte";
	import { PathObjectDto, type DirObject } from "../dtos/DirObject";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import FileIconSelector from "./FileIconSelector.svelte";

    let { openFolder } : { openFolder: (path: string) => Promise<DirObject> } = $props();

    let subPathQuery = $derived(page.url.searchParams.get("path") || "");
    let root = $state<PathObjectDto>(new PathObjectDto());

    $effect(() => {
        openFolder(subPathQuery).then((resp) => {
            root.setPayload(resp);
        })
    })

    async function handleOpenFile(dir: DirObject) {
        if (dir.type === "dir") {
            const newParams = new URLSearchParams(page.url.searchParams);
            newParams.set("path", dir.path);
            goto(`?${newParams.toString()}`, {keepFocus: true, noScroll: true});
        }
        else {
            // TODO: Open file
        }
    }

    async function handleGoBack() {
        history.back();
    }

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
            {root.payload?.path}
        </caption>
        <thead>
            <tr class="text-left text-text-950/60">
                <th>Name</th>
                <th>Type</th>
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
        </tr>
        {/each}
        </tbody>
    </table>
    {/if}
    
</div>

<style>
    thead > tr > th {
        padding: 0.9rem 0;
    }
</style>