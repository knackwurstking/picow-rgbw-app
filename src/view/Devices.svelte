<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";

    import {
        Button,
        Text,
    } from "svelte-css";

    import { Components, States, Api } from "../lib";

    /***********
     * Bindings
     ***********/

    /** @type {Components.DeviceSettingsDialog} */
    let deviceSettingsDialog;

    /******************************
     * Variable Export Definitions
     ******************************/

    export let connected;

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();

    /******************
     * Store: selected
     ******************/

    let selected = States.selected.create();
</script>

<article class="devices">
    <section class="header">
        <h2>Devices</h2>
    </section>

    <section class="has-padding">
        {#if $devices.length > 0}
            <ul class="devices-list">
                {#key $selected}
                    {#each $devices as device}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li
                            class="device has-padding"
                            class:checked={selected.contains(device)}
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
                                class="has-padding"
                                primary={devices.getName(device)}
                                secondary={`${device.host}:${device.port}`}
                            />

                            <div style="width: fit-content; user-select: none; font-size: .9em;">
                                <pre
                                    style:margin-left="var(--spacing)"
                                >[{Api.getColorArray(device).join(", ")}]</pre>
                            </div>

                            <span
                                style={
                                    "position: absolute;" +
                                    "top: var(--spacing);" +
                                    "right: calc(2.5em + var(--spacing));" +
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
                    {/each}
                {/key}
            </ul>
        {:else}
            <div class="has-padding is-italic is-text-center">
                <Text.Primary>No Devices</Text.Primary>
            </div>
        {/if}
    </section>
</article>

<Components.DeviceSettingsDialog bind:this={deviceSettingsDialog} />

<style>
    .devices .devices-list .device {
        cursor: pointer;
    }

    .devices .devices-list .device .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-color: currentColor;
        opacity: 0;

        transition: opacity .25s linear;
    }

    .devices .devices-list .device.checked .background {
        opacity: 0.1;
    }
</style>
