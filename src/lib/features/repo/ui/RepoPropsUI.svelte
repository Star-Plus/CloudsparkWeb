<script lang="ts">
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import type RepoPropsDto from "../dtos/RepoPropsDto";

	let { repoProps }: { repoProps: RepoPropsDto } = $props();
	let properties = $derived(repoProps.state == TransferState.SUCCESS ? repoProps.payload : null);
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-center gap-3">
		<span
			style={
				"color: " +
					(properties?.private ? "var(--color-primary-900)" : "var(--color-accent-200)") +
					";background-color: " +
					(properties?.private ? "var(--color-primary-500)" : "var(--color-accent-500)")
			}
			class="rounded-full px-3 py-1 text-sm font-semibold"
		>
			{properties?.private ? "Private" : "Public"}
		</span>

		<div class="flex items-center gap-3 rounded-full border border-background-300 bg-background-200/70 px-3 py-2">
			<img src={properties?.ownerAvatarUrl} alt="Owner avatar" class="size-8 rounded-full object-cover ring-2 ring-background-100" />
			<span class="text-sm font-medium text-text-800">{properties?.ownerName ?? "Owner"}</span>
		</div>
	</div>

	<div class="space-y-2">
		<h1 class="text-3xl font-black tracking-tight text-text-950 sm:text-4xl">{properties?.name ?? "Repository"}</h1>
		<p class="max-w-3xl text-sm leading-7 text-text-700 sm:text-base">
			{properties?.description ?? "Repository description will appear here."}
		</p>
	</div>
</div>