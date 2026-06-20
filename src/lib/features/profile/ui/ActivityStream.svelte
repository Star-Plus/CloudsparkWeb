<script lang="ts">
    import Icon from "@iconify/svelte";
	import type ContributionActivityStreamDto from "../dtos/ContributionActivityStream";
	import { TransferState } from "$lib/utils/models/BaseDTO";
	import type { ActivityStreamPayload } from "../dtos/ContributionActivityStream";

    let {activityStream} : {activityStream: ContributionActivityStreamDto} = $props();
    let contributionsPages = $state<ActivityStreamPayload[]>([]);

    $effect(() => {
        if (activityStream.state == TransferState.SUCCESS) {
            if (contributionsPages.find(c => c.page === activityStream.payload!.page) === undefined) {
                contributionsPages.push(activityStream.payload!);
            }
        }
    })

</script>

<div class="activity-stream">
    {#if contributionsPages.length === 0}
        <div class="empty-state">
            <p>No activity yet.</p>
        </div>
    {/if}

    <phantom-ui loading={activityStream.state == TransferState.LOADING} reveal={0.5}>
    {#each contributionsPages as page}
        {#each page.commits as contrib}
            <article class="activity-item">
                <div class="event-meta">
                    <div class="event-meta-left">
                        <Icon icon="mynaui:calendar" class="event-icon" />
                        <span class="event-date">
                            {contrib.timestamp.toLocaleDateString()} {contrib.timestamp.toLocaleTimeString()}
                        </span>
                    </div>
                    <span class="event-repo">
                        <Icon icon="mynaui:folder" class="event-icon repo-icon" />
                        {contrib.remote}
                    </span>
                </div>
                <p class="event-message">{contrib.message}</p>
            </article>
        {/each}
    {/each}
    </phantom-ui>
</div>

<style>
    .activity-stream {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: var(--color-background-100);
        border: 1px solid var(--color-background-200);
        border-radius: var(--radius-box);
        padding: 1rem;
    }

    .activity-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--color-background-50);
        border: 1px solid var(--color-background-200);
        border-radius: calc(var(--radius-box) - 0.1rem);
        transition: background 0.2s ease, transform 0.2s ease;
    }

    .activity-item:hover {
        background: var(--color-background-50);
        transform: translateY(-1px);
    }

    .event-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
        color: var(--color-text-700);
        font-size: 0.95rem;
    }

    .event-meta-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .event-date {
        font-weight: 600;
        color: var(--color-text-900);
    }

    .event-repo {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--color-background-200);
        padding: 0.3rem 0.65rem;
        border-radius: 999px;
        font-size: 0.85rem;
        color: var(--color-text-700);
    }

    .event-message {
        margin: 0;
        color: var(--color-text-900);
        line-height: 1.55;
    }

    .empty-state {
        padding: 1rem;
        text-align: center;
        color: var(--color-text-700);
        border: 1px dashed var(--color-background-200);
        border-radius: calc(var(--radius-box) - 0.1rem);
        background: var(--color-background-50);
    }
</style>