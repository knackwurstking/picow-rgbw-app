import { writable, get } from "svelte/store";

/**
 * @typedef Server 
 * @type {{
 *  host: string;
 *  port: number;
 *  protocol: "http:" | "https:";
 * }}
 */

const storageKey = "server";

/** @type {import("svelte/store").Writable<Server>} */
const server = writable((() => {
    const j = localStorage.getItem(storageKey);
    let d;

    try {
        d = JSON.parse(j);
    } catch (err) {
        console.warn(err);
    }

    return {
        host: d?.host || "",
        port: d?.port || 0,
        protocol: d?.protocol || "http:",
    };
})());

server.subscribe((s) => {
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
            host,
            port,
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
