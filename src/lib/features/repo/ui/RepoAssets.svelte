<script lang="ts">
	import Icon from "@iconify/svelte";
	import AssetWindowPreview from "./AssetWindowPreview.svelte";
	import type RepoContentDto from "../dtos/RepoContentDto";
	import { TransferState } from "$lib/utils/models/BaseDTO";

	let { repoAssets, currentPath, changePath }: {
		repoAssets: RepoContentDto;
		currentPath: string;
		changePath: (path: string) => void;
	} = $props();

	let properties = $derived(repoAssets.state == TransferState.SUCCESS ? repoAssets.payload : null);

	let sortedAssets = $derived(
		properties?.assets
			.slice()
			.sort(
				(a, b) =>
					isTypeSupportedToPreview(b.type) - isTypeSupportedToPreview(a.type) ||
					(b.size || -1) - (a.size || -1),
			),
	);

	function isTypeSupportedToPreview(type: string): number {
		return type.startsWith("image") ? 1 : 0;
	}

	function buildPath(assetName: string) {
		return currentPath === "/" ? `/${assetName}` : `${currentPath}/${assetName}`;
	}

	function goToParent() {
		if (currentPath === "/") {
			return;
		}

		const segments = currentPath.split("/").filter(Boolean);
		const parentPath = segments.length > 1 ? `/${segments.slice(0, -1).join("/")}` : "/";
		changePath(parentPath);
	}
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="space-y-1">
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-800">Asset browser</p>
			<div class="flex items-center gap-2 text-xl font-semibold text-text-950">
				<Icon icon="fluent:grid-20-filled" class="text-primary-800" />
				<span>{currentPath === "/" ? "Root" : currentPath}</span>
			</div>
		</div>

		<button
			class="rounded-full border border-background-300 bg-background-200 px-3 py-2 text-sm font-medium text-text-700 shadow-sm transition hover:border-primary-500 hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
			onclick={goToParent}
			disabled={currentPath === "/"}
		>
			<Icon icon="material-symbols:arrow-back-rounded" class="mr-1 inline" />
			Go up
		</button>
	</div>

	{#if sortedAssets?.length}
		<div class="columns-4 gap-3 md:grid-cols-2 xl:grid-cols-4">
			{#each sortedAssets as asset}
				<div class="rounded-2xl shadow-sm mb-3 transition hover:-translate-y-0.5 hover:shadow-md">
					{#if asset.type === "DIR"}
						<button
							onclick={() => changePath(buildPath(asset.name))}
							class="flex h-full w-full flex-col items-start bg-background-300/30 justify-between gap-2 border-b border-primary-600 p-4 text-left text-neutral-50 transition hover:bg-primary-500"
						>
							<div class="flex items-center gap-2">
								<Icon icon="fluent:folder-20-filled" class="text-xl" />
								<span class="font-semibold">/{asset.name}</span>
							</div>
							<span class="text-sm text-neutral-100/90">Open folder</span>
						</button>
					{:else}
						<AssetWindowPreview {asset} />
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-dashed border-background-300 bg-background-200/50 p-8 text-center text-text-700">
			No assets found in this folder yet.
		</div>
	{/if}
</div>