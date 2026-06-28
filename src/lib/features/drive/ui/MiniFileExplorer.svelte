<script lang="ts">
	import Icon from "@iconify/svelte";
    import type {DirObject} from "../dtos/DirObject";
	import { onMount } from "svelte";
	import TreeFileNode from "./TreeFileNode.svelte";

    let {root, expandPath} : 
    {root: DirObject, expandPath: (nestedPath: string) => Promise<DirObject>} = $props();

    let tree =  $state<Map<string, DirObject>>(new Map<string, DirObject>());

    onMount(() => {
        tree.set(root.path, root);
    })

    let rootExpanded = $state(true);

</script>

<div>
    <button
        class="flex items-center gap-1 w-full font-semibold text-lg py-0.5 rounded hover:bg-muted mb-1"
        onclick={() => (rootExpanded = !rootExpanded)}
    >
        <Icon
            icon={rootExpanded
                ? "material-symbols:expand-more-rounded"
                : "material-symbols:chevron-right-rounded"}
        />
        All Files
    </button>

    {#if rootExpanded && root?.contents}
        {#each root.contents as child (child.path)}
            <TreeFileNode node={child} {expandPath} depth={1} />
        {/each}
    {/if}
</div>