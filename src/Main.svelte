<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import { Components, States, Api } from "./lib";

    import { Label } from "svelte-css";

    /**
     * @typedef Device
     * @type {import("./lib/api").Device}
     */

    /***********************
     * Variable Definitions
     ***********************/

    /** @type {Device[]} */
    let selected = [];

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create((devices) => {
        Api.getDevices()
            .then((result) => devices.set(
                result.map(
                    /** @param {Device} r */
                    (r) => ({
                        ...r,
                        name: localStorage.getItem(`deviceName:${r.host}:${r.port}`) || "",
                    })
                ) || []
            ))
            .catch((err) => {
                // TODO: Notification
                // FIXME: not a valid url: missing host:port (Need error check and notify)
        
                console.warn("[main]", err);
            });
    });
</script>

<main class="container">
    <!-- TODO: 1. devices list, 2. color storage, 3. color picker -->

    <article class="devices">
        <section class="header">
            <h2>Devices</h2>
        </section>

        <section class="has-padding">
            <!-- TODO: render the devices list here ... -->

            <ul class="devices-list">
                {#each $devices as device}
                    <li
                        class="device"
                        class:checked={
                            !!selected.find(
                                d => (d.host === device.host && d.port === device.port)
                            )
                        }
                    >
                        <div class="background" />
                        <Label
                            class="has-padding"
                            primaryText={device.name}
                            secondaryText={`${device.host}:${device.port}`}
                            useLabel
                        >
                            <input
                                type="checkbox"
                                style="display: none;"
                                on:change={(ev) => {
                                    const i = selected.findIndex(
                                        (d) => (d.host === device.host && d.port === device.port)
                                    );

                                    if (i > -1) {
                                        if (ev.currentTarget.checked) return;

                                        selected = [
                                            ...selected.slice(0, i),
                                            ...selected.slice(i+1),
                                        ];
                                    } else {
                                        if (ev.currentTarget.checked) {
                                            selected = [
                                                ...selected,
                                                device,
                                            ];
                                        }
                                    }
                                }}
                            />
                        </Label>
                    </li>
                {/each}
            </ul>
        </section>
    </article>
</main>

<Components.DeviceSettingsDialog />

<style>
    main {
        height: calc(100% - 3.5em);
    }

    .devices .devices-list .device .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-color: currentColor;
        opacity: 0;

        transition: opacity .25s linear;
    }

    .devices .devices-list .device.checked .background {
        opacity: 0.1;
    }

    .devices .devices-list .device {
        border-bottom: .1em solid hsl(var(--border));
    }

    .devices .devices-list .device:first-child {
        border-top: .1em solid hsl(var(--border));
    }
</style>
