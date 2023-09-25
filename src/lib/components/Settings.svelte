<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import { ripple } from "../js/ripple";
    const _primaryRipple = ripple({ color: "var(--ripple-primary-color)", usePointer: true });

    /** @type {string} */
    export let serverHost;
    /** @type {number} */
    export let serverPort;
    /** @type {Themes} */
    export let currentTheme = "custom";

    export let open = false;

    function submit() {
        dispatch("submit", { serverHost, serverPort, currentTheme });
    }
</script>

<dialog {open}>
    <form action="#">
        <label for="themePicker">
            <select id="themePicker" name="themePicker" bind:value={currentTheme} required>
                <option value="custom" selected={currentTheme === "custom"}>Custom</option>
                <option value="default" selected={currentTheme === "picocss"}>PicoCSS</option>
            </select>
        </label>

        <label for="serverHost">
            (Api) Server Host
            <input id="serverHost" name="serverHost" type="text" bind:value={serverHost} required />
        </label>

        <label for="serverPort">
            (Api) Server Port
            <input
                id="serverPort"
                name="serverPort"
                type="number"
                bind:value={serverPort}
                min={0}
                max={65535}
                required
            />
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

<style>
    form {
        width: 100%;
        max-width: 30em;
    }

    label[for="serverHost"] {
        display: inline-block;
        width: calc(100% - 14ch - var(--spacing) * 2);
        margin-left: var(--spacing);
    }

    label[for="serverPort"] {
        display: inline-block;
        width: 14ch;
    }
</style>
