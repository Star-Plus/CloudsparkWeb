<script lang="ts">

    import { page } from "$app/state";
	import ErrorStore from "$lib/features/errors/ErrorStore.svelte";
	import { getDriveStorageContext } from "../contexts/DriveStorageContext.svelte";

    let owner = $derived(page.params.path?.split("/")[0] || "");
    let subPathQuery = $derived(page.params.path || "/");

    const driveStorageService = getDriveStorageContext().service;

    let isCreatingFolder = $state(false);

    let folderName = $state("");

    async function handleOnSubmit(e: Event) {
        try {
            e.preventDefault();
            const parentPath = subPathQuery.split("/").slice(2)
            const dest = parentPath.length > 0 ? `${parentPath}/${folderName}` : folderName;
            await driveStorageService.createFolder(`${owner}/vault`, dest);
            isCreatingFolder = false;
        }
        catch (err) {
            console.error(err);
            ErrorStore.getInstance().add(new Error("Failed to create folder"));
        }
    }

</script>

<button class="bg-background-200 hover:bg-background-300 px-3 py-2 rounded-sm flex items-center gap-2" onclick={() => isCreatingFolder = true}>
    <span class="material-symbols-rounded">
    create_new_folder
    </span>
    Create Folder
</button>

{#if isCreatingFolder}
<div class="fixed top-0 left-0 w-full h-full bg-background-100/50 flex items-center justify-center">
    <form onsubmit={handleOnSubmit}>
        <input bind:value={folderName} type="text" placeholder="Folder name"/>
        <button type="submit">Create</button>
    </form>
</div>
{/if}