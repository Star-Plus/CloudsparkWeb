<script lang="ts">
	import { AuthContext, setAuthContext } from "$lib/features/auth/AuthContext.svelte";
	import AuthService from "$lib/features/auth/AuthService";
	import DrivePage from "$lib/features/drive/pages/DrivePage.svelte";
	import CreditService from "$lib/features/drive/services/CreditService";
	import DriveStorageService from "$lib/features/drive/services/DriveStorageService";
	import { DriveStorageContext, setDriveStorageContext } from "$lib/features/drive/contexts/DriveStorageContext.svelte";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";
	import Playground from "$lib/features/drive/agents/Playground.svelte";

	const authContext = new AuthContext(useMock<AuthService>(new AuthService(appApi)));
	const driveContext = new DriveStorageContext(useMock<DriveStorageService>(new DriveStorageService(appApi)));
	setAuthContext(authContext);
	setDriveStorageContext(driveContext);

</script>

<svelte:head>
	<title>CloudsPark - Drive</title>
</svelte:head>

<Playground />

<DrivePage 
	creditService={useMock<CreditService>(new CreditService(appApi))} 
/>