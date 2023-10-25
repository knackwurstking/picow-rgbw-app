<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import { ripple } from "../js/ripple";
    const _primaryRipple = ripple({ color: "var(--ripple-primary-color)", usePointer: true });

    /** @type {string} */
    export let name;

    export let open = false;

    function submit() {
        dispatch("submit", { name });
    }
</script>

<dialog {open}>
    <form action="#">
        <label for="name">
            <input id="name" name="name" type="text" bind:value={name} required />
        </label>

        <button
            type="submit"
            use:_primaryRipple
            on:click={submit}
        >
            OK
        </button>
    </form>
</dialog>
