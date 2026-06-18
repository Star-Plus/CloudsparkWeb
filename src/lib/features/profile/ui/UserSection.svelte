<script lang="ts">
    import Icon from "@iconify/svelte";
	import type UserProfileResponse from "../services/dtos/UserProfileResponse";
	import type { UserProfilePayload } from "../services/dtos/UserProfileResponse";
	import { ResponseState } from "$lib/utils/models/Response";

    let {userProfileResponse} : {userProfileResponse: UserProfileResponse} = $props();
    
    const userProfile : UserProfilePayload | null = $derived(
        userProfileResponse.state == ResponseState.SUCCESS ? userProfileResponse.payload : null
    )
</script>

{#if userProfile}

<div class="xl:size-72 lg:size-48 md:size-80 rounded-full overflow-hidden outline-background-300 outline-2 z-2">
    <img src={userProfile.avatarUrl} alt="User PP">
</div>
<h1 class="font-extrabold text-4xl z-3">{userProfile.fullName}</h1>

<p class="text-text-700">@{userProfile.username}</p>

<!-- Followers and Following -->
<div class="flex gap-4 text-lg font-semibold">
    <p>{userProfile.followers} Followers</p>
    <p>{userProfile.following} Following</p>
</div>

<!-- Bio -->
{#if userProfile.bio}
<div class="max-w-full">
    <p class="text-text-700">
        {userProfile.bio}
    </p>
</div>
{/if}

<!-- Social Media -->
<div class="flex gap-4 text-3xl mt-4">
    {#if userProfile.twitterUrl}
    <a href={userProfile.twitterUrl} target="_blank">
        <Icon icon="mynaui:twitter" />
    </a>
    {/if}
    {#if userProfile.linkedinUrl}
    <a href={userProfile.linkedinUrl} target="_blank">
        <Icon icon="mynaui:linkedin" />
    </a>
    {/if}
    {#if userProfile.websiteUrl}
    <a href={userProfile.websiteUrl} target="_blank">
        <Icon icon="mynaui:planet" />
    </a>
    {/if}
</div>

{/if}