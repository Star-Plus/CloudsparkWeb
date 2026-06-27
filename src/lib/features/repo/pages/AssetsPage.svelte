<script lang="ts">
	import { onMount } from "svelte";
	import RepoPropsDto from "../dtos/RepoPropsDto";
	import type RepoService from "../services/RepoService";
	import RepoPropsUI from "../ui/RepoPropsUI.svelte";
	import RepoVcsMetadataDto from "../dtos/RepoVcsMetadataDto";
	import RepoVcsMetadata from "../ui/RepoVcsMetadata.svelte";

    let {repoService}: {repoService: RepoService} = $props();

    let repoProps = $state<RepoPropsDto>(new RepoPropsDto());
    let repoVcsMetadata = $state<RepoVcsMetadataDto>(new RepoVcsMetadataDto());

    onMount(()=> {
        repoService.getRepoProps("aejkatappaja", "aejkatappaja.github.io").then(dto => repoProps = dto);
        repoService.getRepoVcsMetadata("aejkatappaja", "aejkatappaja.github.io").then(dto => repoVcsMetadata = dto);
    })

</script>

<div>
    
    <!-- Repo Props -->
    <section>
        <RepoPropsUI {repoProps} />
    </section>

    <!-- Repo Vcs Metadata -->
    <section>
        <RepoVcsMetadata {repoVcsMetadata} />
    </section>

    <!-- Repo Assets -->
    <section>

    </section>

</div>