import c from "../constants.json";

import { States } from "../../lib";

/**
 * @typedef ApiDevicePinNumber
 * @type {number}
 *
 * @typedef ApiDevicePinDuty
 * @type {number}
 *
 * @typedef ApiDevicePin
 * @type {{
 *  duty: ApiDevicePinDuty;
 *  pin: ApiDevicePinNumber;
 * }}
 *
 * @typedef ApiDevice
 * @type {{
 *  host: string;
 *  port: number;
 *  data: ApiDevicePin[];
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
 * @param {ApiDevice} device
 * @returns {ApiDevicePinDuty[]}
 */
export function getColorArray(device) {
    return device.data.map(pin => pin.duty);
}

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

    await handleError(r, url);
}

/**
 * @param {ApiColor} color 
 * @param {...ApiDevice} devices
 */
export async function setColor(color, ...devices) {
    /** @type {ApiColorRequest} */
    const data = {
        addr: devices.map(d => `${d.host}:${d.port}`),
        color: color,
    };

    const url = `${server.getOrigin()}${c.route.color}`;
    const r = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!r.ok) {
        return await handleError(r, url);
    }
}

/**
 * @param {Response} response
 * @param {string} url 
 */
async function handleError(response, url) {
    let m = await response.text();
    if (m) throw `request error: "${url}" [${response.status}]: ${m}`;

    throw `request error: "${url}" [${response.status}]`;
}
