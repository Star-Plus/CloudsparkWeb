<script lang="ts">
	import ActivityStream from "$lib/features/profile/ui/ActivityStream.svelte";
	import ContributionMap from "$lib/features/profile/ui/ContributionMap.svelte";
	import RepoCard from "$lib/features/profile/ui/RepoCard.svelte";
	import type UserService from "$lib/features/profile/services/UserService";
	import UserProfileResponse from "../dtos/UserProfileResponse";
	import { onMount } from "svelte";
	import UserSection from "../ui/UserSection.svelte";
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import { page } from "$app/state";
	import type UserPortfolioService from "../services/UserPortfolioService";
	import RepositoryDTO from "../dtos/RepositoryResponse";

    let {userService, userPortfolioService}: {userService: UserService, userPortfolioService: UserPortfolioService} = $props();
    let {params} = page;
    
    let endDate = new Date();
    let startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
    
    const contributions : {date: Date, amount: number}[] = []
    for (let i = 0; i < 365; i++) {
        contributions.push({
            date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i),
            amount: Math.random() * 0.5
        })
    }
    
    const contributionActivities : {date: Date, message: string, repo: string}[] = []
    for (let i = 0; i < 10; i++) {
        contributionActivities.push({
            date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i),
            message: "Added a new feature",
            repo: "starsaif/starsaif"
        })
    }
    
    let userProfileResponse = $state<UserProfileResponse>(new UserProfileResponse());
    let repos = $state<RepositoryDTO>(new RepositoryDTO());

    onMount(()=> {
        if (!params.username) return;

        userService.getProfileByUsername(params.username).then(profile => {
            userProfileResponse = profile;
        })

        userPortfolioService.fetchUserCloudRepositories(params.username).then(profile => {
            repos = profile;
        })
    })

</script>

<svelte:head>
    {#if userProfileResponse.state == TransferState.SUCCESS}
    <title>{userProfileResponse.payload?.username} ({userProfileResponse.payload?.fullName})</title>
    {:else}
    <title>CloudSpark | Profile</title>
    {/if}
</svelte:head>

<div class="grid py-6 lg:grid-cols-3 grid-cols-1 2xl:px-70 xl:px-40 lg:px-26 md:px-10 px-4 gap-5">

    <!-- User Information -->
    <section class="w-full row-span-2 col-span-1">
        <UserSection {userProfileResponse} />
    </section>
    
    <!-- User Repos -->
    <section class="col-span-2 flex flex-col gap-2">
        <phantom-ui loading={repos.state == TransferState.LOADING} reveal={0.5}>
        <h2 class="text-xl font-semibold">Repositories</h2>
        {#each repos.payload as repo}
            <RepoCard {repo}/>
        {/each}
        </phantom-ui>
    </section>

    <!-- User Contributions -->
    <section class="col-span-2 row-span-1 mt-6">
        <h2 class="text-xl mb-6 font-semibold">Contributions</h2>

        <div class="flex flex-col gap-6">
            <div>
                <h3 class="mb-2 text-lg">Last 365 days - {contributions.length} contributions</h3>
                <ContributionMap {contributions}  />
            </div>
    
            <div class="grow">
                <h3 class="mb-2 text-lg">Activity Stream</h3>
                <ActivityStream contributions={contributionActivities} />
            </div>
        </div>

    </section>

</div>