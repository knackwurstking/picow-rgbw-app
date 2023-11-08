<script>
    import {
        Text,
        Input
    } from "svelte-css";

    /******************************
     * Variable Export Definitions
     ******************************/

    export let brightness;

    export let r;
    export let g;
    export let b;
</script>

<article class="color-picker">
    <section class="header">
        <h2>Color Picker</h2>
    </section>

    <section
        style="user-select: none;"
    >
        <Text.Label
            useLabel
        >
            <Input.Slider
                style={
                    `--slider-color: rgb(${r*2.55}, ${g*2.55}, ${b*2.55});`
                }
                min={0}
                max={100}
                bind:value={brightness}
                on:input={() => {
                    const min = Math.min(...[r, g, b].filter(c => c > 0));
                    const max = Math.max(r, g, b);

                    if (min !== brightness) {
                        let diff = brightness-min;

                        if (max+diff > 100) {
                            diff = 100-max;
                        } else if (min+diff < 1) {
                            diff = 0 - (min-1);
                        }

                        if (min+diff < 1 || max+diff > 100) return;

                        if (r > 0) r = r+diff;
                        if (g > 0) g = g+diff;
                        if (b > 0) b = b+diff;
                    }
                }}
            />
        </Text.Label>

        <hr />

        <Text.Label
            secondary={"R"}
            useLabel
        >
            <code slot="secondary">{r.toString()}</code>
            <Input.Slider
                min={0}
                max={100}
                bind:value={r}
            />
        </Text.Label>

        <Text.Label
            secondary={"G"}
            useLabel
        >
            <code slot="secondary">{g.toString()}</code>
            <Input.Slider
                min={0}
                max={100}
                bind:value={g}
            />
        </Text.Label>

        <Text.Label
            secondary={"B"}
            useLabel
        >
            <code slot="secondary">{b.toString()}</code>
            <Input.Slider
                min={0}
                max={100}
                bind:value={b}
            />
        </Text.Label>
    </section>
</article>

<style>
    .color-picker code {
        transform: translateY(-.05em);
        margin-left: var(--spacing);
    }
</style>
