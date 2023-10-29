<script>
    import {
        Button,
        Dialog,
    } from "svelte-css";

    /***********
     * Bindings
     ***********/

    /** @type {Dialog.Root} */
    let dialog;

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
        // TODO: write device settings to store and close the dialog
        close();
    }
</script>

<Dialog.Root bind:this={dialog}>
    <Dialog.Header
        title="Settings"
        on:close={() => close()}
    />

    <section>
        <!-- TODO: device name change (input) -->
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
