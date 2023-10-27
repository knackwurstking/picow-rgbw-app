import { writable } from "svelte/store";

import * as api from "../../api";

/**
 * @typedef Device
 * @type {import("../../api").Device}
 */

/** @type {import("svelte/store").Writable<Device[]>} */
const devices = writable([]);

api.getDevices()
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

        console.error(err);
    });

export function create() {
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
