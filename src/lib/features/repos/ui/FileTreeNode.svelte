<script lang="ts">
    import type { FileUnit } from "$lib/utils/fs/FsInfo";
    import Icon from "@iconify/svelte";

    export let node: FileUnit;
    export let toggleFileSelection: (file: FileUnit) => void;
    export let isFileSelected: (file: FileUnit) => boolean;
    export let isFolderSelected: (folder: FileUnit) => boolean;
    export let isFolderPartiallySelected: (folder: FileUnit) => boolean;
    export let isDirectoryEntrySelected: (folder: FileUnit) => boolean;
    export let loadChildren: (node: FileUnit) => Promise<void>;
    
    let isExpanded = false;
    let checkboxEl: HTMLInputElement;

    async function handleToggle() {
        if (node.isDirectory && !isExpanded && node.children.length === 0) {
            await loadChildren(node);
        }
        isExpanded = !isExpanded;
    }

    function handleCheckboxChange() {
        toggleFileSelection(node);
    }

    $: isChecked = node.isDirectory ? isFolderSelected(node) : isFileSelected(node);
    $: isPartiallyChecked = node.isDirectory && isFolderPartiallySelected(node);
    $: checkboxEl && (checkboxEl.indeterminate = isPartiallyChecked);
</script>

<div class="text-sm">
    <div class="flex items-center gap-2 py-1 hover:bg-neutral-700 rounded px-2 cursor-pointer">
        {#if node.isDirectory}
            <button
                type="button"
                class="text-txt-muted hover:text-txt-main"
                on:click={handleToggle}
            >
                <Icon icon={isExpanded ? "mdi:chevron-down" : "mdi:chevron-right"} />
            </button>
        {:else}
            <span class="w-4"></span>
        {/if}

        <input
            type="checkbox"
            bind:this={checkboxEl}
            checked={isChecked}
            on:change={handleCheckboxChange}
            class="unique-checkbox w-5 h-5 cursor-pointer"
        />

        <span class="flex-1 flex gap-1 text-txt-main text-xl">
            {#if node.isDirectory}
                <Icon icon="material-symbols-light:folder-sharp" /> 
                <span class="text-sm">
                    {node.name}{isDirectoryEntrySelected(node) ? "/" : ""}
                </span>
            {:else}
                <Icon icon="material-symbols-light:insert-drive-file" /> 
                <span class="text-sm">
                    {node.name}
                </span>
            {/if}
        </span>
    </div>

    {#if isExpanded && node.isDirectory}
        <div class="ml-6">
            {#each node.children as child (child.name)}
                <svelte:self
                    node={child}
                    {toggleFileSelection}
                    {isFileSelected}
                    {isFolderSelected}
                    {isFolderPartiallySelected}
                    {isDirectoryEntrySelected}
                    {loadChildren}
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .unique-checkbox {
        -webkit-appearance: none;
        appearance: none;
        width: 1.25rem; /* w-5 */
        height: 1.25rem; /* h-5 */
        border-radius: 0.35rem;
        border: 1px solid var(--border, rgba(255,255,255,0.22));
        background-color: transparent; /* transparent when unchecked */
        position: relative;
        transition: border-color .2s ease, background-color .2s ease, box-shadow .2s ease, transform .08s ease;
    }

    .unique-checkbox:hover {
        border-color: var(--txt-main, rgba(255,255,255,0.6));
    }

    .unique-checkbox:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.35); /* purple ring */
    }

    .unique-checkbox:active {
        transform: scale(0.96);
    }

    /* Checked state: vibrant gradient and white check glyph */
    .unique-checkbox:checked {
        border-color: #a855f7; /* purple */
        background-image: linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%);
        background-color: #a855f7;
    }

    .unique-checkbox:checked::after {
        content: "";
        position: absolute;
        inset: 0.1rem; /* padding inside for the glyph */
        background: white;
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z'/%3E%3C/svg%3E") center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z'/%3E%3C/svg%3E") center / contain no-repeat;
    }

    /* Indeterminate (partial selection): subtle glow and horizontal bar */
    .unique-checkbox:indeterminate {
        border-color: #a855f7;
        background-color: rgba(168, 85, 247, 0.15);
    }

    .unique-checkbox:indeterminate::after {
        content: "";
        position: absolute;
        width: 60%;
        height: 2px;
        background: #a855f7;
        top: 50%;
        left: 20%;
        transform: translateY(-50%);
        border-radius: 2px;
    }
</style>
