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
 *  offline: boolean;
 * }}
 *
 * @typedef ApiColor
 * @type {{
 *  r: ApiDevicePinDuty;
 *  g: ApiDevicePinDuty;
 *  b: ApiDevicePinDuty;
 * }}
 *
 * @typedef ApiColorRequest 
 * @type {{
 *  addr: string[];
 *  color: ApiColor & { w: ApiDevicePinDuty };
 * }}
 */

const server = States.server.create();

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
export function newColor(r, g, b) {
    return {
        r: r || 0,
        g: g || 0,
        b: b || 0,
    };
}

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
    console.log(`[api] get devices from ${url}`);

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
        color: addW(color),
    };

    const url = `${server.getOrigin()}${c.route.color}`;
    console.log(`[api] set color to ${url} for ${data.addr.join(", ")}`);

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

/**
 * @param {ApiColor} c
 * @returns {ApiColor & { w: ApiDevicePinDuty }}
 */
function addW(c) {
    return {
        ...c,
        w: !!(Object.values(c).filter(color => color !== c.r)).length
            ? 0 : c.r,
    };
}
