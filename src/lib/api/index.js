import c from "../constants.json";

import { States } from "../../lib";

/**
 * @typedef Device
 * @type {{
 *  name: string;
 *  host: string;
 *  port: number;
 * }}
 */

const server = States.server.create();

server.subscribe((server) => {
    // TODO: update websocket handler
    console.debug("[api] @TODO: server address changed... try to reconnect...");
    console.dir(server);
});

/**
 * @returns {Promise<Device[]>}
 */
export async function getDevices() {
    const url = `${server.getOrigin()}${c.route.devices}`;

    const r = await fetch(url);
    if (r.ok) {
        try {
            return await r.json();
        } catch (err) {
            throw err;
        }
    }

    // error handling
    let m = await r.text();
    if (m) throw `request error: "${url}" [${r.status}]: ${m}`;

    throw `request error: "${url}" [${r.status}]`;
}
