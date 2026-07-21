<script>
	import ErrorStore from "./ErrorStore.svelte";

</script>
<button class="fixed bottom-10 right-10 bg-red-800 text-white px-4 py-2 cursor-pointer z-100" onclick={() => ErrorStore.getInstance().add(new Error("Dummy Error"))}>
    Fire Error
</button>