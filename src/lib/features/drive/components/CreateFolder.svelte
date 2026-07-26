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

    function handleCancel() {
        isCreatingFolder = false;
        isLoading = false;
        error = null;
    }

    function handleCreateButton() {
        isCreatingFolder = true;
    }

    // svelte-ignore non_reactive_update
    let formContainer: HTMLDivElement;

    $effect(() => {
        if (!isCreatingFolder) return;

        function handleClickOutside(e: MouseEvent) {
            if (formContainer && !formContainer.contains(e.target as Node)) {
                isCreatingFolder = false;
            }
        }

        const id = setTimeout(() => window.addEventListener('click', handleClickOutside), 0);

        return () => {
            clearTimeout(id);
            window.removeEventListener('click', handleClickOutside);
        };
    });

</script>

<button class="bg-background-200/50 hover:bg-background-300 px-3 py-2 rounded-sm flex items-center gap-2 transition-colors" onclick={handleCreateButton}>
    <span class="material-symbols-rounded">
    create_new_folder
    </span>
    Create Folder
</button>

{#if isCreatingFolder}
<div class="fixed top-0 left-0 w-full h-full bg-neutral-800/50 flex items-center justify-center z-100">
    <div bind:this={formContainer} class="w-90 bg-background-50 flex flex-col gap-4 rounded-sm p-5">

        {#if isLoading}
            <div class="flex flex-col items-center gap-3 py-6 text-center">
                <span class="material-symbols-rounded animate-spin text-3xl text-text-500">progress_activity</span>
                <p class="text-text-600">Creating folder…</p>
            </div>
        {:else if error}
            <div class="flex flex-col items-center gap-3 py-6 text-center">
                <span class="material-symbols-rounded text-3xl text-red-500">error</span>
                <p class="text-text-900">{error}</p>
                <button
                    onclick={handleCancel}
                    class="px-4 py-2 rounded-sm text-text-700 hover:bg-background-100 transition-colors"
                >
                    Close
                </button>
            </div>
        {:else}
            <div class="flex flex-col gap-1">
                <h4 class="font-medium text-text-900">Create folder</h4>
                <p class="text-sm text-text-600 truncate">in {subPathQuery}</p>
            </div>

            <form class="flex flex-col gap-4" onsubmit={handleOnSubmit}>
                <label class="flex flex-col gap-1.5">
                    <span class="text-sm font-medium text-text-700">Folder name</span>
                    <input
                        bind:value={folderName}
                        type="text"
                        placeholder="Untitled folder"
                        class="w-full px-3 py-2 rounded-sm border-2 border-background-200 bg-background-50 text-text-900 placeholder:text-text-500 outline-none focus:border-primary-400 transition-colors"
                    />
                </label>

                <div class="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onclick={handleCancel}
                        class="px-4 py-2 rounded-sm text-text-700 hover:bg-background-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!folderName.trim()}
                        class="px-4 py-2 rounded-sm bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:bg-background-200 disabled:text-text-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Create
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
{/if}