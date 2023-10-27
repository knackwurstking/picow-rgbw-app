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

    /**
     * Store: devices
     */

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
        
                console.warn(err);
            });
    });
</script>

<main class="container is-debug">
    <!-- TODO: 1. devices list, 2. color storage, 3. color picker -->

    <article class="devices">
        <section class="header">
            <h2>Devices</h2>
        </section>

        <section>
            <!-- TODO: render the devices list here ... -->
            <ul class="devices-list">
                {#each $devices as device}
                    <li class="device">
                        <Label
                            primaryText={device.name}
                            secondaryText={`${device.host}:${device.port}`}
                            useLabel
                        >
                            <input type="checkbox" style="display: none;"/>
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
</style>
