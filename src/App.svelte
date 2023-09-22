<script>
    // @ts-ignore
    import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
    // @ts-ignore
    import IoMdAddCircleOutline from "svelte-icons/io/IoMdAddCircleOutline.svelte";
    // @ts-ignore
    import IoIosTrash from "svelte-icons/io/IoIosTrash.svelte";

    import ColorStorage from "./lib/components/ColorStorage.svelte";
    import ColorPicker from "./lib/components/ColorPicker.svelte";
    import Settings from "./lib/components/Settings.svelte";
    import Notify from "./lib/components/Notify.svelte";
    import DeviceSettings from "./lib/components/DeviceSettings.svelte";

    import Api from "./lib/js/api";
    import EventHandler from "./lib/js/event-handler";

    import * as ripple from "./lib/ripple";

    /**
     * @typedef Device
     * @type {import("./lib/js/event-handler").Device}
     *
     * @typedef Color
     * @type {import("./lib/js/api").Color}
     */

    /** @type {Notify} */
    let notify;
    $: {
        if (notify) {
            const config = localStorage.getItem("config");
            if (config) {
                try {
                    const data = JSON.parse(config);
                    serverHost = data.serverHost;
                    serverPort = data.serverPort;
                    if (data.currentTheme) currentTheme = data.currentTheme;
                } catch (err) {
                    notify.warning(`Loading config from localStorage failed: ${err}`);
                }
            }
        }
    }

    /** @type {Device[]} */
    let devices = [];
    let devicesOnline = [];
    let devicesChecked = [];
    let wsConnected = false;
    $: {
        if (devices) {
            if (wsConnected) {
                devices.forEach((device) => {
                    const addr = `${device.host}:${device.port}`;
                    if (!device.offline && !devicesOnline.includes(addr)) {
                        devicesOnline.push(addr);
                    } else if (device.offline && devicesOnline.includes(addr)) {
                        const i = devicesOnline.indexOf(addr);
                        devicesOnline = [
                            ...devicesOnline.slice(0, i),
                            ...devicesOnline.slice(i + 1),
                        ];
                    }
                });
            } else {
                devicesOnline = [];
            }
        }
    }

    /** @type {EventHandler} */
    let eventHandler;
    /** @type {Api} */
    let api;

    /** @type {ColorPicker} */
    let colorPicker;
    /** @type {ColorStorage} */
    let colorStorage;

    /** @type {Color | null} */
    let selectedColorFromStorage = null;
    $: selectedColorFromStorage && setColor(selectedColorFromStorage);

    /** @type {Color} */
    let currentColor = { r: 100, g: 100, b: 100, w: 100 };

    let settingsOpen = false;
    let serverHost;
    let serverPort;
    /** @type {Themes} */
    let currentTheme = "custom";

    $: serverHost && serverPort && initServer(serverHost, serverPort);

    let deviceSettingsOpen = false;
    let deviceSettingsName = "";
    let deviceSettingsOnSubmit = null;

    /** @param {Color} color */
    function setColor(color) {
        if (colorPicker) colorPicker.set(color.r, color.g, color.b);
    }

    async function getDevices() {
        try {
            const data = await api.getDevices();

            if (Array.isArray(data)) {
                devices = data.map((device) => {
                    return {
                        ...device,
                        name: getDeviceName(device.host, device.port),
                    };
                });
            } else {
                notify.error(`Got unexpected data from the server "${api.server}" (data: ${data})`);
                devices = [];
            }
        } catch (err) {
            notify.error(`Get Devices Error: ${err}`);
        }
    }

    /**
     *
     * @param {string} host
     * @param {number} port
     * @param {string} name
     */
    function setDeviceName(host, port, name) {
        localStorage.setItem(`${host}:${port}`, name || "");
    }

    /**
     *
     * @param {string} host
     * @param {number} port
     * @returns {string}
     */
    function getDeviceName(host, port) {
        return localStorage.getItem(`${host}:${port}`) || `${host}:${port}`;
    }

    /**
     *
     * @param {string} host
     * @param {number} port
     */
    async function initServer(host, port) {
        console.debug(`init: host=${host}, port=${port}`);

        if (eventHandler) {
            eventHandler.setServer(host, port);
        } else eventHandler = new EventHandler(serverHost, serverPort);

        if (api) {
            api.setServer(host, port);
            return;
        } else api = new Api(serverHost, serverPort);

        // Initializing event handlers
        eventHandler.devicesUpdated(async ({ detail }) => {
            console.debug(`event: "${eventHandler.events.devicesUpdated}": detail=${detail}`);
        });

        eventHandler.deviceError(({ detail }) => {
            notify.error(`event: "${eventHandler.events.deviceError}": ${detail}`);
        });

        eventHandler.deviceOnline(({ detail }) => {
            console.debug(`event: "${eventHandler.events.deviceOnline}": detail=${detail}`);

            // Update `devicesOnline`
            const device = devices.find(
                (device) => device.host === detail.host && device.port === detail.port
            );
            if (device) device.offline = false;
            devices = devices;
        });

        eventHandler.deviceOffline(({ detail }) => {
            console.debug(`event: "${eventHandler.events.deviceOffline}": detail=${detail}`);

            // Update `devicesOnline`
            const device = devices.find(
                (device) => device.host === detail.host && device.port === detail.port
            );
            if (device) device.offline = true;
            devices = devices;
        });

        eventHandler.colorChanged(({ detail }) => {
            console.debug(`event: "${eventHandler.events.colorChanged}":`, detail);

            // TODO: set device to `offline = false`
            const device = devices.find(
                (device) => device.host === detail.host && device.port === detail.port
            );
            if (device) device.data = detail.data;
            devices = devices;
        });

        let wsOpenCloseNotified = false;
        let wsErrorNotified = false;

        // Handle websocket open event
        eventHandler.eventTarget.addEventListener(eventHandler.events.wsOpen, async () => {
            wsOpenCloseNotified = false;
            wsErrorNotified = false;
            if (!wsConnected) wsConnected = true;
            notify.info(`Connected to "${eventHandler.server}"`);

            try {
                await getDevices();
            } catch (err) {
                console.debug("Fetch devices failed:", err);
            }
        });

        // Handle websocket close event
        let listener = async () => {
            if (wsConnected) wsConnected = false;

            if (!wsOpenCloseNotified) {
                notify.warning(`Connection to "${eventHandler.server} closed."`);
                wsOpenCloseNotified = true;
            }
        };
        eventHandler.eventTarget.addEventListener(eventHandler.events.wsClose, listener);

        // Handle websocket error event
        listener = async () => {
            if (!wsErrorNotified) {
                notify.error(`Connection to "${eventHandler.server}" failed!`);
                wsErrorNotified = true;
            }
        };
        eventHandler.eventTarget.addEventListener(eventHandler.events.wsError, listener);
    }
