<script>
    import {
        Button,
        Dialog,
        Text,
        Input,
    } from "svelte-css";
    import { States } from "../..";

    /***********
     * Bindings
     ***********/

    /** @type {Dialog.Root} */
    let dialog;

    /***********************
     * Variable Definitions
     ***********************/

    /** @type {import("../../api").Device | undefined} */
    let device;
    let name = "";

    /*****************
     * State: devices
     *****************/

    const devices = States.devices.create();

    /******************************
     * Function Export Definitions
     ******************************/

    /** @param {import("../../api").Device} d */
    export async function open(d) {
        if (!d) return;
        device = d;
        name = devices.getName(d);
        dialog.showModal();
    }

    export async function close() {
        device = undefined;
        name = "";
        dialog.close();
    }

    /***********************
     * Function Definitions
     ***********************/

    async function clickSubmit() {
        devices.setName(device, name);
        close();
    }
</script>

<Dialog.Root bind:this={dialog}>
    <Dialog.Header
        title="Settings"
        on:close={() => close()}
    />

    <section>
        <Input.Text
            title="Device Name"
            bind:value={name}
            placeholder={`${device?.host}:${device?.port}`}
        />
    </section>

    <Dialog.Footer>
        <Button.Root
            color="primary"
            variant="full"
            on:click={() => clickSubmit()}
        >
            OK
        </Button.Root>
    </Dialog.Footer>
</Dialog.Root>
