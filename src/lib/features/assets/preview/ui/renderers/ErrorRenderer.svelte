<script lang="ts">
	import Icon from "@iconify/svelte";

	export let message: string;
</script>

<div class="flex flex-col items-center justify-center gap-2 text-red-400 p-4 text-center">
	<Icon icon="mdi:alert-circle" width="24" height="24" />
	<span class="text-sm">{message}</span>
</div>
