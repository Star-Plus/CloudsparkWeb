<script lang="ts">
	import Icon from "@iconify/svelte";

	export let previewType: string;
</script>

<div class="flex flex-col items-center justify-center gap-2 text-txt-muted">
	<Icon icon="mdi:file-question" width="24" height="24" />
	<span class="text-sm">Preview not available for type: {previewType}</span>
</div>
