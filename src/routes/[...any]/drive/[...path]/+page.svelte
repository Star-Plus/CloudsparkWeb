<script lang="ts">
	import { AuthContext, setAuthContext } from "$lib/features/auth/AuthContext.svelte";
	import AuthService from "$lib/features/auth/AuthService";
	import DrivePage from "$lib/features/drive/pages/DrivePage.svelte";
	import CreditService from "$lib/features/drive/services/CreditService";
	import DriveStorageService from "$lib/features/drive/services/DriveStorageService";
	import { DriveStorageContext, setDriveStorageContext } from "$lib/features/drive/contexts/DriveStorageContext.svelte";
	import appApi from "$lib/utils/apis/appApi";
	import ProtectedRoute from "$lib/features/auth/ProtectedRoute.svelte";

	const authContext = new AuthContext(new AuthService(appApi));
	const driveContext = new DriveStorageContext(new DriveStorageService(appApi));
	setAuthContext(authContext);
	setDriveStorageContext(driveContext);

</script>

<ProtectedRoute>
	<DrivePage 
		creditService={new CreditService(appApi)} 
	/>
</ProtectedRoute>