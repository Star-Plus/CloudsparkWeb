<script lang="ts">
	import UserProfilePage from "$lib/features/profile/pages/UserProfilePage.svelte";
	import UserPortfolioService from "$lib/features/profile/services/UserPortfolioService";
	import UserService from "$lib/features/profile/services/UserService";
	import appApi from "$lib/utils/apis/appApi";

	const api = appApi;

</script>

<UserProfilePage userService={new UserService(api)} userPortfolioService={new UserPortfolioService(api)} />