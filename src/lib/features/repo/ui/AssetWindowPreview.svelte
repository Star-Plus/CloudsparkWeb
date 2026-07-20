<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { AssetWindow } from "../dtos/RepoContentDto";

	let { asset }: { asset: AssetWindow } = $props();
	let extension = $derived(asset.type.split("/")[1]?.toUpperCase() ?? "FILE");
	let isImage = $derived(asset.type.startsWith("image") && Boolean(asset.previewUrl));
</script>

<div class="flex flex-col overflow-hidden rounded-xl border-background-300">

	<div class="flex items-center justify-between mb-2 px-1">
		<span class="rounded-full bg-background-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-800">
			{extension}
		</span>
		{#if asset.size}
			<span class="text-xs text-text-600">{Math.round(asset.size / 1024)} KB</span>
		{/if}
	</div>

	{#if isImage}
		<img src={asset.previewUrl} alt={asset.name + " preview"} />
	{:else}
		<div class="flex flex-1 items-center justify-center">
			<Icon icon="fluent:document-20-filled" class="text-4xl text-text-500" />
		</div>
	{/if}

	<div class="flex items-center justify-between gap-2 px-3 py-3">
		<p class="truncate text-sm font-medium text-text-900">{asset.name}</p>
		<span class="shrink-0 text-xs text-text-600">{asset.type.startsWith("image") ? "Preview" : "File"}</span>
	</div>
</div>