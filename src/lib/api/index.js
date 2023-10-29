import c from "../constants.json";

import { States } from "../../lib";

/**
 * @typedef ApiDevice
 * @type {{
 *  host: string;
 *  port: number;
 * }}
 *
 * @typedef ApiColor
 * @type {{
 *  r: number;
 *  g: number;
 *  b: number;
 * }}
 *
 * @typedef ApiColorRequest 
 * @type {{
 *  addr: string[];
 *  color: ApiColor;
 * }}
 */

const server = States.server.create();

/**
 * @returns {Promise<ApiDevice[]>}
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

/**
 * @param {ApiColor} color 
 * @param {...ApiDevice} devices
 */
export async function setColor(color, ...devices) {
    // TODO: set color for devices
    // build address array (host:port)

    /** @type {ApiColorRequest} */
    const data = {
        addr: devices.map(d => `${d.host}:${d.port}`),
        color: color,
    };
}
