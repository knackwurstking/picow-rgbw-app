<script>
    import { onDestroy, onMount } from "svelte";

    import { States, Api } from "./lib";

    import Devices from "./view/Devices.svelte";
    import ColorStorage from "./view/ColorStorage.svelte";
    import ColorPicker from "./view/ColorPicker.svelte";

    /***************
     * Store: color
     ***************/

    let color = States.color.create();
    $: $color && subscribeToColor();

    /***********************
     * Variable Definitions
     ***********************/

    let cleanUp = [];

    let brightness = 100;

    let r = $color.r;
    let g = $color.g;
    let b = $color.b;
    $: r > -1,g > -1,b > -1 && setColor();
    const setColor = async () => color.set({ r, g, b });

    let connected = false;

    /****************
     * Store: server
     ****************/

    let server = States.server.create();
    $: $server && subscribeToServer();

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();

    /***********************
     * Function Definitions
     ***********************/

    async function subscribeToColor() {
        color.subscribe((color) => {
            if (!color.r && !color.g && !color.b) return;

            r = color.r || 0;
            g = color.g || 0;
            b = color.b || 0;

            brightness = Math.min(...([r, g, b].filter(c => c > 0)));
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

            // TODO: Handle android suspend (websocket takes too long to reconnect)
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

    onMount(() => {
        // NOTE: pause/resume events fired on cordova app (background/foreground)
        document.addEventListener("resume", () => {
            Api.WebSocket.connect($server);
        });
    });

    onDestroy(() => cleanUp.forEach(fn => fn()));
</script>

<main
    class="ui-container"
    style:height="calc(100% - 3.5em)"
    style:overflow-y="auto"
    style:scroll-behavior="smooth"
>
    <Devices {connected} />
    <ColorStorage bind:r bind:g bind:b />
    <ColorPicker bind:brightness bind:r bind:g bind:b />
</main>
