<script lang="ts">
	import ShareObjectForm from "./ShareObjectForm.svelte";

    let {objectPath} : {objectPath: string} = $props();

    let isSharing = $state(false);
    let shareForm = $state<HTMLDivElement>();

    function handleClickShareButton() {
        isSharing = true;
    }

    $effect(() => {
        if (!isSharing) return;

        function handleClickOutside(e: MouseEvent) {
            if (shareForm && !shareForm.contains(e.target as Node)) {
                isSharing = false;
            }
        }

        const id = setTimeout(() => window.addEventListener('click', handleClickOutside), 0);

        return () => {
            clearTimeout(id);
            window.removeEventListener('click', handleClickOutside);
        };
    })

</script>

<button onclick={handleClickShareButton}>
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