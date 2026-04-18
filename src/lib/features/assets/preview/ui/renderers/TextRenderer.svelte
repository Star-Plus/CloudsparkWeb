<script lang="ts">
	export let content: string;
	// svelte-ignore export_let_unused
		export let previewType: string;
</script>

<div class="w-full h-full overflow-auto p-4 bg-neutral-950">
	<pre class="text-xs text-txt-muted font-mono whitespace-pre-wrap break-words">{content}</pre>
</div>

<style>
	:global(pre) {
		margin: 0;
	}
</style>
