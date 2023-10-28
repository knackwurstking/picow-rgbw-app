<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import { Components, States, Api } from "./lib";

    import { Label, IconButton, PrimaryText } from "svelte-css";

    /**
     * @typedef Device
     * @type {import("./lib/api").Device}
     */

    /***********************
     * Variable Definitions
     ***********************/

    /** @type {Device[]} */
    let selected = [];

    /****************
     * Store: server
     ****************/

    let server = States.server.create();
    $: server && initServer();
    function initServer() {
        server.subscribe(() => {
            Api.getDevices()
                .then((result) => devices.set(
                    result.map(
                        /** @param {Device} r */
                        (r) => ({
                            ...r,
                            name: localStorage.getItem(`deviceName:${r.host}:${r.port}`) || "",
                        })
                    ) || []
                ))
                .catch((err) => {
                    // TODO: Notification
                    // FIXME: not a valid url: missing host:port (Need error check and notify)
                    devices.set([]);

                    console.warn("[main]", err);
                });
        });
    }

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();
</script>

<main class="container">
    <!-- TODO: 1. devices list, 2. color storage, 3. color picker -->

    <article class="devices">
        <section class="header">
            <h2>Devices</h2>
        </section>

        <section class="has-padding">
            {#if $devices.length > 0}
                <ul class="devices-list">
                    {#each $devices as device}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li
                            class="device has-padding"
                            class:checked={
                                !!selected.find(
                                    d => (d.host === device.host && d.port === device.port)
                                )
                            }
                            on:click={() => {
                                const i = selected.findIndex(
                                    (d) => (d.host === device.host && d.port === device.port)
                                );

                                if (i > -1) {
                                    selected = [
                                        ...selected.slice(0, i),
                                        ...selected.slice(i+1),
                                    ];
                                } else {
                                    selected = [
                                        ...selected,
                                        device,
                                    ];
                                }
                            }}
                        >
                            <div class="background" />

                            <Label
                                class="has-padding"
                                primaryText={device.name}
                                secondaryText={`${device.host}:${device.port}`}
                            />

                            <div style="width: fit-content; user-select: none;">
                                <pre>[255, 255, 255, 255]</pre>
                            </div>

                            <IconButton
                                style={
                                    "position: absolute;" +
                                    "top: 0; right: 0;" +
                                    "height: 100%;" +
                                    "border: none;" +
                                    "border-radius: 0;" +
                                    "border-left: .1em solid hsl(var(--border));"
                                }
                                on:click={(ev) => {
                                    ev.stopPropagation();
                                    // TODO: open device settings dialog
                                }}
                            >
                                <DeviceSettingsIcon />
                            </IconButton>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="has-padding is-italic is-text-center">
                    <PrimaryText>No Devices</PrimaryText>
                </div>
            {/if}
        </section>
    </article>
</main>

<Components.DeviceSettingsDialog />

<style>
    main {
        height: calc(100% - 3.5em);
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
