import { writable } from "svelte/store";

/**
 * @typedef Themes
 * @type {"system" | "dark" | "light"}
 */

const storageKey = "theme";

/** @type {import("svelte/store").Writable<Themes>} */
// @ts-expect-error
const theme = writable((() => {
    const theme = localStorage.getItem(storageKey) || "system";
    return ["system", "dark", "light"].includes(theme) ? theme : "system";
})());

theme.subscribe((theme) => {
    localStorage.setItem(storageKey, theme);
});

export function createThemeStore() {
    return {
        ...theme,
    };
}
