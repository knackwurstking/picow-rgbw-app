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
        <div class="flex justify-end">
            <div class="ui-group" style="font-size: 1.25em;">
                <Button.Icon
                    ghost
                    on:click={async () => colorStorage.add({ r, g, b })}
                >
                    <AddIcon />
                </Button.Icon>

                <Button.Icon
                    color="destructive"
                    ghost
                    on:click={async () => colorStorage.remove({ r, g, b })}
                >
                    <TrashIcon />
                </Button.Icon>
            </div>
        </div>

        <div
            class="data"
        >
            <figure>
                <div
                    class="flex row wrap"
                    style={
                        "padding: calc(var(--spacing) / 2);" +
                        "height: 100%"
                    }
                >
                    {#each $colorStorage as c}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                            class="color has-border"
                            class:checked={
                                $color.r === c.r &&
                                $color.g === c.g &&
                                $color.b === c.b
                            }
                            style={
                                "height: 4em;" +
                                "width: 4em;" +
                                "margin: calc(var(--spacing) / 2);" +
                                "padding: calc(var(--spacing) / 1.5);" +
                                "cursor: pointer;"
                            }
                            on:click={() => color.set(Api.newColor(c.r, c.g, c.b))}
                        >
                            <div
                                class="background has-border is-max"
                                style={
                                    `background-color: rgb(${c.r * 2.55}, ${c.g * 2.55}, ${c.b * 2.55});` +
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
        transition:
            border-color .25s linear,
            box-shadow .25s linear;
    }

    .color-storage .data .color.checked {
        border-color: hsl(var(--primary)) !important;
        box-shadow:
            inset 0 0 .25em hsl(var(--primary)),
            0 0 .25em hsl(var(--primary));
    }

    .color-storage .data .color.checked .background {
        border-color: hsl(var(--primary));
    }
</style>
