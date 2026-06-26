<script lang="ts">
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import type RepoPropsDto from "../dtos/RepoPropsDto";

    
    let {repoProps}: {repoProps: RepoPropsDto} = $props();
    let properties = $derived(repoProps.state == TransferState.SUCCESS ? repoProps.payload : null);


</script>

<div>
    <div class="flex gap-3 items-center">
        <span style={
            "color: " + (properties?.private ? "var(--color-primary-900)" : "var(--color-accent-200)") + ";" +
            "background-color: " + (properties?.private ? "var(--color-primary-500)" : "var(--color-accent-500)")
        }
        class="rounded-button py-1 px-1.5 font-semibold"
        >
            {properties?.private ? "Private" : "Public"}
        </span>

        <img src={properties?.ownerAvatarUrl} alt="Owner PP" class="size-7 rounded-full object-cover">

        <span class="text-text-800">{properties?.ownerName} /</span>
    </div>

    <div class="mt-4">
        <h1 class="font-extrabold text-4xl">{properties?.name}</h1>
        <p class="text-text-700 mt-2">{properties?.description}</p>
    </div>
</div>