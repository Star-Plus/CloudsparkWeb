<script lang="ts">
	import { TransferState } from "$lib/utils/models/BaseDTO.svelte";
	import Icon from "@iconify/svelte";
	import type RepoVcsMetadataDto from "../dtos/RepoVcsMetadataDto";

	let { repoVcsMetadata }: { repoVcsMetadata: RepoVcsMetadataDto } = $props();
	let properties = $derived(repoVcsMetadata.state == TransferState.SUCCESS ? repoVcsMetadata.payload : null);

	let selectedBranchIdx = $state(0);
	let isSelectingBranch = $state(false);

	function toggleSelectingBranch() {
		isSelectingBranch = !isSelectingBranch;
	}
</script>

<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
	<div class="space-y-1">
		<p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-800">Version control</p>
		<h3 class="text-xl font-semibold text-text-950">Branch details</h3>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<div class="relative">
			<button
				class="flex items-center gap-2 rounded-full border border-background-300 bg-background-200 px-3 py-2 text-sm shadow-sm transition hover:border-primary-500 hover:bg-background-100"
				onclick={toggleSelectingBranch}
			>
				<Icon class="text-accent-500" icon="fluent:branch-16-filled" />
				<span class="font-medium text-text-800">Branch</span>
				<span class="font-semibold text-text-950">{properties?.branches[selectedBranchIdx]?.name ?? "main"}</span>
				<Icon icon="material-symbols:expand-more-rounded" />
			</button>

			{#if isSelectingBranch}
				<ul class="absolute right-0 top-12 z-20 mt-1 min-w-48 rounded-2xl border border-background-300 bg-background-200 p-1 shadow-lg">
					{#each properties?.branches ?? [] as branch, idx}
						{#if idx !== selectedBranchIdx}
							<li class="overflow-hidden rounded-xl hover:bg-background-300">
								<button
									class="w-full px-3 py-2 text-left text-sm"
									onclick={() => {
										selectedBranchIdx = idx;
										isSelectingBranch = false;
									}}
								>
									{branch.name}
								</button>
							</li>
						{/if}
					{/each}
				</ul>
			{/if}
		</div>

		<div class="flex items-center gap-2 rounded-full border border-background-300 bg-background-200 px-3 py-2 text-sm text-text-700 shadow-sm">
			<Icon class="text-2xl text-text-700" icon="material-symbols:commit-rounded" />
			<span class="font-semibold text-text-900">{properties?.branches[selectedBranchIdx]?.commitCount ?? 0}</span>
			<span>Commits</span>
		</div>
	</div>
</div>
