<script lang="ts">
	import { page } from "$app/state";
	import UserProfilePage from "$lib/features/profile/pages/UserProfilePage.svelte";
	import UserPortfolioService from "$lib/features/profile/services/UserPortfolioService";
	import UserService from "$lib/features/profile/services/UserService";
	import appApi from "$lib/utils/apis/appApi";

	const api = appApi;

	const {username} = page.params;

</script>

{#if username} 
<UserProfilePage username={username} userService={new UserService(api)} userPortfolioService={new UserPortfolioService(api)}/>
{:else}
	<h1>404</h1>
{/if}