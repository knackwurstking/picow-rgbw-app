import c from "../constants.json";
import { Api, States } from "..";

/**
 * @typedef ServerData
 * @type {import("../states/server").StateServerData}
 *
 * @typedef ApiDevice
 * @type {import(".").ApiDevice}
 */

const devices = States.devices.create();

/** @type {boolean} */
export let connected = false;
export let reconnectInterval = 1250;

/** @type {WebSocket | undefined} */
let ws;
let interval;

export const events = {
    devices: {
        updated: "devices updated",
    },

    device: {
        error: "device error",
        online: "device online",
        offline: "device offline",
    },

    color: {
        changed: "color changed",
    },
};

/**
 * @param {ServerData} server
 */
export function connect(server) {
    const fetchDevices = async () => {
        try {
            const result = await Api.getDevices(server)
            devices.set(result.map(
                /** @param {ApiDevice} r */
                (r) => ({
                    ...r,
                    name: localStorage.getItem(`deviceName:${r.host}:${r.port}`) || "",
                })
            ) || []);
        } catch (err) {
            // TODO: Notification
            devices.set([]);

            console.warn("[main]", err);
        }
    }

    const connectToServer = () => {
        if (interval) clearInterval(interval);
        if (connected) ws.close();
        if (!server.host && !server.port) return;

        const url = `ws://${server.host}:${server.port}${c.route.events}`;
        ws = new WebSocket(url);

        ws.onopen = (ev) => {
            console.debug(`[api/ws] connection established to "${url}"`);
            console.debug("[api/ws]", ev);

            fetchDevices();

            ws.onmessage = (ev) => {
                console.debug("[api/ws] message received")
                console.debug("[api/ws]", ev)
            };
        };

        ws.onerror = (ev) => {
            console.debug(`[api/ws] connection error to "${url}`)
            console.debug("[api/ws]", ev)

            ws.close();
        };

        ws.onclose = (ev) => {
            console.debug(`[api/ws] close connection to "${url}`)
            console.debug("[api/ws]", ev)

            ws.close();
            connected = true;

            interval = setInterval(
                () => connectToServer(),
                reconnectInterval
            );
        };
    }

    connectToServer();
}

/**
 * @param {string} event
 * @param {(data: any) => void|Promise<void>} listener 
 */
export function on(event, listener) {
    // TODO: ...
}

/**
 * @param {string} event
 * @param {(data: any) => void|Promise<void>} listener 
 */
export function off(event, listener) {
    // TODO: ...
}
