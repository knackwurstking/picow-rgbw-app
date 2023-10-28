<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import { Components, States, Api } from "./lib";

    import { Label, IconButton, PrimaryText, Group } from "svelte-css";

    /**
     * @typedef Device
     * @type {import("./lib/api").Device}
     *
     * @typedef Color
     * @type {import("./lib/states/color-storage").Color}
     */

    /***********************
     * Variable Definitions
     ***********************/

    /** @type {Device[]} */
    let selected = [];

    /** @type {Color} */
    let activeStorageColor = {};
    $: activeStorageColor && setColorPickerValues(activeStorageColor);

    let brightness = 100;
    let r = 100;
    let g = 100;
    let b = 100;
    $: r && g && b && setActiveStorageColor(r, g, b);


    /**
     * @param {Color} c
     */
    function setColorPickerValues(c) {
        if (!c.r && !c.g && !c.b) return;

        r = c.r || 0;
        g = c.g || 0;
        b = c.b || 0;

        brightness = Math.min(...([r, g, b].filter(c => c > 0)));
    }

    function setActiveStorageColor(r, g, b) {
        activeStorageColor = { r, g, b };
    }

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
                                    "border-left: var(--border-width) solid hsl(var(--border));"
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

        <section>
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
                            // TODO: color storage update (remove color)
                        }}
                    >
                        <TrashIcon width="100%" height="100%" />
                    </IconButton>
                </Group>
            </div>

            <!-- TODO: handle on:click for color -->
            <div
                class="data"
                style={
                    "height: 4em;" +
                    "border: var(--border-width) solid hsl(var(--border));" +
                    "border-radius: var(--radius);"
                }
            >
                <figure style="height: 100%;">
                    {#each $colorStorage as color}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                            class="color has-small-margin has-small-padding"
                            class:checked={
                                activeStorageColor.r === color.r &&
                                activeStorageColor.g === color.g &&
                                activeStorageColor.b === color.b
                            }
                            style={
                                "height: calc(100% - var(--spacing));" +
                                "width: calc(5em - (var(--spacing) * 3));" +
                                "border: var(--border-width) solid hsl(var(--border));" +
                                "border-radius: var(--radius);" +
                                "cursor: pointer;"
                            }
                            on:click={() => {
                                if (
                                    activeStorageColor.r === color.r &&
                                    activeStorageColor.g === color.g &&
                                    activeStorageColor.b === color.b
                                ) {
                                    activeStorageColor = {};
                                } else {
                                    activeStorageColor = color;
                                }
                            }}
                        >
                            <div
                                class="background"
                                style={
                                    `background-color: rgb(${color.r * 2.5}, ${color.g * 2.5}, ${color.b * 2.5});` +
                                    "width: 100%; height: 100%;" +
                                    "border: var(--border-width) solid hsl(var(--border));" +
                                    "border-radius: var(--radius);"
                                }
                                />
                        </div>
                    {/each}
                </figure>
            </div>
        </section>
    </article>

    <article class="color-picker">
        <section class="header">
            <h2>Color Picker</h2>
        </section>

        <!-- TODO: value bindings for rgb and brightness -->
        <section>
            <Label
                primaryText="Brightness"
                useLabel
                row
            >
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={brightness}
                />
            </Label>

            <Label
                primaryText="R"
                useLabel
                row
            >
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={r}
                />
            </Label>

            <Label
                primaryText="G"
                useLabel
                row
            >
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={g}
                />
            </Label>

            <Label
                primaryText="B"
                useLabel
                row
            >
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={b}
                />
            </Label>
        </section>
    </article>
</main>

<Components.DeviceSettingsDialog />

<style>
    main {
        height: calc(100% - 3.5em);
    }

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

    .color-storage .data .color,
    .color-storage .data .color .background {
        transition: border-color .25s linear;
    }

    .color-storage .data .color.checked,
    .color-storage .data .color.checked .background {
        border-color: hsl(var(--primar)) !important;
    }

    .color-picker input {
        width: calc(100vw - 12em);
    }
</style>
