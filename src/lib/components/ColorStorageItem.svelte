<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  /**
   * @typedef Color
   * @type {import("../js/api").Color}
   */

  /** @type {Color} */
  export let color;

  export let checked = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class:checked
  style={`background-color: rgb(${color.r * 2.55}, ${color.g * 2.55}, ${
    color.b * 2.55
  });`}
  on:click={() => dispatch("click")}
/>

<style>
  div {
    width: 52px;
    height: 52px;
    margin: 8px 8px;
    border: 2px solid;
    border-radius: var(--border-radius);
    transform: border-color 0.25s linear;
    cursor: pointer;
  }

  div.checked {
    border-color: black;
    box-shadow: 0rem 0rem 0.25rem 0.1rem var(--primary);
  }
</style>
