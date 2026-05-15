<script lang="ts">
    // @ts-ignore
    import { Color } from "color-alchemy";
    import { onMount } from "svelte";
    import theme from "$lib/stores/ThemeStore";

    let startDate = new Date('2024-01-01');

    const totalDays = 365;
    const startOffset = startDate.getDay();

    let daysColor = $state<string[]>([]);

    function handleThemeChange(theme: string) {
        const raw = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-primary-500')
                .trim();
    
            const colors: string[] = [];
    
    
            for (let i = 0; i < totalDays; i++) {
                const amount = Math.random();
                
                const color = new Color(raw)
                    .desaturate((1 - amount) * 100);
    
    
                if (theme === 'dark') {
                    colors.push(color.darken((1 - amount) * 40)
                    .toHex())
                }
                else {
                    colors.push(color.lighten((1 - amount) * 40)
                    .toHex())
                }
            }
    
            daysColor = colors;
    }

    onMount(() => {
        handleThemeChange($theme);
        theme.subscribe(handleThemeChange);
        
    });
</script>

<div class="grid grid-rows-7 grid-flow-col gap-0.75 w-fit">

    {#each Array(startOffset) as _}
        <div class="size-3"></div>
    {/each}

    {#each daysColor as color}
        <div class="size-3 rounded-[3px]" style="background-color: {color};"></div>
    {/each}

</div>