import c from "../../constants.json";

import { writable } from "svelte/store";

/**
 * @typedef Device
 * @type {import("../../api").Device}
 *
 * @typedef StateDevices
 * @type {import("svelte/store").Writable<Device[]>}
 */

/** @type {StateDevices} */
const devices = writable(c.devices);

devices.subscribe((devices) => {
    console.debug("[store: devices] data changed");
    console.table(devices);
});

export function create() {
    /**
     * @param {Device} device
     */
    function getName(device) {
        return localStorage.getItem(`deviceName:${device.host}:${device.port}`) || "";
    }

    /**
     * @param {Device} device
     * @param {string} name
     */
    function setName(device, name) {
        const k = `deviceName:${device.host}:${device.port}`;
        if (!name) localStorage.removeItem(k);
        else localStorage.setItem(k, name);
    }

    return {
        ...devices,
        getName,
        setName,
    };
}