</script>

<svelte:head>
    {#if currentTheme === "custom"}
        <link rel="stylesheet" href="/themes/custom.min.css" />
    {/if}

    {#if currentTheme === "picocss"}
        <link rel="stylesheet" href="/themes/picocss.min.css" />
    {/if}
</svelte:head>

<Notify bind:this={notify} />

<main class="container">
    {#if settingsOpen}
        <Settings
            open={settingsOpen}
            {serverHost}
            {serverPort}
            {currentTheme}
            on:submit={({ detail }) => {
                serverHost = detail.serverHost;
                serverPort = detail.serverPort;
                currentTheme = detail.currentTheme;

                localStorage.setItem(
                    "config",
                    JSON.stringify({
                        serverHost,
                        serverPort,
                        currentTheme,
                    })
                );

                settingsOpen = false;
            }}
        />
    {/if}

    {#if deviceSettingsOpen}
        <DeviceSettings
            open={deviceSettingsOpen}
            name={deviceSettingsName}
            on:submit={(ev) => {
                deviceSettingsOnSubmit(ev);
                deviceSettingsOpen = false;
            }}
        />
    {/if}

    <section class="devices">
        <h3><u>Devices</u></h3>

        <article>
            {#each devices as device}
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <fieldset
                    class="devices-list-item"
                    class:checked={devicesChecked.includes(`${device.host}:${device.port}`)}
                    on:click={(ev) => {
                        ripple.add(ev, ev.currentTarget, {
                            mode: "primary",
                            reverse: ev.currentTarget.classList.contains("checked"),
                        });

                        const addr = `${device.host}:${device.port}`;
                        if (devicesChecked.includes(addr)) {
                            const i = devicesChecked.indexOf(addr);
                            devicesChecked = [
                                ...devicesChecked.slice(0, i),
                                ...devicesChecked.slice(i + 1),
                            ];
                        } else {
                            devicesChecked.push(addr);
                            devicesChecked = devicesChecked;
                        }
                    }}
                >
                    <div class="background" />

                    <!-- Online Indicator -->
                    <div
                        class="online-indicator"
                        class:online={devicesOnline.includes(`${device.host}:${device.port}`)}
                    >
                        <div class="online-indicator__inner" />
                    </div>

                    <div class="content">
                        <!-- Title (Host:Port) -->
                        <div class="devices-list-item__address"><b>{device.name}</b></div>

                        <!-- Color Preview (RGBW) -->
                        <code class="devices-list-item__color-preview">
                            {device.data.map((pin) => pin.duty.toString()).join(", ")}
                        </code>
                    </div>

                    <div class="actions">
                        <!-- Settings Button -->
                        <div class="settings">
                            <button
                                class="secondary outline"
                                on:click={(ev) => {
                                    ev.stopPropagation();
                                    ripple.add(ev, ev.currentTarget, { mode: "secondary" });
                                    deviceSettingsName = device.name;
                                    deviceSettingsOnSubmit = ({ detail }) => {
                                        device.name =
                                            detail.name || `${device.host}:${device.port}`;
                                        // Update local storage
                                        setDeviceName(device.host, device.port, detail.name);
                                    };
                                    deviceSettingsOpen = true;
                                }}
                            >
                                <IoMdSettings />
                            </button>
                        </div>
                    </div>
                </fieldset>
            {/each}
        </article>
    </section>

    <section class="control">
        <h3><u>Control</u></h3>

        <div class="actions">
            <button
                class="add-item"
                on:click={async (ev) => {
                    ripple.add(ev, ev.currentTarget, { mode: "primary" });
                    colorStorage.add(currentColor);
                }}
            >
                <div class="icon"><IoMdAddCircleOutline /></div>
            </button>

            <button
                class="outline secondary remove-item"
                disabled={!selectedColorFromStorage}
                on:click={async (ev) => {
                    ripple.add(ev, ev.currentTarget, { mode: "secondary" });
                    colorStorage.remove(selectedColorFromStorage);
                }}
            >
                <div class="icon"><IoIosTrash /></div>
            </button>
        </div>

        <ColorStorage bind:this={colorStorage} bind:selected={selectedColorFromStorage} />

        <ColorPicker
            bind:this={colorPicker}
            on:change={({ detail }) => {
                currentColor = {
                    ...detail,
                    w: detail.r === detail.g && detail.r === detail.b ? detail.r : 0,
                };

                if (selectedColorFromStorage) {
                    if (
                        selectedColorFromStorage.r !== currentColor.r ||
                        selectedColorFromStorage.g !== currentColor.g ||
                        selectedColorFromStorage.b !== currentColor.b
                    ) {
                        selectedColorFromStorage = null;
                    }
                }
            }}
        />
    </section>
</main>

<footer class="container">
    <div>
        <button
            class="contrast"
            on:click={(ev) => {
                ripple.add(ev, ev.currentTarget);
                settingsOpen = !settingsOpen;
            }}
        >
            <div class="icon">
                <IoMdSettings />
            </div>
        </button>

        <button
            class="secondary"
            style={`
                width: 50%;
                margin: 0;
                border-radius: 0;
                box-shadow: none;
            `}
            on:click={async (ev) => {
                ripple.add(ev, ev.currentTarget, { mode: "secondary" });

                try {
                    api.setColor(devicesChecked, { r: 0, g: 0, b: 0, w: 0 });
                } catch (err) {
                    notify.error(err);
                }
            }}>OFF</button
        >

        <button
            style={`
                width: 50%;
                margin: 0;
                border-bottom-left-radius: 0;
                border-top-left-radius: 0;
                box-shadow: none;
            `}
            on:click={(ev) => {
                ripple.add(ev, ev.currentTarget, { mode: "primary" });
                console.debug(
                    `set color: ${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.w}`
                );

                try {
                    api.setColor(devicesChecked, currentColor);
                } catch (err) {
                    notify.error(err);
                }
            }}>ON / SET</button
        >
    </div>
</footer>

<style>
    .icon {
        width: 100%;
        height: 100%;

        color: var(--color);
    }

    button {
        position: relative;
        overflow: hidden;
    }

    main {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 60px;
        left: 0;

        overflow: hidden;
        overflow-y: scroll;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    main::-webkit-scrollbar {
        display: none;
    }

    main section.devices .devices-list-item {
        z-index: 0;
        position: relative;
        overflow: hidden;
        margin-bottom: 0;
        cursor: pointer;
        padding: 16px;
        border-top: 1px solid;
        border-bottom: 1px solid;
        display: flex;
    }

    main section.devices .devices-list-item .background {
        z-index: -1;
        position: absolute;
        top: 4px;
        right: 4px;
        bottom: 4px;
        left: 4px;
        filter: blur(50px);
        opacity: 0.7;
        transition: background-color 0.25s linear;
    }

    main section.devices .devices-list-item .online-indicator {
        position: absolute;
        top: 8px;
        left: 8px;

        padding: 2px;
        border-radius: 50%;
        filter: blur(2px);
        border: 1px solid var(--background-color);
        background-color: var(--card-background-color);
    }

    main section.devices .devices-list-item .online-indicator .online-indicator__inner {
        background-color: red;
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    main section.devices .devices-list-item .online-indicator.online .online-indicator__inner {
        background-color: #00ff00;
    }

    main section.devices .devices-list-item.checked .background {
        background-color: var(--primary);
    }

    main section.devices .devices-list-item .content {
        width: 100%;
        position: relative;
    }

    main section.devices .devices-list-item .content .devices-list-item__address {
        padding: 8px;
        user-select: none;
    }

    main section.devices .devices-list-item.checked .content .devices-list-item__address {
        transition: color 0.25s linear;
    }

    main section.devices .devices-list-item.checked .content .devices-list-item__address {
        color: var(--primary-inverse);
    }

    main section.devices .devices-list-item .content .devices-list-item__color-preview {
        width: fit-content;
        margin: 0 8px;
        padding: 6px;
        font-size: 0.75rem;
    }

    main section.devices .devices-list-item .actions {
        display: flex;
        align-items: center;
    }

    main section.devices .devices-list-item .actions .settings {
        width: 45px;
    }

    main section.devices .devices-list-item .actions .settings button {
        margin: 0;
        padding: calc(var(--spacing) / 2);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    main section.control .actions {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }

    main section.control .actions button {
        width: calc(32px + var(--spacing) + var(--spacing));
        box-shadow: none;
    }

    main section.control .actions button.add-item {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    main section.control .actions button.remove-item {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
    }

    main section.control .actions button .icon {
        width: 32px;
        height: 32px;
        color: inherit;
    }

    footer {
        z-index: 2;

        position: absolute;
        height: 60px;
        right: 0;
        bottom: 0;
        left: 0;

        padding: calc(var(--spacing) / 2);

        border-top: 1px solid var(--muted-border-color);
        background-color: var(--background-color);
    }

    footer > div {
        display: inline-flex;
        width: 100%;
        height: 100%;
    }

    footer > div button {
        width: 5rem;
        height: 100%;
        margin: 0;
        padding: calc(var(--spacing) / 3);
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        box-shadow: none;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
