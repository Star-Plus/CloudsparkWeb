<script lang="ts">
	import { onMount } from "svelte";
	import { CreditsInfoDto } from "../dtos/CreditsInfo";
	import type CreditService from "../services/CreditService";
	import DriveSidebar from "../ui/DriveSidebar.svelte";
	import { PathObjectDto, type DirObject } from "../dtos/DirObject";
	import type DriveStorageService from "../services/DriveStorageService";
	import type AuthService from "$lib/features/auth/AuthService";
	import VisitedPaths from "../stores/VisitedPaths.svelte";
	import MiniFileExplorer from "../ui/MiniFileExplorer.svelte";
	import FileExplorer from "../ui/FileExplorer.svelte";
    
    let {creditService, driveStorageService, authService} : 
    {creditService: CreditService, driveStorageService: DriveStorageService, authService: AuthService} = $props();

    let creditsInfo = $state<CreditsInfoDto>(new CreditsInfoDto());
    let rootSelfPathContens = $state<PathObjectDto>(new PathObjectDto());
    
    let user = $derived(authService.getUser());

    onMount(() => {
        creditService.fetchCredits("aejkatappaja").then((dto) => (creditsInfo = dto));
        driveStorageService.fetchPathContents(`${user?.username}`).then((dto) => {
            rootSelfPathContens = dto;
            VisitedPaths.getInstance().expand(dto.payload!);
        });
    })

    async function openPath(subpath: string) : Promise<DirObject> {
        const cached = VisitedPaths.getInstance().getPathObject(subpath);
        if (cached) return cached;

        let resp = await driveStorageService.fetchPathContents(`${user?.username}${subpath}`);
        if (resp.error) throw resp.error;

        VisitedPaths.getInstance().expand(resp.payload!);
        return resp.payload!;
    }

</script>
<div class="h-full flex">
    <aside class="w-fit h-full border-r border-neutral-300 px-6 pt-8 bg-background-100">
        <DriveSidebar {creditsInfo} >
        {#if rootSelfPathContens.payload}
            <MiniFileExplorer root={rootSelfPathContens.payload!} expandPath={openPath} />
        {/if}
        </DriveSidebar>
    </aside>

    <div class="h-full flex-1 p-8">
        <FileExplorer openFolder={openPath} />
    </div>
</div>