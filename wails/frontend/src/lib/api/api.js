import c from "../constants.json";

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
 * @param {import(".").Device} device
 * @returns {import(".").DevicePinDuty[]}
 */
export function getColorArray(device) {
    return device.data.map(pin => pin.duty);
}

/**
 * @param {import("../states/server").StateServerData} server
 * @returns {Promise<import(".").Device[]>}
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
 * @param {import("../states/server").StateServerData} server
 * @param {import(".").Color} color 
 * @param {...import(".").Device} devices
 */
export async function setColor(server, color, ...devices) {
    /** @type {import(".").ColorRequest} */
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
 * @param {import(".").Color} c
 * @returns {import(".").Color & { w: import(".").DevicePinDuty }}
 */
function addW(c) {
    return {
        ...c,
        w: !!(Object.values(c).filter(color => color !== c.r)).length
            ? 0 : c.r,
    };
}
