<script lang="ts">
	import { onMount } from "svelte";
	import RepoPropsDto from "../dtos/RepoPropsDto";
	import type RepoService from "../services/RepoService";
	import RepoPropsUI from "../ui/RepoPropsUI.svelte";
	import RepoVcsMetadataDto from "../dtos/RepoVcsMetadataDto";
	import RepoVcsMetadata from "../ui/RepoVcsMetadata.svelte";
	import RepoContentDto from "../dtos/RepoContentDto";
	import RepoAssets from "../ui/RepoAssets.svelte";

	let { repoService }: { repoService: RepoService } = $props();

	let repoProps = $state<RepoPropsDto>(new RepoPropsDto());
	let repoVcsMetadata = $state<RepoVcsMetadataDto>(new RepoVcsMetadataDto());
	let repoAssets = $state<RepoContentDto>(new RepoContentDto());

	let currentPath = $state<string>("/");

	onMount(() => {
		void repoService.getRepoProps("aejkatappaja", "aejkatappaja.github.io").then((dto) => (repoProps = dto));
		void repoService.getRepoVcsMetadata("aejkatappaja", "aejkatappaja.github.io").then((dto) => (repoVcsMetadata = dto));
		void repoService.getRepoContent("aejkatappaja", "aejkatappaja.github.io", currentPath).then((dto) => (repoAssets = dto));
	});

	function changePath(path: string) {
		currentPath = path;
		void repoService.getRepoContent("aejkatappaja", "aejkatappaja.github.io", currentPath).then((dto) => (repoAssets = dto));
	}
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 xl:px-10">
	<div class="flex-1 space-y-6">
		<section class="rounded-3xl border border-background-300 bg-background-100/80 p-6 shadow-sm backdrop-blur sm:p-8">
			<RepoPropsUI {repoProps} />
		</section>

		<section class="rounded-3xl border border-background-300 bg-background-100/80 p-6 shadow-sm sm:p-8">
			<RepoVcsMetadata {repoVcsMetadata} />
		</section>

		<section class="rounded-3xl border border-background-300 bg-background-100/80 p-6 shadow-sm sm:p-8">
			<RepoAssets {repoAssets} {currentPath} {changePath} />
		</section>
	</div>

	<aside class="w-full shrink-0 lg:w-80">
		<div class="sticky top-6 rounded-3xl border border-background-300 bg-background-100/70 p-5 shadow-sm">
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-800">Explorer</p>
			<h2 class="mt-2 text-xl font-semibold text-text-950">Repository assets at a glance</h2>
			<p class="mt-3 text-sm leading-6 text-text-700">
				Browse folders, inspect previews, and keep your current branch in view while moving through the repository.
			</p>

			<div class="mt-5 space-y-3 text-sm text-text-700">
				<div class="rounded-2xl border border-background-300 bg-background-200/80 p-3">
					<p class="font-medium text-text-900">Current path</p>
					<p class="mt-1 break-all text-xs">{currentPath}</p>
				</div>
				<div class="rounded-2xl border border-background-300 bg-background-200/80 p-3">
					<p class="font-medium text-text-900">Tip</p>
					<p class="mt-1 text-xs">Image assets appear first so previews are easier to scan.</p>
				</div>
			</div>
		</div>
	</aside>
</div>