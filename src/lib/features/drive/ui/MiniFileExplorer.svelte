<script lang="ts">
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
    {#if rootExpanded && root?.contents}
        {#each root.contents as child (child.path)}
            <TreeFileNode node={child} {expandPath} depth={0} />
        {/each}
    {/if}
</div>