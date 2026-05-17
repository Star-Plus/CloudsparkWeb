<script lang="ts">
	import ActivityStream from "$lib/features/profile/ui/ActivityStream.svelte";
	import ContributionMap from "$lib/features/profile/ui/ContributionMap.svelte";
	import RepoCard from "$lib/features/profile/ui/RepoCard.svelte";
	import type UserService from "$lib/features/profile/services/UserService";
	import Icon from "@iconify/svelte";

    let {userService}: {userService: UserService} = $props();

    let repos = [1,1,1,1,1,1]

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

</script>

<svelte:head>
    <title>starsaif (SAIF STAR)</title>
</svelte:head>

<div class="grid py-6 lg:grid-cols-3 grid-cols-1 2xl:px-70 xl:px-40 lg:px-26 md:px-10 px-4 gap-5">
    <!-- User Information -->
    <section class="w-full flex lg:items-start items-center flex-col gap-3 row-span-2 col-span-1">
    
        
        <div class="xl:size-72 lg:size-48 md:size-80 rounded-full overflow-hidden outline-background-300 outline-2 z-2">
            <img src="https://res.cloudinary.com/dyzxhzd5h/image/upload/q_auto/f_auto/v1778804360/OUR_CEO_u9agfa.png" alt="User PP">
        </div>
        <h1 class="font-extrabold text-4xl z-3">SAIF STAR</h1>
    
        <p class="text-text-700">@starsaif</p>

        <div class="flex gap-4 text-lg font-semibold text-text-700">
            <p>Joined May 2022</p>
        </div>
    
        <!-- Followers and Following -->
        <div class="flex gap-4 text-lg font-semibold">
            <p>20k Followers</p>
            <p>20k Following</p>
        </div>
    
        <!-- Bio -->
        <div class="max-w-full">
            <p class="text-text-700">
                I'm the light and energy of a star. But unlike the sun, I can observe my own shadow. 
            </p>
        </div>
    
        <!-- Social Media -->
        <div class="flex gap-4 text-3xl mt-4">
            <a href="https://github.com/starsaif">
                <Icon icon="mynaui:github" />
            </a>
            <a href="https://twitter.com/starsaif">
                <Icon icon="mynaui:twitter" />
            </a>
            <a href="https://www.linkedin.com/in/starsaif">
                <Icon icon="mynaui:linkedin" />
            </a>    
        </div>
    </section>
    
    
    <!-- User Repos -->
    <section class="col-span-2 flex flex-col gap-2">
        <h2 class="text-xl font-semibold">Repositories</h2>
        {#each repos as repo}
            <RepoCard />
        {/each}
        
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