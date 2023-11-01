import { writable } from "svelte/store";

/**
 * @typedef StateColor
 * @type {import("svelte/store").Writable<import("../../api").Color>}
 */

const storageKey = "color";

/** @type {StateColor} */
const color = writable((() => {
    return JSON.parse(
        localStorage.getItem(storageKey) ||
            '{ "r": 100, "g": 100, "b": 100 }'
    );
})());

color.subscribe((cs) => {
    localStorage.setItem(storageKey, JSON.stringify(cs));
});

export function create() {
    return {
        ...color,
    };
}
