<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";

    import { Text, Button } from "svelte-css";

    import { States, Api, Components } from "../lib";

    /***********
     * Bindings
     ***********/

    /** @type {Components.DeviceSettingsDialog} */
    let deviceSettingsDialog;

    /******************************
     * Variable Export Definitions
     ******************************/

    /** @type {import("../lib/api").Device} */
    export let device;
    export let connected;

    /***********************
     * Variable Definitions
     ***********************/

    let checked = false;

    /******************
     * Store: selected
     ******************/

    let selected = States.selected.create();
    $: !!selected && selected.subscribe((selected) => {
        checked = selected.findIndex(
            d => d.host === device.host && d.port === device.port
        ) > -1;
    });

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li
    class="device has-border no-overflow"
    class:checked
    style:margin="var(--spacing) auto"
    on:click={() => {
        if (selected.contains(device)) {
            selected.remove(device);
        } else {
            selected.add(device);
        }
    }}
>
    <div class="background" />

    <Text.Label
        primary={devices.getName(device)}
        secondary={`${device.host}:${device.port}`}
    />

    <pre
        style:width="fit-content"
        style:margin-left="calc(var(--spacing) * 2)"
    >[{Api.getColorArray(device).join(", ")}]</pre>

    <span
        style={
            "position: absolute;" +
            "top: var(--spacing);" +
            "left: var(--spacing);" +
            "width: .5em;" +
            "height: .5em;" +
            "border-radius: 50%;" +
            "filter: blur(3px);"
        }
        style:background-color={
            !connected
                ? "yellow"
                : device.offline
                    ? "red"
                    : "green"
        }
    />

    <Button.Icon
        style={
            "position: absolute;" +
            "top: 0; right: 0; height: 100%;" +
            "border-radius: 0;" +
            "border-left: var(--border-width) solid hsl(var(--border));"
        }
        ghost
        on:click={(ev) => {
            ev.stopPropagation();
            deviceSettingsDialog.open(device);
        }}
    >
        <DeviceSettingsIcon />
    </Button.Icon>
</li>

<Components.DeviceSettingsDialog bind:this={deviceSettingsDialog} />


<style>
    .device {
        cursor: pointer;
    }

    .device .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-color: hsl(var(--secondary));
        opacity: 0;

        transition: opacity .25s linear;
    }

    .device.checked .background {
        opacity: .5;
    }
</style>
