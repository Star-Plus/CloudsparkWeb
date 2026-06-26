<script lang="ts">
	import AssetsPage from "$lib/features/repo/pages/AssetsPage.svelte";
	import RepoService from "$lib/features/repo/services/RepoService";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";
</script>

<svelte:head>
    <title>CloudsPark - Repo Profile</title>
</svelte:head>

<AssetsPage repoService={useMock<RepoService>(new RepoService(appApi))} />
