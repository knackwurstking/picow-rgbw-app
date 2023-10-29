<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import {
        Button,
        Container,
        Text
    } from "svelte-css";

    import { Components, States, Api } from "./lib";

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
    $: activeStorageColor && handleActiveStorgeColorChange(activeStorageColor);

    let brightness = 100;
    $: typeof brightness === "number" && handleBrightnessChange(brightness);
    let r = 100;
    let g = 100;
    let b = 100;
    $: r && g && b && handleRGBChange(r, g, b);


    /**
     * @param {Color} c
     */
    function handleActiveStorgeColorChange(c) {
        if (!c.r && !c.g && !c.b) return;

        r = c.r || 0;
        g = c.g || 0;
        b = c.b || 0;

        brightness = Math.min(...([r, g, b].filter(c => c > 0)));
    }

    function handleRGBChange(r, g, b) {
        brightness = Math.min(...([r, g, b].filter(c => c > 0)));
        activeStorageColor = { r, g, b };
    }

    function handleBrightnessChange(brightness) {
        const rgb = [r, g, b].filter(c => c > 0);
        const min = Math.min(...rgb);
        const diff = min - brightness;

        if (
            !!rgb.find(c => c - diff > 100) ||
            !!rgb.find(c => c-diff < 5)
        ) {
            return
        } else {
            r = r-diff;
            g = g-diff;
            b = b-diff;
        }
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

                            <Text.Label
                                class="has-padding"
                                primary={devices.getName(device)}
                                secondary={`${device.host}:${device.port}`}
                            />

                            <div style="width: fit-content; user-select: none; font-size: .9em;">
                                <!-- TODO: get color from `device` -->
                                <pre>[255, 255, 255, 255]</pre>
                            </div>

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
                                    // TODO: open device settings dialog
                                }}
                            >
                                <DeviceSettingsIcon />
                            </Button.Icon>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="has-padding is-italic is-text-center">
                    <Text.Primary>No Devices</Text.Primary>
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
                <Container.Group style="font-size: 1.5em;">
                    <Button.Icon
                        on:click={async () => {
                            // TODO: color storage update (add color)
                        }}
                    >
                        <AddIcon width="100%" height="100%" />
                    </Button.Icon>

                    <Button.Icon
                        color="destructive"
                        on:click={async () => {
                            // TODO: color storage update (remove color)
                        }}
                    >
                        <TrashIcon width="100%" height="100%" />
                    </Button.Icon>
                </Container.Group>
            </div>

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

        <section>
            <Text.Label
                useLabel
            >
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={brightness}
                />
            </Text.Label>

            <hr />

            <Text.Label
                secondary={"R"}
                useLabel
            >
                <code slot="secondary">{r.toString()}</code>
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={r}
                />
            </Text.Label>

            <Text.Label
                secondary={"G"}
                useLabel
            >
                <code slot="secondary">{g.toString()}</code>
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={g}
                />
            </Text.Label>

            <Text.Label
                secondary={"B"}
                useLabel
            >
                <code slot="secondary">{b.toString()}</code>
                <input
                    type="range"
                    min={0}
                    max={100}
                    bind:value={b}
                />
            </Text.Label>
        </section>
    </article>
</main>

<Components.DeviceSettingsDialog />

<style>
    main {
        height: calc(100% - 3.5em);
        overflow-y: auto;
        scroll-behavior: smooth;
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
        width: 100%;
    }

    .color-picker code {
        transform: translateY(-.05em);
        margin-left: var(--spacing);
    }
</style>
