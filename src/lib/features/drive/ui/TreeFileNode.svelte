<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { DirObject, PathObjectDto } from "../dtos/DirObject";
    import TreeNode from "./TreeFileNode.svelte";

    let { node, expandPath, depth = 0 } : {
        node: DirObject;
        expandPath: (path: string) => Promise<PathObjectDto>;
        depth?: number;
    } = $props();

    let expanded = $state(false);
    let children = $derived<DirObject[]>(node.contents ?? []);
    let loading = $state(false);

    // svelte-ignore state_referenced_locally
    const isDir = node.type === "folder";

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
                children = fetched.payload?.contents ?? [];
            } finally {
                loading = false;
            }
        }

        expanded = true;
    }
</script>

<div style="padding-left: {depth * 1}rem">
    <div class="flex items-center gap-1 w-full hover:bg-muted rounded px-1 py-0.5" style={depth === 0 ? "font-size: 1.3rem" : "font-size: 1.1rem"}>
        {#if isDir}
            {#if loading}
                <Icon icon="material-symbols:progress-activity" class="animate-spin text-sm" />
            {:else}
                <button onclick={toggle}>
                    <Icon
                        icon={expanded
                            ? "material-symbols:expand-more-rounded"
                            : "material-symbols:chevron-right-rounded"}
                    />
                </button>
            {/if}
            <!-- Special Folders -->
            {#if node.path.endsWith("/vault") && depth === 0}
                <span class="material-symbols-rounded">
                    cloud_lock
                </span>
            {:else if node.path.endsWith("/shared") && depth === 0}
                <span class="material-symbols-rounded">
                    folder_shared
                </span>
            {:else}
                <Icon icon="fluent:folder-20-filled" class="text-primary-500" />
            {/if}
            
        {:else}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <span class="w-4" /> <!-- spacer to align with folders -->
            <Icon icon="fluent:document-20-filled" class="text-background-800" />
        {/if}

        {#if node.path == "/vault" || node.path == "/shared" || node.path == "/"}
        <span class="truncate font-medium">{node.name}</span>
        {:else}
        <span class="truncate">{node.name}</span>
        {/if}
    </div>

    {#if expanded && children.length > 0}
        {#each children as child (child.path)}
            <TreeNode node={child} {expandPath} depth={depth + 1} />
        {/each}
    {/if}
</div>