export * from "./api";
export * as WebSocket from "./ws";

/**
 * @typedef DevicePinNumber
 * @type {number}
 *
 * @typedef DevicePinDuty
 * @type {number}
 *
 * @typedef DevicePin
 * @type {{
 *  duty: DevicePinDuty;
 *  pin: DevicePinNumber;
 * }}
 *
 * @typedef Device
 * @type {{
 *  host: string;
 *  port: number;
 *  data: DevicePin[];
 *  offline: boolean;
 * }}
 *
 * @typedef Color
 * @type {{
 *  r: DevicePinDuty;
 *  g: DevicePinDuty;
 *  b: DevicePinDuty;
 * }}
 *
 * @typedef ColorRequest 
 * @type {{
 *  addr: string[];
 *  color: Color & { w: DevicePinDuty };
 * }}
 */
