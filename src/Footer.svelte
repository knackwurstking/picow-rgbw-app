<script>
    import SettingsIcon from "svelte-material-icons/CogOutline.svelte";

    import {
        Group,
        Button
    } from "svelte-css";

    import { Components } from "./lib";

    /***********************
     * Function Definitions
     ***********************/

    async function clickSettings() {
        // TODO: ...
    }

    async function clickOff() {
        // TODO: ...
    }

    async function clickSet() {
        // TODO: ...
    }
</script>

<footer class="container">
    <Group>
        <Button
            color="secondary"
            variant="outline"
            on:click={() => clickSettings()}
        ><SettingsIcon /></Button>
        <Button
            color="destructive"
            variant="full"
            on:click={() => clickOff()}
        >OFF</Button>
        <Button
            color="primary"
            variant="full"
            on:click={() => clickSet()}
        >ON/SET</Button>
    </Group>
</footer>

<Components.SettingsDialog />

<style>
    footer {
        height: 4em;
    }
</style>
