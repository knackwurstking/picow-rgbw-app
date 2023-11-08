<script>
    import AddIcon from "svelte-material-icons/PlusCircleOutline.svelte";
    import TrashIcon from "svelte-material-icons/TrashCanOutline.svelte";

    import {
        Button,
    } from "svelte-css";

    import { States, Api } from "../lib";

    /******************************
     * Variable Export Definitions
     ******************************/

    export let r;
    export let g;
    export let b;

    /***************
     * Store: color
     ***************/

    let color = States.color.create();

    /**********************
     * Store: colorStorage
     **********************/

    let colorStorage = States.colorStorage.create();
</script>

<article class="color-storage">
    <section class="header">
        <h2>Color Storage</h2>
    </section>

    <section>
        <div class="actions has-margin" style="display: flex; justify-content: flex-end;">
            <div class="group" style="font-size: 1.5em;">
                <Button.Icon
                    on:click={async () => colorStorage.add({ r, g, b })}
                >
                    <AddIcon width="100%" height="100%" />
                </Button.Icon>

                <Button.Icon
                    color="destructive"
                    on:click={async () => colorStorage.remove({ r, g, b })}
                >
                    <TrashIcon width="100%" height="100%" />
                </Button.Icon>
            </div>
        </div>

        <div
            class="data"
            style={
                "border: var(--border-width) solid hsl(var(--border));" +
                "border-radius: var(--radius);"
            }
        >
            <figure>
                <div
                    style={
                        "display: flex;" +
                        "flex-wrap: wrap;" +
                        "flex-direction: row;" +
                        "padding: calc(var(--spacing) / 2);" +
                        "height: 100%"
                    }
                >
                    {#each $colorStorage as c}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                            class="color has-small-margin has-small-padding"
                            class:checked={
                                $color.r === c.r &&
                                $color.g === c.g &&
                                $color.b === c.b
                            }
                            style={
                                "flex-shrink: 0;" +
                                "height: 4em;" +
                                "width: 4em;" +
                                "margin: calc(var(--spacing) / 4);" +
                                "border: var(--border-width) solid hsl(var(--border));" +
                                "border-radius: var(--radius);" +
                                "cursor: pointer;"
                            }
                            on:click={() => color.set(Api.newColor(c.r, c.g, c.b))}
                        >
                            <div
                                class="background"
                                style={
                                    `background-color: rgb(${c.r * 2.55}, ${c.g * 2.55}, ${c.b * 2.55});` +
                                    "width: 100%; height: 100%;" +
                                    "border-radius: var(--radius);"
                                }
                            />
                        </div>
                    {/each}
                </div>
            </figure>
        </div>
    </section>
</article>

<style>
    .color-storage .data .color,
    .color-storage .data .color .background {
        transition: border-color .25s linear;
    }

    .color-storage .data .color.checked,
    .color-storage .data .color.checked .background {
        border-color: hsl(var(--primar)) !important;
    }
</style>
