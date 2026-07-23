<script lang="ts">
	import ShareObjectForm from "./ShareObjectForm.svelte";
	import { onMount } from "svelte";

    let {objectPath} : {objectPath: string} = $props();

    let isSharing = $state(false);
    let shareForm = $state<HTMLDivElement>();

    let clickDecayTimer = 500;

    onMount(() => {
        window.addEventListener('click', (e) => {
            if (!shareForm?.contains(e.target as Node) && clickDecayTimer <= 0) {
                console.log("Clicked outside share form");
                isSharing = false;
            }
            else {
                clickDecayTimer += 50;
            }
        })
    })


    function toggleSharing() {
        clickDecayTimer = 500;
        isSharing = !isSharing;

        if (isSharing) {
            setTimeout(() => {
                clickDecayTimer = 0;
            }, 500);
        }
    }

</script>

<button onclick={toggleSharing}>
    <span class="material-symbols-rounded">
    group_add
    </span>
</button>

{#if isSharing}
<div class="fixed top-0 left-0 w-screen h-screen z-100 bg-neutral-800/50">
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-fit bg-background-50 p-4 rounded-md shadow-2xs" bind:this={shareForm}>
        <ShareObjectForm objectPath={objectPath} onClose={() => isSharing = false} />
    </div>
</div>
{/if}