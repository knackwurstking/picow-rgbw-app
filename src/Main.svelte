<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import { Components } from "./lib";
</script>

<main class="container is-debug">
    <!-- TODO: 1. devices list, 2. color storage, 3. color picker -->

    <article class="devices">
        <section class="header">
            <h2>Devices</h2>
        </section>

        <section>
            <!-- TODO: render the devices list here ... -->
        </section>
    </article>
</main>

<Components.DeviceSettingsDialog />

<style>
    main {
        height: calc(100% - 3.5em);
    }
</style>
