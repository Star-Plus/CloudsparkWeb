<script lang="ts">

    import { page } from "$app/state";
	import { getDriveStorageContext } from "../contexts/DriveStorageContext.svelte";

    let owner = $derived(page.params.path?.split("/")[0] || "");
    let subPathQuery = $derived(page.params.path || "/");

    const driveStorageService = getDriveStorageContext().service;

    let isCreatingFolder = $state(false);

    let folderName = $state("");

    let error = $state<string | null>(null);
    let isLoading = $state(false);

    async function handleOnSubmit(e: Event) {
        try {
            isLoading = true;
            e.preventDefault();
            const parentPath = subPathQuery.split("/").slice(2)
            const dest = parentPath.length > 0 ? `${parentPath}/${folderName}` : folderName;
            await driveStorageService.createFolder(`${owner}/vault`, dest);
            isCreatingFolder = false;
        }
        catch (err: any) {
            console.error(err);
            error = err.message;
        }
        finally {
            isLoading = false;
        }
    }

    async function handleCancel() {
        isCreatingFolder = false;
        isLoading = false;
        error = null;
    }

</script>

<button class="bg-background-200 hover:bg-background-300 px-3 py-2 rounded-sm flex items-center gap-2" onclick={() => isCreatingFolder = true}>
    <span class="material-symbols-rounded">
    create_new_folder
    </span>
    Create Folder
</button>

{#if isCreatingFolder}
<div class="fixed top-1/2 left-1/2 -translate-1/2 w-fit h-fit bg-background-200 p-3 flex flex-col items-center justify-center">
    <button onclick={handleCancel}>Close</button>
    {#if isLoading}
        <p>Loading...</p>
    {:else if error}
        <p>{error}</p>
    {:else}
        <form onsubmit={handleOnSubmit}>
            <input bind:value={folderName} type="text" placeholder="Folder name"/>
            <button type="submit">Create</button>
        </form>
    {/if}
</div>
{/if}