<script>
    import DeviceSettingsIcon from "svelte-material-icons/DotsVertical.svelte";
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import { Components } from "./lib";
</script>

<main class="container">
    <!-- TODO: 1. devices list, 2. color storage, 3. color picker -->
</main>

<Components.DeviceSettingsDialog />

<style>
    main {
        height: calc(100% - 4em);
    }
</style>
