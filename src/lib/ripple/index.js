import "./style.css";

/**
 * @typedef RippleOptions
 * @type {{
 *  mode?: "primary" | "secondary",
 *  reverse?: boolean,
 *  startFromCenter?: boolean,
 * }}
 */

/**
 *
 * @param {MouseEvent} ev
 * @param {HTMLElement} el
 * @param {RippleOptions | null} options
 */
export function add(ev, el, options = null) {
    const rect = el.getBoundingClientRect();

    let cX = ev.clientX - rect.x;
    let cY = ev.clientY - rect.y;

    if (options?.startFromCenter) {
        cX = rect.width / 2;
        cY = rect.height / 2;
    }

    const circle = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${cX - radius}px`;
    circle.style.top = `${cY - radius}px`;

    if (options?.mode) circle.classList.add(options.mode);
    if (options?.reverse) circle.classList.add("ripple__reverse");
    circle.classList.add("ripple");

    const ripple = el.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    el.append(circle);
}
