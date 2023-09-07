<script>
  import { onMount } from "svelte";

  import ColorStorageItem from "./ColorStorageItem.svelte";

  /**
   * @typedef Color
   * @type {import("../js/api").Color}
   */

  /** @type {Color[]} */
  let items = [];

  /** @type {Color | null} */
  export let selected = null;

  function save() {
    localStorage.setItem("color-storage", JSON.stringify(items));
  }

  /**
   *
   * @param {Color} color
   */
  export async function add(color) {
    const _items = items;
    for (let i = 0; i < _items.length; i++) {
      const item = _items[i];
      if (
        item.r === color.r &&
        item.g === color.g &&
        item.b === color.b &&
        item.w === color.w
      ) {
        return;
      }
    }

    items = [color, ..._items];
    save();
  }

  /**
   *
   * @param {Color} color
   */
  export async function remove(color) {
    const _items = items;
    for (let i = 0; i < _items.length; i++) {
      const item = _items[i];
      if (
        item.r === color.r &&
        item.g === color.g &&
        item.b === color.b &&
        item.w === color.w
      ) {
        items = [..._items.slice(0, i), ..._items.slice(i + 1)];
        return remove(color); // NOTE: remove double entries
      }
    }

    save();
  }

  onMount(() => {
    items = JSON.parse(
      localStorage.getItem("color-storage") ||
        `[
            { "r": 100, "g": 100, "b": 100, "w": 100 },
            { "r": 100, "g": 100, "b": 0, "w": 0 }
        ]`
    );
  });
</script>

<article>
  {#each items as item}
    <ColorStorageItem
      checked={selected === item}
      color={item}
      on:click={() => (selected = item)}
    />
  {/each}
</article>

<style>
  article {
    border: 1px solid;
    height: 72px;
    padding: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    margin-top: calc(var(--spacing) / 2);
  }
</style>
