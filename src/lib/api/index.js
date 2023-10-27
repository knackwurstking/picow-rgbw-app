import * as states from "../states";

/**
 * @typedef Device
 * @type {{
 *  name: string;
 *  host: string;
 *  port: number;
 * }}
 */

const server = states.server.create();

/**
 * @returns {Promise<Device[]>}
 */
export async function getDevices() {
    const url = `${server.getOrigin()}/devices`;

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
