<script lang="ts">

    import { page } from "$app/stores";
    import type Repository from "$lib/features/repos/Repository";
    import RepositoryStore from "$lib/features/repos/RepositoryStore";
    import type { FileUnit } from "$lib/utils/fs/FsInfo";
    import FsInfo from "$lib/utils/fs/FsInfo";
    import FileIconMapper from "$lib/utils/mappers/FileIconMapper";
    import Icon from "@iconify/svelte";
    import StatusService from "../status/StatusService";
    import type FileStatus from "../status/FileStatus";
    import { StatusMapper } from "../status/STATUS";
    import IgnoreApi from "../ignore/IgnoreApi";
    import { openUvWindow } from "$lib/utils/ultraviolet/uvWebView";

    let repoId = $page.params.repoId;

    let repo: Repository | null = $state(null);
    let dirContents: FileUnit[] = $state([]);
    let fileStatuses: Map<string, FileStatus> = $state(new Map());
    let navigationPath: string = $state("");

    let navigationStack: string[] = $state([]);

    let loadingState : string | null = $state("loading");


    // Cache Region
    let cache: {
        [key: string]: {
            contents: FileUnit[];
            statuses: Map<string, FileStatus>;
        }
    } = {};


    async function renderFiles(){
        if (!repoId) {
            console.error("No repository ID provided in route parameters.");
            return;
        }

        const repoStore = RepositoryStore.getInstance();
        repo = repoStore.getRepository(repoId) || null;
        
        if (!repo) {
            console.error("Repository not found for ID:", repoId);
            return;
        }

        loadingState = "Reading repository contents...";

        if (cache[navigationPath]) {
            dirContents = cache[navigationPath].contents;
            fileStatuses = cache[navigationPath].statuses;
            loadingState = null;
            return;
        }

        dirContents = await FsInfo.getDirectoryDirectContents(repo.path + navigationPath);

        loadingState = "Filtering ignored files...";

        // Filter out ignored files and directories
        const filteredContents: FileUnit[] = [];
        for (const unit of dirContents) {
            if (unit.path) {
                const relativePath = unit.path.replace(repo.path + '/', '');
                const isIgnored = await IgnoreApi.isIgnored(repo.getId, relativePath);
                if (!isIgnored) {
                    filteredContents.push(unit);
                }
            } else {
                filteredContents.push(unit);
            }
        }
        dirContents = filteredContents;

        cache[navigationPath] = {
            contents: dirContents,
            statuses: new Map()
        };

        loadingState = "Fetching file statuses...";

        const statuses = await StatusService.getStatus(
            repo.path,
            dirContents.filter(unit => unit.isDirectory === false).map(unit => {
                const prefix = navigationPath === "" ? "" : navigationPath.substring(1) + "/";
                return prefix + unit.name;
            })
        );

        loadingState = "Mapping file statuses...";

        fileStatuses = new Map(statuses.map(status => {
            const prefix = navigationPath === "" ? "" : navigationPath.substring(1) + "/";
            const relativeName = status.name.startsWith(prefix) ? status.name.substring(prefix.length) : status.name;
            return [relativeName, status];
        }));

        cache[navigationPath].statuses = fileStatuses;

        loadingState = null;
    }

    $effect(() => {
        renderFiles();
    });

    function handleFileClick(unit: FileUnit) {
        if (unit.isDirectory) {
            navigationStack.push(navigationPath);
            navigationPath += "/" + unit.name;
        } else {
            openUvWindow(repo!.path + navigationPath + "/" + unit.name);
        }
    }

    function goBack() {
        if (navigationStack.length > 0) {
            navigationPath = navigationStack.pop()!;
        }
    }

</script>

<div class="file-browser-workspace">

    <div class="nav-bar">
        <!-- svelte-ignore event_directive_deprecated -->
        <button 
            on:click={goBack} 
            disabled={navigationStack.length === 0} 
            class="back-btn"
            title="Go Back"
        >
            <Icon icon="system-uicons:wrap-back" />
        </button>

        <div class="path-display">
            {repo?.shortName} <span class="path-separator">/</span> {navigationPath || "root"}
        </div>
    </div>

    {#if loadingState}

        <div class="text-txt-muted text-center w-full py-10 sm:p-10">{loadingState}</div>

    {:else}

        {#if dirContents.length === 0}
            <div class="text-txt-muted text-center w-full py-10 sm:p-10">This directory is empty.</div>
        {:else}

            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-3 sm:gap-4 justify-center">
                {#each dirContents as unit}
                <!-- svelte-ignore event_directive_deprecated -->
                <button class="flex w-full max-w-28 min-w-20 aspect-square flex-col items-center gap-2 hover:bg-neutral-700 p-3 sm:p-4 rounded-lg transition-colors cursor-pointer" on:click={() => handleFileClick(unit)}>
                    <div class="relative">
                        <p class="text-txt-muted text-5xl"><Icon icon={FileIconMapper.getFileIcon(unit)} /></p>
                        
                        {#if fileStatuses.has(unit.name)}
                            <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full {StatusMapper.getStatusColor(fileStatuses.get(unit.name)!.status)}" title="{fileStatuses.get(unit.name)!.status}"></div>
                        {/if}
                    </div>
        
                    <span class="text-txt-muted text-sm overflow-hidden text-ellipsis whitespace-nowrap w-full">{unit.name}</span>
                </button>
                {/each}
            </div>
            
        {/if}

    {/if}

</div>

<style>
    .file-browser-workspace {
        display: flex;
        flex-direction: column;
        padding: 2rem;
        flex: 1;
        overflow-y: auto;
    }

    .nav-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 1.25rem;
        background: #1c1c1c;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.75rem;
        margin-bottom: 2rem;
    }

    .back-btn {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .back-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
        color: white;
    }

    .back-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .path-display {
        font-family: 'Jost', sans-serif;
        font-size: 0.8125rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.4);
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }

    .path-separator {
        margin: 0 0.5rem;
        opacity: 0.3;
    }
</style>