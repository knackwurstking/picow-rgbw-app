import { writable } from "svelte/store";

/**
 * @typedef Color
 * @type {{
 *  r?: number;
 *  g?: number;
 *  b?: number;
 *  w?: number;
 * }}
 *
 * @typedef StateColorStorage
 * @type {import("svelte/store").Writable<Color[]>}
 */

const storageKey = "colorStorage";

/** @type {StateColorStorage} */
const colorStorage = writable((() => {
    return JSON.parse(
        localStorage.getItem(storageKey) ||
            JSON.stringify([{ r: 100, g: 100, b: 100, w: 100 }])
    );
})());

colorStorage.subscribe((cs) => {
    localStorage.setItem(storageKey, JSON.stringify(cs));
});

export function create() {
    /**
     * @param {Color} color
     */
    function add({ r = 0, g = 0, b = 0, w = 0} = {}) {
        colorStorage.update((cs) => {
            const i = cs.findIndex(c => c.r === r && c.g === g && c.b === b && c.w === w);
            if (i === -1) {
                cs.push({ r, g, b, w });
            }

            return cs;
        });
    }

    /**
     * @param {Color} color
     */
    function remove({ r = 0, g = 0, b = 0, w = 0 } = {}) {
        colorStorage.update((cs) => {
            const i = cs.findIndex(c => c.r === r && c.g === g && c.b === b && c.w === w);
            if (i > -1) {
                cs = [
                    ...cs.slice(0, i),
                    ...cs.slice(i+1),
                ];
            }

            return cs;
        });
    }

    return {
        ...colorStorage,
        add,
        remove,
    };
}
