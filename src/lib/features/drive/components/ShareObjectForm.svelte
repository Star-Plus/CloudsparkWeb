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
        permissionRoles: {
            canShare: false,
            canWrite: false,
            canRead: false,
            canPreview: false
        }
    });

    let response = $state<ShareVaultObjectResponse|null>(null);

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
            permissionRoles: {
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
        validator.feed("permissionRoles", shareRequestPayload!.permissionRoles);
    })

    $effect(() => {
        switch (permissionRoleSelection) {
            case "share":
                shareRequestPayload!.permissionRoles = {
                    canShare: true,
                    canWrite: false,
                    canRead: false,
                    canPreview: false
                };
                break;
            case "write":
                shareRequestPayload!.permissionRoles = {
                    canShare: false,
                    canWrite: true,
                    canRead: false,
                    canPreview: false
                };
                break;
            case "preview":
                shareRequestPayload!.permissionRoles = {
                    canShare: false,
                    canWrite: false,
                    canRead: false,
                    canPreview: true
                };
                break;
            default:
                shareRequestPayload!.permissionRoles = {
                    canShare: false,
                    canWrite: false,
                    canRead: true,
                    canPreview: false
                };
        }
    })
</script>

{#if response}
    {#if response.state == TransferState.LOADING}
        <p>Loading...</p>
    {:else if response.state == TransferState.SUCCESS}
        <p>{response.payload}</p>
    {:else}
        <p>{response.error}</p>
    {/if}
{:else}

<form onsubmit={handleOnSubmit}>
    <p>Share "{objectPath.split("/").pop()}"</p>
    <input bind:value={shareRequestPayload!.shareWith} type="text" placeholder="Share with">

    <select bind:value={permissionRoleSelection}>
        <option value="share">Share</option>
        <option value="write">Write</option>
        <option value="read">Read</option>
        <option value="preview">Take a look</option>
    </select>

    {#if validator.isValid }
        <button onclick={handleOnSubmit}>Share</button>
    {/if}
</form>
{/if}