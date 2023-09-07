/**
 * @typedef Device
 * @type {import("./event-handler").Device}
 *
 * @typedef Color
 * @type {{
 *  r: number;
 *  g: number;
 *  b: number;
 *  w: number;
 * }}
 */

export default class Api {
  /**
   *
   * @param {string} host
   * @param {number} port
   */
  constructor(host, port) {
    this.server = "";
    this.setServer(host, port);
  }

  /**
   *
   * @param {string} host
   * @param {number} port
   */
  setServer(host, port) {
    this.server = `http://${host}:${port}`;
  }

  /**
   *
   * @returns {Promise<Device[]>}
   */
  async getDevices() {
    const url = `${this.server}/api/v1/devices`;
    const request = await fetch(url);

    let data = [];
    if (request.ok) {
      try {
        data = await request.json();
      } catch (err) {
        throw `Unexpected data from "${url}"`;
      }
      return data;
    }

    let message = await request.text();
    if (message)
      throw `Request Error to "${url}" [${request.status}]: ${message}`;

    throw `Request Error to "${url}": ${request.status}`;
  }

  /**
   *
   * @param {string | string[]} addr - NOTE: "<host>:<port>"
   * @param {Color} color
   */
  async setColor(addr, color) {
    if (Array.isArray(addr))
      if (!addr.length) return;
      else if (!addr) return;

    const data = {
      addr: Array.isArray(addr) ? addr : [addr],
      color: color,
    };

    // Send data to "POST: /api/v1/color"
    const url = `${this.server}/api/v1/color`;
    const request = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (request.ok) {
      return;
    }

    // error response handling
    let message = await request.text();
    if (message)
      throw `Request Error to "${url}" [${request.status}]: ${message}`;

    throw `Request Error to "${url}": ${request.status}`;
  }
}
