<script>
    import { onDestroy } from "svelte";
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import {
        Button,
        Text,
        Input
    } from "svelte-css";

    import { Components, States, Api } from "./lib";

    /***********
     * Bindings
     ***********/

    /** @type {Components.DeviceSettingsDialog} */
    let deviceSettingsDialog;

    /***********************
     * Variable Definitions
     ***********************/

    let cleanUp = [];

    let brightness = 100;

    let r = 100;
    let g = 100;
    let b = 100;

    let connected = false;

    /***************
     * Store: color
     ***************/

    let color = States.color.create();
    $: $color && subscribeToColor();

    /****************
     * Store: server
     ****************/

    let server = States.server.create();
    $: $server && subscribeToServer();

    /******************
     * Store: selected
     ******************/

    let selected = States.selected.create();

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();

    /**********************
     * Store: colorStorage
     **********************/

    let colorStorage = States.colorStorage.create();

    /***********************
     * Function Definitions
     ***********************/

    /**
     * @param {Api.DevicePinDuty} r
     * @param {Api.DevicePinDuty} g
     * @param {Api.DevicePinDuty} b
     */
    async function handleRGBChange(r, g, b) {
        brightness = Math.min(...([r, g, b].filter(c => c > 0)));
        color.set({ r, g, b })
    }

    /**
     * @param {number} brightness
     */
    async function handleBrightnessChange(brightness) {
        const rgb = [r, g, b].filter(c => c > 0);
        const min = Math.min(...rgb);
        let diff = min - brightness;

        if (!!rgb.find(c => c-diff > 100)) {
            diff = 100-Math.max(...rgb);
            if (r > 0) r = r+diff;
            if (g > 0) g = g+diff;
            if (b > 0) b = b+diff;
        } else if (!!rgb.find(c => c-diff <= 5)) {
            diff = 5-Math.min(...rgb);
            if (r > 0) r = r+diff;
            if (g > 0) g = g+diff;
            if (b > 0) b = b+diff;
        } else {
            if (r > 0) r = r-diff;
            if (g > 0) g = g-diff;
            if (b > 0) b = b-diff;
        }
    }

    async function subscribeToColor() {
        color.subscribe((color) => {
            if (!color.r && !color.g && !color.b) return;

            r = color.r || 0;
            g = color.g || 0;
            b = color.b || 0;

            brightness = Math.max(...([r, g, b].filter(c => c > 0)));
        });
    }

    async function subscribeToServer() {
        const handlers = {};

        let event = Api.WebSocket.events.devices.updated;
        /** @type {() => Promise<void>} */
        handlers[`${event}`] = async () => {
            console.debug(`[main] event "${event}"`);
            fetchDevices();
        };

        event = Api.WebSocket.events.device.error;
        /** @type {(data: Api.Device) => Promise<void>} */
        handlers[`${event}`] = async (device) => {
            console.debug(`[main] event "${event}"`);
            devices.updateDevice(device);
        };

        event = Api.WebSocket.events.device.online;
        /** @type {(data: Api.Device) => Promise<void>} */
        handlers[`${event}`] = async (device) => {
            console.debug(`[main] event "${event}"`);
            devices.updateDevice(device);
        };

        event = Api.WebSocket.events.device.offline;
        /** @type {(data: Api.Device) => Promise<void>} */
        handlers[`${event}`] = async (device) => {
            console.debug(`[main] event "${event}"`);
            devices.updateDevice(device);
        };

        event = Api.WebSocket.events.color.changed;
        /** @type {(data: Api.Device) => Promise<void>} */
        handlers[`${event}`] = async (device) => {
            console.debug(`[main] event "${event}"`);
            devices.updateDevice(device);
        };

        server.subscribe((server) => {
            cleanUp.forEach(fn => fn());
            cleanUp = [];

            Api.WebSocket.connect(server);

            const events = [
                ...Object.values(Api.WebSocket.events.devices),
                ...Object.values(Api.WebSocket.events.device),
                ...Object.values(Api.WebSocket.events.color),
            ];
            for (const event of events) {
                Api.WebSocket.on(event, handlers[event]);
                cleanUp.push(() => Api.WebSocket.off(event, handlers[event]));
            }

            let listener = async () => {
                connected = true;
            };
            Api.WebSocket.on("open", listener);
            cleanUp.push(() => Api.WebSocket.off("open", listener));

            listener = async () => {
                connected = false;
            };
            Api.WebSocket.on("close", listener);
            cleanUp.push(() => Api.WebSocket.off("close", listener));
        });
    }

    async function fetchDevices() {
        try {
            const result = await Api.getDevices($server)
            devices.set(result.map(
                /** @param {Api.Device} r */
                (r) => ({
                    ...r,
                    name: localStorage.getItem(`deviceName:${r.host}:${r.port}`) || "",
                })
            ) || []);
        } catch (err) {
            console.warn("[main]", err);
            devices.set([]);
        }
    }

    onDestroy(() => cleanUp.forEach(fn => fn()));
