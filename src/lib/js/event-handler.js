/**
 * @typedef Pin
 * @type {{
 *  pin: number;
 *  duty: number;
 * }}
 *
 * @typedef Device
 * @type {{
 *  host: string;
 *  port: number;
 *  data: Pin[];
 *  offline: boolean;
 *  name: string;
 * }}
 */

export default class EventHandler {
  /**
   *
   * @param {string} host
   * @param {number} port
   */
  constructor(host, port) {
    this.events = {
      devicesUpdated: "devices updated",
      deviceError: "device error",
      deviceOffline: "device offline",
      deviceOnline: "device online",
      colorChanged: "color changed",
      wsClose: "websocket close",
      wsOpen: "websocket open",
      wsError: "websocket error",
    };

    this.eventTarget = new EventTarget();

    this.server = "";
    this.serverPath = "/api/v1/events";
    this.webSocket = null;
    this.setServer(host, port);
  }

  _connectWebSocket() {
    this.webSocket = new WebSocket(this.server);

    this.webSocket.onopen = () => {
      console.debug(`ws: onopen: readyState=${this.webSocket.readyState}`);
      this.dispatch(this.events.wsOpen);
    };

    this.webSocket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);

      switch (data.eventName) {
        case this.events.colorChanged:
          /** @type {Device} */
          const device = data.data;
          this.dispatch(this.events.colorChanged, device);
          break;
        default:
          console.error(`Sorry, event "${data.eventName}" not found!`);
      }
    };

    this.webSocket.onclose = (ev) => {
      this.dispatch(this.events.wsClose);

      if (ev.reason)
        console.debug(`ws: onclose, reconnect in a second... (${ev.reason})`);
      else console.debug(`ws: onclose, reconnect in a second...`);

      setTimeout(() => {
        console.debug(`ws: onclose: ...try reconnecting to "${this.server}"`);
        this._connectWebSocket();
      }, 1000);
    };

    this.webSocket.onerror = (ev) => {
      this.dispatch(this.events.wsError);
      this.webSocket.close();
    };
  }

  /**
   *
   * @param {string} host
   * @param {number} port
   */
  setServer(host, port) {
    this.server = `ws://${host}:${port}${this.serverPath}`;
    if (this.webSocket) this.webSocket.close();
    this._connectWebSocket();
  }

  /**
   *
   * @param {string} eventName
   * @param {any} data
   */
  dispatch(eventName, data) {
    if (!Object.values(this.events).includes(eventName))
      throw `eventName not found: "${eventName}"`;
    this.eventTarget.dispatchEvent(
      new CustomEvent(eventName, { detail: data })
    );
  }

  /**
   *
   * @param {(ev: CustomEvent<undefined|null>) => void|Promise<void>} listener
   */
  devicesUpdated(listener) {
    if (!listener) return;
    this.eventTarget.addEventListener(this.events.devicesUpdated, listener);
  }

  /**
   *
   * @param {(ev: CustomEvent<string>) => void|Promise<void>} listener
   */
  deviceError(listener) {
    if (!listener) return;
    this.eventTarget.addEventListener(this.events.deviceError, listener);
  }

  /**
   *
   * @param {(ev: CustomEvent<Device>) => void|Promise<void>} listener
   */
  deviceOffline(listener) {
    if (!listener) return;
    this.eventTarget.addEventListener(this.events.deviceOffline, listener);
  }

  /**
   *
   * @param {(ev: CustomEvent<Device>) => void|Promise<void>} listener
   */
  deviceOnline(listener) {
    if (!listener) return;
    this.eventTarget.addEventListener(this.events.deviceOnline, listener);
  }

  /**
   *
   * @param {(ev: CustomEvent<Device>) => void|Promise<void>} listener
   */
  colorChanged(listener) {
    if (!listener) return;
    this.eventTarget.addEventListener(this.events.colorChanged, listener);
  }
}
