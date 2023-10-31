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
export const connected = false;
export const reconnectIntervall = 1250;

/** @type {WebSocket | undefined} */
let ws;

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
        const url = `ws://${server.host}:${server.port}${c.route.events}`;
        ws = new WebSocket(url);

        ws.onopen = (ev) => {
            console.debug(`[api/ws] connection established to "ws://${url}"`);
            console.debug("[api/ws]", ev);

            fetchDevices();

            ws.onmessage = (ev) => {
                console.debug("[api/ws] message received")
                console.debug("[api/ws]", ev)
            };
        };

        ws.onerror = (ev) => {
            console.debug(`[api/ws] connection error to "ws://${url}`)
            console.debug("[api/ws]", ev)

            ws.close();
        };

        ws.onclose = (ev) => {
            console.debug(`[api/ws] close connection to "ws://${url}`)
            console.debug("[api/ws]", ev)
            // TODO: reconnect handling if server is offline
        };
    }

    if (connected) {
        ws.close();
    }

    connectToServer();
}

export function on() {
    // TODO: ...
}

export function off() {
    // TODO: ...
}
