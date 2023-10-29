<script>
    import SettingsIcon from "svelte-material-icons/CogOutline.svelte";

    import {
        Container,
        Button
    } from "svelte-css";

    import { Components } from "./lib";

    /**********
     * Binding
     **********/

    /** @type {Components.SettingsDialog} */
    let settingsDialog;

    /***********************
     * Function Definitions
     ***********************/

    async function clickSettings() {
        settingsDialog.open();
    }

    async function clickOff() {
        // TODO: ...
    }

    async function clickSet() {
        // TODO: ...
    }
</script>

<footer class="container">
    <Container.Group
        style={
            "width: 100%;" +
            "height: 100%;"
        }
    >
        <Button.Root
            class="col"
            style={
                "max-width: 20%;" +
                "padding: calc(var(--spacing) / 2);"
            }
            color="secondary"
            variant="full"
            on:click={() => clickSettings()}
        >
            <SettingsIcon width="100%" height="100%" />
        </Button.Root>

        <Button.Root
            class="col"
            style={
                "max-width: 40%;"
            }
            color="destructive"
            variant="full"
            on:click={() => clickOff()}
        >
            OFF
        </Button.Root>

        <Button.Root
            class="col"
            style={
                "max-width: 40%;"
            }
            color="primary"
            variant="full"
            on:click={() => clickSet()}
        >
            ON/SET
        </Button.Root>
    </Container.Group>
</footer>

<Components.SettingsDialog bind:this={settingsDialog} />

<style>
    footer {
        height: 3.5em;
    }
</style>
