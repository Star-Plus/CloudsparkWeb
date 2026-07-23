<script lang="ts">
	import { onMount } from "svelte";
	import { CreditsInfoDto } from "../dtos/CreditsInfo";
	import type CreditService from "../services/CreditService";
	import DriveSidebar from "../ui/DriveSidebar.svelte";
	import { PathObjectDto, type DirObject } from "../dtos/DirObject";
	import VisitedPaths from "../stores/VisitedPaths.svelte";
	import MiniFileExplorer from "../ui/MiniFileExplorer.svelte";
	import FileExplorer from "../components/FileExplorer.svelte";
	import { getDriveStorageContext } from "../contexts/DriveStorageContext.svelte";
	import { getAuthContext } from "$lib/features/auth/AuthContext.svelte";
	import ExplorerHeader from "../ui/ExplorerHeader.svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { TransferState } from "$lib/utils/models/BaseDTO.svelte";
    
    let {creditService} : 
    {creditService: CreditService} = $props();

    let owner = $derived(page.params.path?.split("/")[0] || "");

    const driveStorageService = getDriveStorageContext().service;
    const authService = getAuthContext().service;

    let creditsInfo = $state<CreditsInfoDto>(new CreditsInfoDto());
    let rootSelfPathContens = $state<PathObjectDto>(new PathObjectDto());
    
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

</script>

<svelte:head>
	<title>Euler - Drive</title>
</svelte:head>

<div class="h-full flex">
    <aside class="w-fit h-full border-r border-background-300 px-6 pt-8 bg-background-100">
        <DriveSidebar {creditsInfo}>
        {#if rootSelfPathContens.payload}
            <MiniFileExplorer root={rootSelfPathContens.payload!} expandPath={openPath} />
        {/if}
        </DriveSidebar>
    </aside>

    <div class="h-full flex-1 p-8 relative">
        <ExplorerHeader />
        <FileExplorer openFolder={openPath} />
    </div>
</div>