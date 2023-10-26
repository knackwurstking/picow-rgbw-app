import { writable } from "svelte/store";

import * as api from "../../api";

/**
 * @typedef Device
 * @type {{
 *  name: string;
 *  host: string;
 *  port: number;
 * }}
 *
 * @typedef DeviceName
 * @type {{
 *  name: string;
 *  addr: string;
 * }}
 */

/** @type {import("svelte/store").Writable<Device[]>} */
const devices = writable([]);

api.get("devices")
    .then((result) => devices.set(result || []))
    .catch((err) => {
        // TODO: Notification

        console.error(err);
    });

export function create() {
    /**
     * @param {string} name
     * @param {string} host
     * @param {number} port
     */
    async function setName(name, host, port) {
        const key = `deviceName:${host}:${port}`;

        if (!name) localStorage.removeItem(key);
        else localStorage.setItem(key, name);
    }

    return {
        ...devices,
        setName,
    };
}