</script>

<main
    class="container"
    style:height="calc(100% - 3.5em)"
    style:overflow-y="auto"
    style:scroll-behavior="smooth"
>
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

    <article class="color-storage">
        <section class="header">
            <h2>Color Storage</h2>
        </section>

        <section>
            <div class="actions has-margin" style="display: flex; justify-content: flex-end;">
                <div class="group" style="font-size: 1.5em;">
                    <Button.Icon
                        on:click={async () => colorStorage.add({ r, g, b })}
                    >
                        <AddIcon width="100%" height="100%" />
                    </Button.Icon>

                    <Button.Icon
                        color="destructive"
                        on:click={async () => colorStorage.remove({ r, g, b })}
                    >
                        <TrashIcon width="100%" height="100%" />
                    </Button.Icon>
                </div>
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
                    <div
                        style:display="flex"
                        style:flex-direction="row"
                        style:height="100%"
                    >
                        {#each $colorStorage as c}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                class="color has-small-margin has-small-padding"
                                class:checked={
                                    $color.r === c.r &&
                                    $color.g === c.g &&
                                    $color.b === c.b
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
                                        $color.r === c.r &&
                                        $color.g === c.g &&
                                        $color.b === c.b
                                    ) {
                                        color.set(Api.newColor(0, 0, 0));
                                    } else {
                                        color.set(Api.newColor(c.r, c.g, c.b));
                                    }
                                }}
                            >
                                <div
                                    class="background"
                                    style={
                                        `background-color: rgb(${c.r * 2.5}, ${c.g * 2.5}, ${c.b * 2.5});` +
                                        "width: 100%; height: 100%;" +
                                        "border-radius: var(--radius);"
                                    }
                                />
                            </div>
                        {/each}
                    </div>
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
                <Input.Slider
                    min={0}
                    max={100}
                    bind:value={brightness}
                    on:change={() => {
                        handleBrightnessChange(brightness);
                    }}
                />
            </Text.Label>

            <hr />

            <Text.Label
                secondary={"R"}
                useLabel
            >
                <code slot="secondary">{r.toString()}</code>
                <Input.Slider
                    min={0}
                    max={100}
                    bind:value={r}
                    on:change={() => {
                        handleRGBChange(r, g, b);
                    }}
                />
            </Text.Label>

            <Text.Label
                secondary={"G"}
                useLabel
            >
                <code slot="secondary">{g.toString()}</code>
                <Input.Slider
                    min={0}
                    max={100}
                    bind:value={g}
                    on:change={() => {
                        handleRGBChange(r, g, b);
                    }}
                />
            </Text.Label>

            <Text.Label
                secondary={"B"}
                useLabel
            >
                <code slot="secondary">{b.toString()}</code>
                <Input.Slider
                    min={0}
                    max={100}
                    bind:value={b}
                    on:change={() => {
                        handleRGBChange(r, g, b);
                    }}
                />
            </Text.Label>
        </section>
    </article>
</main>

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

    .color-storage .data .color,
    .color-storage .data .color .background {
        transition: border-color .25s linear;
    }

    .color-storage .data .color.checked,
    .color-storage .data .color.checked .background {
        border-color: hsl(var(--primar)) !important;
    }

    .color-picker code {
        transform: translateY(-.05em);
        margin-left: var(--spacing);
    }
</style>
