<script lang="ts">
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import Icon from "@iconify/svelte";
	import type RepoVcsMetadataDto from "../dtos/RepoVcsMetadataDto";

    let {repoVcsMetadata}: {repoVcsMetadata: RepoVcsMetadataDto} = $props();
    let properties = $derived(repoVcsMetadata.state == TransferState.SUCCESS ? repoVcsMetadata.payload : null);

    let selectedBranchIdx = $derived<number>(0);
    
    let isSelectingBranch = $state(false);

    function toggleSelectingBranch() {
        isSelectingBranch = !isSelectingBranch
    }
</script>

<div class="flex flex-row gap-2 mt-8">

    <div class="relative w-fit">
        <button class="text-lg flex items-center gap-2 border rounded-button py-1 px-2 border-background-300 bg-background-200" onclick={toggleSelectingBranch}>
            <Icon class="text-accent-500" icon="fluent:branch-16-filled" />
            Branch:
            <span class="font-semibold">{properties?.branches[selectedBranchIdx].name}</span>
            <Icon icon="material-symbols:expand-more-rounded" />
        </button>

        {#if isSelectingBranch}
        <ul class="absolute top-12 right-0 bg-background-200 border border-background-300 rounded-button">
            {#each properties?.branches as branch, idx}
                {#if idx != selectedBranchIdx}
                <li class="hover:bg-background-300">
                    <button class="w-full text-left py-1 px-2" onclick={() => selectedBranchIdx = idx}>
                        {branch.name}
                    </button>
                </li>
                {/if}
            {/each}
        </ul>
        {/if}

    </div>

    <div class="bg-background-200 border border-background-300 rounded-button py-1 px-2 flex">
        <div class="flex items-center gap-2">
            <Icon class="text-2xl text-text-700" icon="material-symbols:commit-rounded"/>
            <span>{properties?.branches[selectedBranchIdx].commitCount}</span>     
            <span class="text-text-700">Commits</span>   
        </div>
    </div>

</div>
