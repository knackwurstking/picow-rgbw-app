<script>
    import {
        Text,
    } from "svelte-css";

    import { States } from "../lib";
    import Device from "./Device.svelte";

    /******************************
     * Variable Export Definitions
     ******************************/

    export let connected;

    /*****************
     * Store: devices
     *****************/

    let devices = States.devices.create();
</script>

<article class="devices">
    <section class="header">
        <h2>Devices</h2>
    </section>

    <section>
        {#if $devices.length > 0}
            <ul class="devices-list">
                {#each $devices as device}
                    <Device {device} {connected} />
                {/each}
            </ul>
        {:else}
            <div class="has-padding is-italic is-text-center">
                <Text.Primary>No Devices</Text.Primary>
            </div>
        {/if}
    </section>
</article>


