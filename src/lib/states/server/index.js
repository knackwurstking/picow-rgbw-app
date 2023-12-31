import c from "../../constants.json";

import { writable, get } from "svelte/store";

/**
 * @typedef StateServerData
 * @type {{
 *  host: string;
 *  port: number;
 *  protocol: "http:" | "https:";
 * }}
 *
 * @typedef StateServer
 * @type {import("svelte/store").Writable<StateServerData>}
 */

const storageKey = "server";

/** @type {StateServer} */
const server = writable((() => {
    const j = localStorage.getItem(storageKey);
    let d;

    try {
        d = JSON.parse(j);
    } catch (err) {
        console.warn("[store: server]", err);
    }

    return {
        host: d?.host || c.server.host,
        port: d?.port || c.server.port,
        protocol: d?.protocol || "http:",
    };
})());

server.subscribe((s) => {
    console.debug("[store: server] data changed");
    console.table(s);
    localStorage.setItem(storageKey, JSON.stringify(s));
});

export function create() {
    /**
     * @param {string} host
     * @param {number} port 
     * @param {"http:" | "https:"} protocol
     */
    function _set(host, port, protocol = "http:") {
        server.set({
            host: host || "",
            port: port || 0,
            protocol,
        });
    }

    function _get() {
        return get(server);
    }

    function getOrigin() {
        const s = get(server);
        return `${s.protocol}//${s.host}:${s.port}`;
    }

    return {
        ...server,
        set: _set,
        get: _get,
        getOrigin,
    };
}
