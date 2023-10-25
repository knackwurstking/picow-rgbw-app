<script>
    import { Button, Dialog, DialogFooter, DialogHeader } from "svelte-css";

    /***********
     * Bindings
     ***********/

    /** @type {Dialog} */
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
        // TODO: write settings to store and close the dialog
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
    </section>

    <DialogFooter>
        <Button
            color="primary"
            variant="full"
            on:click={() => clickSubmit()}
        >OK</Button>
    </DialogFooter>
</Dialog>
