<script lang="ts">
    import Icon from "@iconify/svelte";
    let {contributions = []}: {contributions: {date: Date, message: string, repo: string}[]} = $props();
</script>

<div class="activity-stream">
    {#if contributions.length === 0}
        <div class="empty-state">
            <p>No activity yet.</p>
        </div>
    {/if}

    {#each contributions as contrib}
        <article class="activity-item">
            <div class="event-meta">
                <div class="event-meta-left">
                    <Icon icon="solar:calendar-linear" class="event-icon" />
                    <span class="event-date">{contrib.date.toDateString()}</span>
                </div>
                <span class="event-repo">
                    <Icon icon="solar:folder-linear" class="event-icon repo-icon" />
                    {contrib.repo}
                </span>
            </div>
            <p class="event-message">{contrib.message}</p>
        </article>
    {/each}
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