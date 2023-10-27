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

    let invalidPort;
    let port = 50833;
    $: typeof port === "number" && validatePort();

    /****************
     * Store: server
     ****************/

    const server = States.server.create();
    $: server && server.subscribe((server) => {
        host = server.host;
        port = server.port;
    });

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

    async function validatePort() {
        return (port >= 0 && port <= 65535);
    }

    const clickSubmit = () => {
        server.set(host, port);
        close();
    };
</script>

<Dialog bind:this={dialog}>
    <DialogHeader
        title="Settings"
        on:close={() => close()}
    />

    <section>
        <!-- TODO: theme picker -->
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
            <input type="number" min={0} max={65535} bind:value={port} aria-invalid={invalidPort}/>
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
