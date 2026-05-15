<script>
	import ContributionMap from "$lib/features/profile/ui/ContributionMap.svelte";
	import RepoCard from "$lib/features/profile/ui/RepoCard.svelte";
	import Icon from "@iconify/svelte";

    let repos = [1,1,1,1,1,1]

</script>

<svelte:head>
    <title>starsaif (SAIF STAR)</title>
</svelte:head>

<div class="grid pt-6 grid-cols-3 grid-rows-2 px-12 gap-2">
    <!-- User Information -->
    <section class="w-full flex items-start flex-col gap-3 row-span-2 col-span-1">
    
        
        <div class="size-72 rounded-full overflow-hidden outline-background-300 outline-2 z-2">
            <img src="https://res.cloudinary.com/dyzxhzd5h/image/upload/q_auto/f_auto/v1778804360/OUR_CEO_u9agfa.png" alt="User PP">
        </div>
        <h1 class="font-extrabold text-4xl z-3">SAIF STAR</h1>
    
        <p class="text-text-700">@starsaif</p>
    
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
        <h2 class="text-xl mb-3 font-semibold">Contributions</h2>
        <h3 class="text-lg mb-2">Last 365 days</h3>
        <ContributionMap />
    </section>

</div>