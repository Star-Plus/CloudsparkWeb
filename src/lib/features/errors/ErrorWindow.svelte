<script lang="ts">
	import ErrorStore from "./ErrorStore.svelte";

    const errorStore = ErrorStore.getInstance();

</script>

<div class="fixed bottom-0 left-1/2 -translate-x-1/2 z-100">
    {#each errorStore.errors as error, i}
        <div>
            <button class="text-red-500" onclick={() => errorStore.remove(i)}>X</button>
            <p class="text-red-500">{error.message}</p>
            <p class="text-red-500">{error.cause}</p>
        </div>
    {/each}
</div>