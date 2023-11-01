import c from "../constants.json";
import { Api, States } from "..";

/**
 * @typedef WSMessageData
 * @type {{
 *  eventName: string;
 *  data: any;
 * }}
 */

const devices = States.devices.create();

/** @type {boolean} */
export let connected = false;
export let reconnectInterval = 1250;

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
 * @type {{
 *  [key: string]: ((data: any) => void|Promise<void>)[];
 * }}
 */
const eventListener = {};

/** @type {WebSocket | undefined} */
let ws;
let interval;

/**
 * @param {import("../states/server").StateServerData} server
 */
export async function connect(server) {
    const fetchDevices = async () => {
        try {
            const result = await Api.getDevices(server)
            devices.set(result.map(
                /** @param {Api.Device} r */
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
            console.debug(`[api/ws] connection established to "${url}"`, ev);

            fetchDevices();

            ws.onmessage = (ev) => {
                console.debug("[api/ws] message received");
                /**
                 * @type {WSMessageData}
                 */
                const data = JSON.parse(ev.data);
                dispatch(data.eventName, data.data);
            };
        };

        ws.onerror = (ev) => {
            console.debug(`[api/ws] connection error to "${url}`, ev);

            ws.close();
        };

        ws.onclose = (ev) => {
            console.debug(`[api/ws] close connection to "${url}`, ev);

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
export async function on(event, listener) {
    if (!eventListener[event]) eventListener[event] = [];
    else {
        for (const fn of eventListener[event]) {
            if (fn === listener) return;
        }
    }

    eventListener[event].push(listener);
}

/**
 * @param {string} event
 * @param {(data: any) => void|Promise<void>} listener 
 */
export async function off(event, listener) {
    let index = 0;
    for (let i = 0; i < (eventListener[event] || []).length; i++) {
        if (eventListener[event][i] === listener) {
            index = i;
        }
    }

    eventListener[event] = [
        ...eventListener[event].slice(0, index),
        ...eventListener[event].slice(index+1),
    ];
}

/**
 * @param {string} event
 * @param {any} data
 */
export async function dispatch(event, data) {
    for (const fn of eventListener[event] || []) {
        fn(data);
    }
}
