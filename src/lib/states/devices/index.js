import c from "../../constants.json";
import { writable, get } from "svelte/store";

/**
 * @typedef ApiDevice
 * @type {import("../../api").ApiDevice}
 *
 * @typedef StateDevices
 * @type {import("svelte/store").Writable<ApiDevice[]>}
 */

/** @type {StateDevices} */
const devices = writable(c.devices);

devices.subscribe((devices) => {
    console.debug("[store: devices] data changed");
    console.table(devices);
});

export function create() {
    /**
     * @param {ApiDevice} device
     */
    function getName(device) {
        return localStorage.getItem(`deviceName:${device.host}:${device.port}`) || "";
    }

    /**
     * @param {ApiDevice} device
     * @param {string} name
     */
    function setName(device, name) {
        const k = `deviceName:${device.host}:${device.port}`;
        if (!name) localStorage.removeItem(k);
        else localStorage.setItem(k, name);
    }

    /**
     * @param {ApiDevice} device
     */
    function updateDevice(device) {
        devices.update((data) => {
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                if (d.host === device.host && d.port === device.port) {
                    data[i] = device;
                }
            }

            return data;
        });
    }

    return {
        ...devices,
        getName,
        setName,
        updateDevice,
    };
}
