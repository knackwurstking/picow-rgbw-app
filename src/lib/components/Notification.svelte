<script>
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    /** @type {"info" | "warning" | "error"} */
    export let level;
    /** @type {string} */
    export let message;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={`notification ${level}`} on:click={() => dispatch("click")}>
    <div class="background" />
    <span class="message">{message}</span>
</div>

<style>
    .notification {
        position: relative;
        pointer-events: all;
        touch-action: auto;
        float: right;
        padding: var(--spacing);
        margin: var(--spacing);
        border-radius: var(--border-radius);
        border: 1px solid currentColor;
        width: fit-content;
        box-shadow: var(--card-box-shadow);
    }

    .notification .background {
        z-index: -1;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: var(--card-background-color);
    }

    .info {
        color: var(--card-color);
    }

    .warning {
        /*
        --card-box-shadow: 0.0145rem 0.029rem 0.174rem rgba(255, 208, 0, 0.01698),
            0.0335rem 0.067rem 0.402rem rgba(255, 208, 0, 0.024),
            0.0625rem 0.125rem 0.75rem rgba(255, 208, 0, 0.03),
            0.1125rem 0.225rem 1.35rem rgba(255, 208, 0, 0.036),
            0.2085rem 0.417rem 2.502rem rgba(255, 208, 0, 0.04302),
            0.5rem 1rem 6rem rgba(255, 208, 0, 0.06),
            0 0 0 0.0625rem rgba(255, 208, 0, 0.015);
        */
        color: rgb(255, 208, 0);
    }

    .error {
        /*
        --card-box-shadow: 0.0145rem 0.029rem 0.174rem rgba(255, 0, 0, 0.01698),
            0.0335rem 0.067rem 0.402rem rgba(255, 0, 0, 0.024),
            0.0625rem 0.125rem 0.75rem rgba(255, 0, 0, 0.03),
            0.1125rem 0.225rem 1.35rem rgba(255, 0, 0, 0.036),
            0.2085rem 0.417rem 2.502rem rgba(255, 0, 0, 0.04302),
            0.5rem 1rem 6rem rgba(255, 0, 0, 0.06),
            0 0 0 0.0625rem rgba(255, 0, 0, 0.015);
        */
        color: rgb(255, 0, 0);
    }
</style>
