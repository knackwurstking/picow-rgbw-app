<script>
    /**
     * @typedef Message
     * @type {{
     *  level: "info" | "warning" | "error",
     *  message: string,
     * }}
     */

    import Notification from "./Notification.svelte";

    /** @type {Message[]} */
    let notifications = [];
    $: {
        if (notifications.length) {
            setTimeout(() => {
                notifications = [...notifications.slice(1)];
            }, 2500);
        }
    }

    /**
     *
     * @param {string} message
     */
    export function info(message) {
        notifications = [
            ...notifications,
            {
                level: "info",
                message: message,
            },
        ];
    }

    /**
     *
     * @param {string} message
     */
    export function warning(message) {
        notifications = [
            ...notifications,
            {
                level: "warning",
                message: message,
            },
        ];
    }

    /**
     *
     * @param {string} message
     */
    export function error(message) {
        notifications = [
            ...notifications,
            {
                level: "error",
                message: message,
            },
        ];
    }

    /** @typ {HTMLDivElement} */
    let _notify;
</script>

<div class="notify container" bind:this={_notify}>
    {#each notifications as notification, index}
        <Notification
            level={notification.level}
            message={notification.message}
            on:click={() => {
                notifications = [
                    ...notifications.slice(0, index),
                    ...notifications.slice(index + 1),
                ];
            }}
        />
    {/each}
</div>

<style>
    .notify {
        z-index: 999;

        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        max-height: 100%;

        overflow: hidden;
        overflow-y: scroll;
        -ms-overflow-style: none;
        scrollbar-width: none;

        width: fit-content;
        height: fit-content;

        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    .notify::-webkit-scrollbar {
        display: none;
    }
</style>
