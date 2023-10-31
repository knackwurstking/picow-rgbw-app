import c from "../constants.json";

/**
 * @typedef ApiDevicePinNumber
 * @type {import(".").ApiDevicePinNumber}
 *
 * @typedef ApiDevicePinDuty
 * @type {import(".").ApiDevicePinDuty}
 *
 * @typedef ApiDevicePin
 * @type {import(".").ApiDevicePin}
 *
 * @typedef ApiDevice
 * @type {import(".").ApiDevice}
 *
 * @typedef ApiColor
 * @type {import(".").ApiColor}
 *
 * @typedef ApiColorRequest 
 * @type {import(".").ApiColorRequest}
 *
 * @typedef ServerData
 * @type {import("../states/server").StateServerData}
 */

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
 * @param {ServerData} server
 * @returns {Promise<ApiDevice[]>}
 */
export async function getDevices(server) {
    const url = `${server.protocol}//${server.host}:${server.port}${c.route.devices}`;
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
 * @param {ServerData} server
 * @param {ApiColor} color 
 * @param {...ApiDevice} devices
 */
export async function setColor(server, color, ...devices) {
    /** @type {ApiColorRequest} */
    const data = {
        addr: devices.map(d => `${d.host}:${d.port}`),
        color: addW(color),
    };

    const url = `${server.protocol}//${server.host}:${server.port}${c.route.color}`;
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
