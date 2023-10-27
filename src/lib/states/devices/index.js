import c from "../../constants.json";

import { writable } from "svelte/store";

/**
 * @typedef Device
 * @type {import("../../api").Device}
 */

/** @type {import("svelte/store").Writable<Device[]>} */
const devices = writable(c.devices);

/**
 * @param {(devices: import("svelte/store").Writable<Device[]>) => Promise<void>|void} fn
 */
export function create(fn) {
    if (fn) fn(devices);

    /**
     * @param {string} name
     * @param {string} host
     * @param {number} port
     */
    function setName(name, host, port) {
        const key = `deviceName:${host}:${port}`;

        if (!name) localStorage.removeItem(key);
        else localStorage.setItem(key, name);
    }

    return {
        ...devices,
        setName,
    };
}
