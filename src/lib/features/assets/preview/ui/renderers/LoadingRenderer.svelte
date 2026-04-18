<script lang="ts">
	import Icon from "@iconify/svelte";
</script>

<div class="flex flex-col items-center justify-center gap-2 text-txt-muted">
	<Icon icon="mdi:loading" class="animate-spin" width="24" height="24" />
	<span class="text-sm">Loading preview...</span>
</div>

<style>
	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
