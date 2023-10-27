<script>
    import {
        Button,
        Dialog,
        DialogFooter,
        DialogHeader,
        Label,
    } from "svelte-css";
    import { States } from "../../../lib";

    /***********
     * Bindings
     ***********/

    /** @type {Dialog} */
    let dialog;

    /**********************
     * Vaiable Definitions
     **********************/

    let host = "";
    let port = 0;

    /****************
     * Store: server
     ****************/

    const server = States.server.create();
    $: server && server.subscribe((server) => {
        host = server.host;
        port = server.port;
    })

    /******************************
     * Function Export Definitions
     ******************************/

    export async function open() {
        dialog.showModal();
    }

    export async function close() {
        dialog.close();
    }

    /***********************
     * Function Definitions
     ***********************/

    async function clickSubmit() {
        server.set(host, port);
        close();
    }
</script>

<Dialog bind:this={dialog}>
    <DialogHeader
        title="Settings"
        on:close={() => close()}
    />

    <section>
        <!-- TODO: theme picker, server:host, server:port -->
        <Label
            class="has-margin"
            secondaryText="Api Server Host"
        >
            <input type="number" />
        </Label>

        <Label
            class="has-margin"
            secondaryText="Api Server Port"
        >
            <input type="number" />
        </Label>
    </section>

    <DialogFooter>
        <Button
            color="primary"
            variant="full"
            on:click={() => clickSubmit()}
        >OK</Button>
    </DialogFooter>
</Dialog>
