export * from "./api";
export * from "./ws";

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
