<script lang="ts">
    import theme from "$lib/stores/ThemeStore";
    // @ts-ignore
    import { Color } from "color-alchemy";
    import { onMount } from "svelte";

    let { contributions = [] }: { contributions: { date: Date; amount: number }[] } = $props();

    const CELL = 12;
    const GAP = 4;
    const COL_W = CELL + GAP;
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    let rawColor = $state('');

    const startDate  = $derived(contributions.length ? new Date(contributions[0].date) : new Date());
    const startOffset = $derived(startDate.getDay());

    const monthLabels = $derived.by((): { label: string; col: number }[] => {
        if (!contributions.length) return [];

        const labels: { label: string; col: number }[] = [
            { label: MONTH_NAMES[startDate.getMonth()], col: 0 }
        ];

        contributions.forEach((c, i) => {
            if (i === 0) return;
            const d = new Date(c.date);
            if (d.getDate() === 1) {
                const col = Math.floor((i + startOffset) / 7);
                labels.push({ label: MONTH_NAMES[d.getMonth()], col });
            }
        });

        return labels;
    });

    const getContributionColor = (amount: number): string => {
        if (!rawColor) return 'transparent';
        const color = new Color(rawColor).desaturate((1 - amount) * 100);
        return $theme === 'dark'
            ? color.darken((1 - amount) * 40).toHex()
            : color.lighten((1 - amount) * 40).toHex();
    };

    const maxAmount = $derived(
        contributions.length ? Math.max(...contributions.map((c) => c.amount)) : 1
    );

    const daysContributions = $derived(
        contributions.map((c) => {
            const normalized = maxAmount > 0 ? c.amount / maxAmount : 0;
            return {
                color: getContributionColor(normalized),
                date: new Date(c.date),
                amount: c.amount,
            };
        })
    );

    onMount(() => {
        rawColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-primary-500')
            .trim();
    });
</script>

<div class="flex flex-col gap-1 text-xs text-gray-400 select-none overflow-x-auto overflow-y-hidden pb-2">

    <div class="flex gap-1">
        <div class="w-8"></div>
        <div class="relative h-4 flex-1">
            {#each monthLabels as { label, col }}
                <span class="absolute" style="left: {col * COL_W}px">{label}</span>
            {/each}
        </div>
    </div>

    <!-- Day labels + grid -->
    <div class="flex gap-1">

        <div class="grid grid-rows-7 gap-1 w-8">
            {#each DAY_LABELS as day, i}
                <span class="h-3 leading-3 text-left {i % 2 === 0 ? 'invisible' : ''}">
                    {day}
                </span>
            {/each}
        </div>

        <div class="grid grid-rows-7 grid-flow-col gap-0.75">
            {#each Array(startOffset) as _}
                <div class="size-3"></div>
            {/each}
            {#each daysContributions as contrib}
            <div class="relative contrib-cont">
                <div class="size-3 rounded-sm transition-colors duration-300" style="background-color: {contrib.color};"></div>
                <p class="absolute hidden bg-background-300 z-10 p-1 rounded-button top-0 left-1/2 transform -translate-x-1/2 -translate-y-[110%] text-xs text-text-950 contrib-info whitespace-nowrap">
                    {(contrib.amount * 100).toFixed(0)} contributions on {contrib.date.getDate()} {MONTH_NAMES[contrib.date.getMonth()]}
                </p>
            </div>
            {/each}
        </div>

    </div>
</div>

<style>
    .contrib-cont:hover .contrib-info {
        display: block;
    }

</style>