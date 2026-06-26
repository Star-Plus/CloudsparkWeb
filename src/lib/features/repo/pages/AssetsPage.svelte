<script lang="ts">
	import { onMount } from "svelte";
	import RepoPropsDto from "../dtos/RepoPropsDto";
	import type RepoService from "../services/RepoService";
	import RepoPropsUI from "../ui/RepoPropsUI.svelte";

    let {repoService}: {repoService: RepoService} = $props();

    let repoProps = $state<RepoPropsDto>(new RepoPropsDto());

    onMount(()=> {
        repoService.getRepoProps("aejkatappaja", "aejkatappaja.github.io").then(dto => repoProps = dto);
    })

</script>

<div>
    
    <!-- Repo Props -->
    <section>
        <RepoPropsUI {repoProps} />
    </section>

    <!-- Repo Vcs Metadata -->
    <section>

    </section>

    <!-- Repo Assets -->
    <section>

    </section>

</div>