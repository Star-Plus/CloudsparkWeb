<script lang="ts">
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import Icon from "@iconify/svelte";
	import type RepoPropsDto from "../dtos/RepoPropsDto";

	let { repoProps }: { repoProps: RepoPropsDto } = $props();
	let properties = $derived(repoProps.state == TransferState.SUCCESS ? repoProps.payload : null);
</script>

<div class="sticky top-6 space-y-4 rounded-3xl border border-background-300 bg-background-100/70 p-5 shadow-sm">
	<div class="space-y-1">
		<p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-800">Explorer</p>
		<p class="text-sm leading-6 text-text-700">Quick access to the most relevant repository metadata.</p>
	</div>

    <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 rounded-xl border border-background-300 bg-background-100 px-3 py-2">
                <Icon icon="fluent:link-20-filled" class="shrink-0 text-primary-700" />
                <p class="truncate text-sm font-medium text-text-900">{properties?.url ?? "Unavailable"}</p>
            </div>
        </div>
        <button class="rounded-full border border-background-300 bg-background-100 p-2 text-text-700 transition hover:border-primary-500 hover:text-primary-700" aria-label="Copy repository URL">
            <Icon icon="fluent:copy-20-filled" />
        </button>
    </div>

	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
		<div class="rounded-2xl border border-background-300 bg-background-200/70 p-3">
			<p class="text-xs font-semibold uppercase tracking-[0.2em] text-text-600">Size</p>
			<p class="mt-2 text-lg font-semibold text-text-950">{properties?.size ?? 0} GB</p>
		</div>

        <div class="mt-3 flex items-center justify-between">
            <p class="text-sm font-semibold  text-text-800">{properties?.collaborators?.length} Collaborators</p>
            {#if properties?.collaborators?.length}
                <div class="flex items-center">
                    {#each properties.collaborators.slice(0, 3) as collaborator, idx}
                        <img
                            src={collaborator.avatarUrl}
                            alt="{collaborator.name} avatar"
                            class="size-10 rounded-full border-2 border-background-200 object-cover"
                            style="margin-left: {idx === 0 ? '0px' : '-10px'}"
                        />
                    {/each}
                    {#if properties.collaborators.length > 3}
                        <span class="ml-2 flex h-10 min-w-10 items-center justify-center rounded-full bg-background-100 px-3 text-sm font-semibold text-text-800 shadow-sm">
                            +{properties.collaborators.length - 3}
                        </span>
                    {/if}
                </div>
            {:else}
                <p class="text-sm text-text-600">No collaborators listed.</p>
            {/if}
        </div>
    </div>
</div>