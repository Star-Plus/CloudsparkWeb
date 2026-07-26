<script lang="ts">
	import { onMount } from "svelte";
	import RepoPropsDto from "../dtos/RepoPropsDto";
	import type RepoService from "../services/RepoService";
	import RepoPropsUI from "../ui/RepoPropsUI.svelte";
	import RepoVcsMetadataDto from "../dtos/RepoVcsMetadataDto";
	import RepoVcsMetadata from "../ui/RepoVcsMetadata.svelte";
	import RepoContentDto from "../dtos/RepoContentDto";
	import RepoAssets from "../ui/RepoAssets.svelte";
	import RepoSideBar from "../ui/RepoSideBar.svelte";

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
		<section class="">
			<RepoPropsUI {repoProps} />
		</section>

		<section class="">
			<RepoVcsMetadata {repoVcsMetadata} />
		</section>

		<section class="">
			<RepoAssets {repoAssets} {currentPath} {changePath} />
		</section>
	</div>

	<aside class="w-full shrink-0 lg:w-80">
		<RepoSideBar {repoProps} />
	</aside>
</div>