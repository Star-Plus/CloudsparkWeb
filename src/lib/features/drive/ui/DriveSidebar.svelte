<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { CreditsInfoDto } from "../dtos/CreditsInfo";
	import { TransferState } from "$lib/utils/models/BaseDTO.svelte";

    let {creditsInfo, children} : 
    {creditsInfo: CreditsInfoDto, children: any} = $props();

    let properties = $derived(creditsInfo.state == TransferState.SUCCESS ? creditsInfo.payload : null);

    let consumedPercentage = $derived((properties?.consumedStorage ?? 0) / ( properties?.totalStorage ?? 0) * 100);
    let normalizedPercentage = $derived(Math.min(100, Math.max(0, consumedPercentage)));

</script>

{#if creditsInfo.state == TransferState.LOADING}

<p>Loading...</p>

{:else if creditsInfo.state == TransferState.SUCCESS}

<div class="flex flex-col gap-6 h-full bg-background-100">
    <div class="flex items-center">
        <div class="flex gap-2 items-center">
            <Icon icon="fluent:cloud-20-filled" class="text-xl" />
            <span class="text-lg font-semibold">Your drive</span>
        </div>

        <div class="ml-4 flex items-center gap-2">
            <span class="text-md">{consumedPercentage}%</span>
            <div
                class="relative size-4 overflow-hidden rounded-full border-2 border-background-900"
            >
                <div class="absolute inset-0.5 rounded-full bg-background" 
                style={`background: conic-gradient(var(--color-background-900) ${normalizedPercentage}%, transparent ${normalizedPercentage}% 100%);`}
                ></div>
            </div>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto">
        {@render children()}
    </div>

    <section class="flex flex-col gap-2 text-sm pb-6 text-text-600">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Use</a>

        <p class="text-text-900 font-medium border-t-2 pt-2 border-neutral-600">Copyright © {new Date().getFullYear()} All Rights Reserved </p>
    </section>
    
</div>

{:else}

<div>
    <p>{creditsInfo.error?.message}</p>
</div>

{/if}