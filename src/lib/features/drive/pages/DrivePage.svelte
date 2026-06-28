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
    import path from "path-browserify";
    
    let {creditService, driveStorageService, authService} : 
    {creditService: CreditService, driveStorageService: DriveStorageService, authService: AuthService} = $props();

    let creditsInfo = $state<CreditsInfoDto>(new CreditsInfoDto());
    let rootSelfPathContens = $state<PathObjectDto>(new PathObjectDto());
    
    let user = $derived(authService.getUser());

    onMount(() => {
        creditService.fetchCredits("aejkatappaja").then((dto) => (creditsInfo = dto));
        driveStorageService.fetchPathContents(`${user?.username}/vault`).then((dto) => {
            rootSelfPathContens = dto;
            VisitedPaths.getInstance().expand(dto.payload!);
        });
    })

    async function expandPath(nestedPath: string) : Promise<DirObject> {
        const cached = VisitedPaths.getInstance().getPathObject(nestedPath);
        if (cached) return cached;

        const jointPath = path.join(`${user?.username}/vault`, nestedPath);

        let resp = await driveStorageService.fetchPathContents(jointPath);
        if (resp.error) throw resp.error;

        VisitedPaths.getInstance().expand(resp.payload!);

        return resp.payload!;
    }

</script>
<div class="h-full flex">
    <aside class="w-fit h-full border-r border-neutral-300 pr-6 pt-8">
        <DriveSidebar {creditsInfo} >
        {#if rootSelfPathContens.payload}
            <MiniFileExplorer root={rootSelfPathContens.payload!} expandPath={expandPath} />
        {/if}
        </DriveSidebar>
    </aside>
</div>