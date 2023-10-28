<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import { Components, States, Api } from "./lib";

    import { Label, IconButton, PrimaryText, Group } from "svelte-css";

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

    /**********************
     * Store: colorStorage
     **********************/

    let colorStorage = States.colorStorage.create();
</script>

<main class="container">
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
                                primaryText={devices.getName(device)}
                                secondaryText={`${device.host}:${device.port}`}
                            />

                            <div style="width: fit-content; user-select: none;">
                                <!-- TODO: get color from `device` -->
                                <pre>[255, 255, 255, 255]</pre>
                            </div>

                            <IconButton
                                style={
                                    "position: absolute;" +
                                    "top: 0; right: 0; height: 100%;" +
                                    "border-radius: 0;" +
                                    "border-left: .1em solid hsl(var(--border));"
                                }
                                ghost
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

    <article class="color-storage">
        <section class="header">
            <h2>Color Storage</h2>
        </section>

        <div class="actions has-margin" style="display: flex; justify-content: flex-end;">
            <Group style="font-size: 1.5em;">
                <IconButton
                    on:click={async () => {
                        // TODO: color storage update (add color)
                    }}
                >
                    <AddIcon width="100%" height="100%" />
                </IconButton>

                <IconButton
                    color="destructive"
                    on:click={async () => {
                        // TODO: color storage update (add color)
                    }}
                >
                    <TrashIcon width="100%" height="100%" />
                </IconButton>
            </Group>
        </div>

        <!-- TODO: handle on:click for color -->
        <div
            class="data is-debug"
            style={
                "height: 4em;"
            }
        >
            <figure style="height: 100%;">
                {#each $colorStorage as color}
                    <div
                        class="color has-small-margin"
                        style={
                            `background-color: rgb(${color.r}, ${color.g}, ${color.b});` +
                            `opacity: ${color.w / 100};` +
                            "height: calc(100% - var(--spacing));" +
                            "width: calc(5em - (var(--spacing) * 3));"
                        }
                    />
                {/each}
            </figure>
        </div>
    </article>

    <article class="color-picker">
        <section class="header">
            <h2>Color Picker</h2>
        </section>

        <!-- TODO: color picker for rgb and brightness -->
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
