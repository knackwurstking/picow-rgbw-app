import c from "../constants.json";

import { States } from "../../lib";

/**
 * @typedef Device
 * @type {{
 *  host: string;
 *  port: number;
 * }}
 */

const server = States.server.create();

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
