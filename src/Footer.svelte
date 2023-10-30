<script>
    import SettingsIcon from "svelte-material-icons/CogOutline.svelte";

    import {
        Container,
        Button
    } from "svelte-css";

    import { Components, Api, States } from "./lib";

    /***********
     * Bindings
     ***********/

    /** @type {Components.SettingsDialog} */
    let settingsDialog;

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();
    let color = States.color.create();

    /***********************
     * Function Definitions
     ***********************/

    async function clickSettings() {
        settingsDialog.open();
    }

    async function clickOff() {
        await Api.setColor(Api.newColor(0, 0, 0), ...$devices);
    }

    async function clickSet() {
        await Api.setColor($color)
    }
</script>

<Container.Root height="3.5em">
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
</Container.Root>

<Components.SettingsDialog bind:this={settingsDialog} />
