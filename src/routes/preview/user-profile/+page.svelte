<script>
	import UserProfilePage from "$lib/features/profile/pages/UserProfilePage.svelte";
	import UserService from "$lib/features/profile/services/UserService";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";

	const api = appApi;

</script>

<UserProfilePage userService={useMock(new UserService(api))} />