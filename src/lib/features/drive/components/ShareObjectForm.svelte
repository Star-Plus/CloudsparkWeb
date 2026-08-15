<script lang="ts">
	import { onMount } from "svelte";
	import { ShareVaultObjectRequest, type ShareVaultObjectPayload } from "../dtos/ShareVaultObjectRequest";
	import ShareVaultObjectValidator from "../validators/ShareVaultObjectValidator";
	import { getDriveStorageContext } from "../contexts/DriveStorageContext.svelte";
	import { ShareVaultObjectResponse } from "../dtos/ShareVaultObjectResponse";
	import { TransferState } from "$lib/utils/models/BaseDTO.svelte";


    let {objectPath, onClose} : {objectPath: string, onClose: () => void} = $props();

    const driveStorageService = getDriveStorageContext().service;

    const validator = new ShareVaultObjectValidator();

    let shareRequest = $state<ShareVaultObjectRequest>(new ShareVaultObjectRequest());
    let permissionRoleSelection = $state("read");
    let shareRequestPayload = $state<ShareVaultObjectPayload>({
        objectPath: "",
        shareWith: "",
        permissions: {
            canShare: false,
            canWrite: false,
            canRead: false,
            canPreview: false
        }
    });

    let response = $state<ShareVaultObjectResponse|null>(null);

    const permissionOptions = [
        { value: "preview", label: "Take a look", hint: "Can preview only", icon: "gallery_thumbnail" },
        { value: "read", label: "Read", hint: "Can view and download", icon: "visibility" },
        { value: "write", label: "Write", hint: "Can edit contents", icon: "edit" },
        { value: "share", label: "Share", hint: "Can invite others", icon: "group_add" },
    ];

    async function handleOnSubmit(e: Event) {
        e.preventDefault();

        response = new ShareVaultObjectResponse();

        const data = validator.serialize<ShareVaultObjectPayload>();
        shareRequest.setPayload(data);

        response = await driveStorageService.shareObject(shareRequest);

        if (response.state == TransferState.SUCCESS) {
            setTimeout(() => {
                response = null;
                onClose();
            }, 3000);
        }
    }

    onMount(() => {
        shareRequestPayload = {
            objectPath: objectPath,
            shareWith: "",
            permissions: {
                canShare: false,
                canWrite: false,
                canRead: true,
                canPreview: false
            }
        };
        permissionRoleSelection = "read";
    })

    $effect(() => {
        validator.feed("shareWith", shareRequestPayload!.shareWith);
        validator.feed("objectPath", shareRequestPayload!.objectPath);
        validator.feed("permissions", shareRequestPayload!.permissions);
    })

    $effect(() => {
        switch (permissionRoleSelection) {
            case "share":
                shareRequestPayload!.permissions = {
                    canShare: true,
                    canWrite: false,
                    canRead: false,
                    canPreview: false
                };
                break;
            case "write":
                shareRequestPayload!.permissions = {
                    canShare: false,
                    canWrite: true,
                    canRead: false,
                    canPreview: false
                };
                break;
            case "preview":
                shareRequestPayload!.permissions = {
                    canShare: false,
                    canWrite: false,
                    canRead: false,
                    canPreview: true
                };
                break;
            default:
                shareRequestPayload!.permissions = {
                    canShare: false,
                    canWrite: false,
                    canRead: true,
                    canPreview: false
                };
        }
    })
</script>

<div class="w-90 flex flex-col gap-4 bg-background-50 rounded-sm p-5">

    {#if response}
        <div class="flex flex-col items-center gap-3 py-6 text-center">
            {#if response.state == TransferState.LOADING}
                <span class="material-symbols-rounded animate-spin text-3xl text-text-500">progress_activity</span>
                <p class="text-text-600">Sharing…</p>
            {:else if response.state == TransferState.SUCCESS}
                <span class="material-symbols-rounded text-3xl text-primary-500">check_circle</span>
                <p class="text-text-900">{response.payload}</p>
            {:else}
                <span class="material-symbols-rounded text-3xl text-red-500">error</span>
                <p class="text-text-900">{response.error}</p>
            {/if}
        </div>
    {:else}

    <div class="flex flex-col gap-1">
        <h3 class="font-medium text-text-900">Share file</h3>
        <p class="text-sm text-text-600 truncate">{objectPath.split("/").pop()}</p>
    </div>

    <form class="flex flex-col gap-4" onsubmit={handleOnSubmit}>

        <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-text-700">Share with</span>
            <input
                bind:value={shareRequestPayload!.shareWith}
                type="text"
                placeholder="Email or username"
                class="w-full px-3 py-2 rounded-sm border-2 border-background-200 bg-background-50 text-text-900 placeholder:text-text-500 outline-none focus:border-primary-400 transition-colors"
            >
        </label>

        <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-text-700">Permission</span>
            <div class="flex flex-col gap-1.5">
                {#each permissionOptions as option}
                <label
                    class="flex items-center gap-3 px-3 py-2 rounded-sm border-2 cursor-pointer transition-colors {permissionRoleSelection === option.value
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-background-200 hover:bg-background-100'}"
                >
                    <input
                        type="radio"
                        name="permission"
                        value={option.value}
                        bind:group={permissionRoleSelection}
                        class="accent-primary-500"
                    >
                    <span class="material-symbols-rounded text-lg {permissionRoleSelection === option.value ? 'text-primary-600' : 'text-text-500'}">
                        {option.icon}
                    </span>
                    <span class="flex flex-col">
                        <span class="text-sm font-medium text-text-900">{option.label}</span>
                        <span class="text-xs text-text-500">{option.hint}</span>
                    </span>
                </label>
                {/each}
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
            <button
                type="button"
                onclick={onClose}
                class="px-4 py-2 rounded-sm text-text-700 hover:bg-background-100 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={!validator.isValid}
                class="px-4 py-2 rounded-sm bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:bg-background-200 disabled:text-text-500 disabled:cursor-not-allowed transition-colors"
            >
                Share
            </button>
        </div>

    </form>
    {/if}

</div>