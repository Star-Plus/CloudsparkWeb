<script lang="ts">
	import DrivePage from "$lib/features/drive/pages/DrivePage.svelte";
	import CreditService from "$lib/features/drive/services/CreditService";
	import DriveStorageService from "$lib/features/drive/services/DriveStorageService";
	import { DriveStorageContext, setDriveStorageContext } from "$lib/features/drive/contexts/DriveStorageContext.svelte";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";
	import SimulationTaskButton from "$lib/features/drive/testing/SimulationTaskButton.svelte";

	const driveContext = new DriveStorageContext(useMock<DriveStorageService>(new DriveStorageService(appApi)));

	setDriveStorageContext(driveContext);
</script>

<DrivePage 
	creditService={useMock<CreditService>(new CreditService(appApi))} 
/>

<SimulationTaskButton />