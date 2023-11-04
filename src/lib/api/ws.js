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
let timeout;
let interval;
let skipTimeout;

/**
 * @param {import("../states/server").StateServerData} server
 */
export async function connect(server) {
    if (!!timeout) clearTimeout(timeout);
    if (!!interval) clearInterval(interval);
    if (!!ws) {
        skipTimeout = true;
        ws.close();
    }

    const connectToServer = () => {
        if (!!timeout) clearTimeout(timeout);
        if (!server.host && !server.port) return;

        const url = `ws://${server.host}:${server.port}${c.route.events}`;
        try {
            ws = new WebSocket(url);
        } catch (err) {
            console.warn(`[api/ws] Create websocket to "${url}" failed!`, err);
            return;
        }

        let count = 0;
        interval = setInterval(() => {
            if (ws.readyState === 0) {
                count += 1;
            }

            if (count === 5) {
                clearInterval(interval);
                ws.close();
            }
        }, 500);

        ws.onopen = () => {
            console.debug(`[api/ws] connection established to "${url}"`);

            dispatch("open");
            clearInterval(interval);
            fetchDevices(server);

            ws.onmessage = (ev) => {
                console.debug("[api/ws] message received");
                /**
                 * @type {WSMessageData}
                 */
                const data = JSON.parse(ev.data);
                dispatch(data.eventName, data.data || null);
            };
        };

        ws.onerror = () => {
            console.debug(`[api/ws] connection error to "${url}`);
            ws.close();
        };

        ws.onclose = () => {
            clearInterval(interval);
            console.debug(`[api/ws] close connection to "${url}`);

            ws.close();
            dispatch("close");

            if (!skipTimeout) {
                timeout = setTimeout(
                    () => {
                        console.debug(`[api/ws] try to reconnect to ${url}`);
                        connectToServer();
                    },
                    reconnectInterval
                );
            };

            skipTimeout = false;
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

/**
 * @param {import("../states/server").StateServerData} server
 */
async function fetchDevices (server) {
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
