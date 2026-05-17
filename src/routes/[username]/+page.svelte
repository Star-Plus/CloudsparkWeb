<script>
	import UserProfilePage from "$lib/features/profile/pages/UserProfilePage.svelte";
	import UserService from "$lib/features/profile/services/UserService";

</script>
<UserProfilePage userService={new UserService()} />