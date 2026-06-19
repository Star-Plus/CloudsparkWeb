<script lang="ts">
	import ActivityStream from "$lib/features/profile/ui/ActivityStream.svelte";
	import ContributionMap from "$lib/features/profile/ui/ContributionMap.svelte";
	import RepoCard from "$lib/features/profile/ui/RepoCard.svelte";
	import type UserService from "$lib/features/profile/services/UserService";
	import UserProfileResponse from "../dtos/UserProfileResponse";
	import { onMount } from "svelte";
	import UserSection from "../ui/UserSection.svelte";
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import type UserPortfolioService from "../services/UserPortfolioService";
	import RepositoryDTO from "../dtos/RepositoryResponse";
    import PeriodContributionDto from "../dtos/PeriodContribution";
	import ContributionActivityStreamDto from "../dtos/ContributionActivityStream";

    let {username, userService, userPortfolioService}: 
    {username: string, userService: UserService, userPortfolioService: UserPortfolioService} = $props();
    
    let endDate = new Date();
    let startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    let userInfoResponse = $state<UserProfileResponse>(new UserProfileResponse());
    let repos = $state<RepositoryDTO>(new RepositoryDTO());
    let contributionsCount = $state<PeriodContributionDto>(new PeriodContributionDto());
    let contributionsStream = $state<ContributionActivityStreamDto>(new ContributionActivityStreamDto());

    const contributions = $derived<{date: Date, amount: number}[]>(
        contributionsCount.state == TransferState.SUCCESS ? 
        (contributionsCount.payload?.counts.map((c, i) => 
            ({date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i), amount: c})) ?? [])
        : []
    )

    const activityStreamPageSize = 8;
    const activityStreamPage = $state<number>(0);

    onMount(()=> {
        if (!username) return;

        userService.getProfileByUsername(username).then(profile => {
            userInfoResponse = profile;
        })

        userPortfolioService.fetchUserCloudRepositories(username).then(profile => {
            repos = profile;
        })

        userPortfolioService.fetchUserContributionOverPeriod(username, startDate, endDate).then(profile => {
            contributionsCount = profile;
        })

        userPortfolioService.fetchUserActivityStream(username, activityStreamPageSize, activityStreamPage).then(profile => {
            contributionsStream = profile;
        })
    })

</script>

<svelte:head>
    {#if userInfoResponse.state == TransferState.SUCCESS}
    <title>{userInfoResponse.payload?.username} ({userInfoResponse.payload?.fullName})</title>
    {:else}
    <title>CloudSpark | Profile</title>
    {/if}
</svelte:head>

<div class="grid py-6 lg:grid-cols-3 grid-cols-1 2xl:px-70 xl:px-40 lg:px-26 md:px-10 px-4 gap-5">

    <!-- User Information -->
    <section class="w-full row-span-2 col-span-1">
        <UserSection userProfileResponse={userInfoResponse} />
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
                <ActivityStream activityStream={contributionsStream} />
            </div>
        </div>

    </section>

</div>