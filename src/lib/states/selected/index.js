import { writable, get } from "svelte/store";

/**
 * @typedef Device
 * @type {import("../devices").ApiDevice}
 *
 * @typedef StateSelected
 * @type {import("svelte/store").Writable<Device[]>}
 */

const storageKey = "selected";

/** @type {StateSelected} */
const selected = writable((() => {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
})());

selected.subscribe((devices) => {
    localStorage.setItem(storageKey, JSON.stringify(devices));
});

export function create() {
    /** @param {Device} d */
    function findIndex(d) {
        const devices = get(selected);
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].host === d.host && devices[i].port === d.port) {
                return i;
            }
        }
        return -1;
    }

    /** @param {Device} d */
    function contains(d) {
        return findIndex(d) > -1;
    }

    /** @param {Device} d */
    function remove(d) {
        const i = findIndex(d);
        if (i > -1) {
            selected.update((devices) => {
                return [
                    ...devices.slice(0, i),
                    ...devices.slice(i+1),
                ];
            })
        }
    }

    /** @param {Device} d */
    function add(d) {
        const i = findIndex(d);
        if (i === -1) {
            selected.update((devices) => {
                return [...devices, d];
            });
        }
    }

    return {
        ...selected,
        findIndex,
        contains,
        remove,
        add,
    };
}
