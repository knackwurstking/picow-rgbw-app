<script>
    import SettingsIcon from "svelte-material-icons/CogOutline.svelte";

    import {
        Button,
    } from "svelte-css";

    import { Components, Api, States } from "./lib";

    /***********
     * Bindings
     ***********/

    /** @type {Components.SettingsDialog} */
    let settingsDialog;

    /*****************
     * Store: server
     *****************/

    let server = States.server.create();

    /*****************
     * Store: selected
     *****************/

    let selected = States.selected.create();

    /***************
     * Store: color
     ***************/

    let color = States.color.create();

    /***********************
     * Function Definitions
     ***********************/

    async function clickSettings() {
        settingsDialog.open();
    }

    async function clickOff() {
        await Api.setColor($server, Api.newColor(0, 0, 0), ...$selected);
    }

    async function clickSet() {
        await Api.setColor($server, $color, ...$selected);
    }
</script>

<footer
    class="ui-container"
    style:height="3.5em"
>
    <div
        class="ui-group"
        style={
            "width: 100%;" +
            "height: 100%;"
        }
    >
        <Button.Root
            class="flex"
            style={
                "max-width: 20%;" +
                "width: 100%;" +
                "padding: calc(var(--spacing) / 2);"
            }
            color="secondary"
            variant="full"
            on:click={() => clickSettings()}
        >
            <SettingsIcon width="100%" height="100%" />
        </Button.Root>

        <Button.Root
            style="width: 100%;"
            color="destructive"
            variant="full"
            on:click={() => clickOff()}
        >
            OFF
        </Button.Root>

        <Button.Root
            style="width: 100%;"
            color="primary"
            variant="full"
            on:click={() => clickSet()}
        >
            ON/SET
        </Button.Root>
    </div>
</footer>

<Components.SettingsDialog bind:this={settingsDialog} />
