<!-- +page.svelte (drive view) -->
<script lang="ts">
	import { onMount } from "svelte";
	import { CreditsInfoDto } from "../dtos/CreditsInfo";
	import type CreditService from "../services/CreditService";
	import DriveSidebar from "../ui/DriveSidebar.svelte";
	import { PathObjectDto } from "../dtos/DirObject";
	import VisitedPaths from "../stores/VisitedPaths.svelte";
	import MiniFileExplorer from "../components/MiniFileExplorer.svelte";
	import FileExplorer from "../components/FileExplorer.svelte";
	import { getDriveStorageContext } from "../contexts/DriveStorageContext.svelte";
	import { getAuthContext } from "$lib/features/auth/AuthContext.svelte";
	import ExplorerHeader from "../ui/ExplorerHeader.svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { TransferState } from "$lib/utils/models/BaseDTO.svelte";
	import RecentFiles from "../components/RecentFiles.svelte";
	import TaskBarSummary from "../components/TaskBarSummary.svelte";
	import TaskManagerView from "$lib/features/tasks/TaskManagerView.svelte";

    let {creditService} :
    {creditService: CreditService} = $props();

    let owner = $derived(page.params.path?.split("/")[0] || "");

    const driveStorageService = getDriveStorageContext().service;
    const authService = getAuthContext().service;

    let creditsInfo = $state<CreditsInfoDto>(new CreditsInfoDto());
    let rootSelfPathContens = $state<PathObjectDto>(new PathObjectDto());
    let taskViewOpen = $state(false);

    let user = $derived(authService.getUser());

    onMount(() => {

        onMount(() => {
            if (owner == "") {
                const user = authService.getUser();
                const current = page.url.pathname;
                goto(`${current}/${user?.username}`);
            }
        })

        creditService.fetchCredits(`${user?.username}`).then((dto) => (creditsInfo = dto));
        openPath(`${user?.username}`).then((dto) => {
            rootSelfPathContens = dto;
        });
    })

    async function openPath(path: string) : Promise<PathObjectDto> {
        try {
            if (path == "/" || path == "") path = `${user?.username}`;

            const cached = VisitedPaths.getInstance().getPathObject(path);
            if (cached) {
                const dto = new PathObjectDto();
                dto.setPayload(cached);
                return dto;
            }

            let resp = await driveStorageService.fetchPathContents(`${path}`);
            if (resp.state == TransferState.SUCCESS) {
                VisitedPaths.getInstance().expand(resp.payload!);
            }

            return resp;
        }
        catch (err) {
            throw err;
        }
    }

    function toggleTaskView() {
        taskViewOpen = !taskViewOpen;
    }

</script>

<svelte:head>
	<title>Euler - Drive</title>
</svelte:head>

<svelte:window onkeydown={(e) => e.key === "Escape" && (taskViewOpen = false)} />

<div class="h-full flex">
    <aside class="w-fit h-full border-r border-background-300 px-6 pt-8 bg-background-100">
        <DriveSidebar {creditsInfo}>
        {#if rootSelfPathContens.payload}
            <MiniFileExplorer root={rootSelfPathContens.payload!} expandPath={openPath} />
        {/if}
        </DriveSidebar>
    </aside>

    <div class="h-full flex-1 relative flex flex-col">
        <div class="flex-1 min-h-0 overflow-y-auto p-8">
            {#if taskViewOpen}
                <TaskManagerView />
            {:else}
                <ExplorerHeader />
                <RecentFiles />
                <FileExplorer openFolder={openPath} />
            {/if}
        </div>

        <div class="shrink-0 w-full py-3 px-9 border-t-2 border-background-200 relative z-50 flex items-center gap-4">
            <div class="flex-1">
                <TaskBarSummary />
            </div>
            <button
                onclick={toggleTaskView}
                class="shrink-0 text-sm font-medium text-background-900 whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-background-100 transition-colors"
            >
                {taskViewOpen ? "Back to files" : "View all"}
            </button>
        </div>
    </div>
</div>