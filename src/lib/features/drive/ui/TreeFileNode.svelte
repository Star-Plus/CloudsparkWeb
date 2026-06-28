<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { DirObject } from "../dtos/DirObject";
    import TreeNode from "./TreeFileNode.svelte";

    let { node, expandPath, depth = 0 } : {
        node: DirObject;
        expandPath: (path: string) => Promise<DirObject>;
        depth?: number;
    } = $props();

    let expanded = $state(false);
    let children = $derived<DirObject[]>(node.contents ?? []);
    let loading = $state(false);

    // svelte-ignore state_referenced_locally
    const isDir = node.type === "dir";

    async function toggle() {
        if (!isDir) return;

        if (expanded) {
            expanded = false;
            return;
        }

        if (children.length === 0) {
            loading = true;
            try {
                const fetched = await expandPath(node.path);
                children = fetched.contents ?? [];
            } finally {
                loading = false;
            }
        }

        expanded = true;
    }
</script>

<div style="padding-left: {depth * 1}rem">
    <button class="flex items-center gap-1 w-full hover:bg-muted rounded px-1 py-0.5 text-md" onclick={toggle}>
        {#if isDir}
            {#if loading}
                <Icon icon="material-symbols:progress-activity" class="animate-spin text-sm" />
            {:else}
                <Icon
                    icon={expanded
                        ? "material-symbols:expand-more-rounded"
                        : "material-symbols:chevron-right-rounded"}
                />
            {/if}
            <Icon icon="fluent:folder-20-filled" class="text-primary-500 text-lg" />
        {:else}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <span class="w-4" /> <!-- spacer to align with folders -->
            <Icon icon="fluent:document-20-filled" class="text-secondary-600 text-lg" />
        {/if}
        <span class="truncate">{node.name}</span>
    </button>

    {#if expanded && children.length > 0}
        {#each children as child (child.path)}
            <TreeNode node={child} {expandPath} depth={depth + 1} />
        {/each}
    {/if}
</div>