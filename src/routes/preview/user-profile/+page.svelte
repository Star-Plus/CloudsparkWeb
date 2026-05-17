<script>
	import UserProfilePage from "$lib/features/profile/pages/UserProfilePage.svelte";
	import UserService from "$lib/features/profile/services/UserService";
	import { useMock } from "$lib/utils/mock/useMock";

</script>

<UserProfilePage userService={useMock(new UserService())} />