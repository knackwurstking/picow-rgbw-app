<script>
    import c from "../../constants.json";

    import {
        Button,
        Dialog,
        Text,
    } from "svelte-css";

    import { States } from "../../../lib";

    /***********
     * Bindings
     ***********/

    /** @type {Dialog.Root} */
    let dialog;

    /**********************
     * Vaiable Definitions
     **********************/

    let host = c.server.host;

    let invalidPort;
    let port = c.server.port;
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

<Dialog.Root bind:this={dialog}>
    <Dialog.Header
        title="Settings"
        on:close={() => close()}
    />

    <section>
        <!-- TODO: theme picker -->
        <Text.Label
            class="has-margin"
            secondary="Api Server Host"
        >
            <input bind:value={host} />
        </Text.Label>

        <Text.Label
            class="has-margin"
            secondary="Api Server Port"
        >
            <input type="number" min={0} max={65535} bind:value={port} aria-invalid={invalidPort}/>
        </Text.Label>
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
