<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let brightnessMin = 1;
  export let brightnessMax = 100;

  // NOTE: It seems that svelte prevents the endless loop for `setBrightness*` and `setColor*`
  //  - if rgb changes brightness will be updated
  //  - if brightness changes rgb will be updated

  /** @type {number} In range between 5 to 100 (%) */
  export let r = 100;
  $: r >= 0 && setBrightnessForColor(r, g, b);
  /** @type {number} In range between 0 to 100 (%) */
  export let g = 100;
  $: g >= 0 && setBrightnessForColor(r, g, b);
  /** @type {number} In range between 0 to 100 (%) */
  export let b = 100;
  $: b >= 0 && setBrightnessForColor(r, g, b);

  /** @type {number} In range between 0 to 100 (%) */
  export let brightness = Math.min(r, g, b);
  $: brightness > 0 && setColorForBrightness(brightness);

  /**
   *
   * @param {number} r - Number in range between 0 to 100 (%)
   * @param {number} g - Number in range between 0 to 100 (%)
   * @param {number} b - Number in range between 0 to 100 (%)
   */
  function setBrightnessForColor(r, g, b) {
    const rgb = [r, g, b].filter((c) => c > 0);
    brightness = Math.min(...rgb);
    dispatch("change", {
      r: r >= 0 ? r : 0,
      g: g >= 0 ? g : 0,
      b: b >= 0 ? b : 0,
      w: r === g && r === b ? r : 0,
    });
  }

  /**
   *
   * @param {number} brightness - Number in range between 0 to 100 (%)
   */
  function setColorForBrightness(brightness) {
    const rgb = [r, g, b].filter((c) => c > 0);

    const currentMin = Math.min(...rgb);
    const currentMax = Math.max(...rgb);

    let handleWhite = false;
    if (currentMin === currentMax) handleWhite = true;

    const diff = currentMin - brightness;
    if (rgb.find((color) => color - diff > 100)) {
      const rest = 100 - currentMax;
      if (r > 0) r += rest;
      if (g > 0) g += rest;
      if (b > 0) b += rest;
    } else {
      if (r > 0) r -= diff;
      if (g > 0) g -= diff;
      if (b > 0) b -= diff;
    }

    dispatch("change", {
      r: r >= 0 ? r : 0,
      g: g >= 0 ? g : 0,
      b: b >= 0 ? b : 0,
      w: r === g && r === b ? r : 0,
    });
  }
</script>

<article>
  <label for="brightness"
    >Brightness <code>{brightness}</code>
    <input
      name="brightness"
      type="range"
      min={brightnessMin}
      max={brightnessMax}
      bind:value={brightness}
    />
  </label>

  <label for="r"
    >R <code>{r}</code>
    <input name="r" type="range" min={0} max={100} bind:value={r} />
  </label>

  <label for="g"
    >G <code>{g}</code>
    <input name="g" type="range" min={0} max={100} bind:value={g} />
  </label>

  <label for="b"
    >B <code>{b}</code>
    <input name="b" type="range" min={0} max={100} bind:value={b} />
  </label>
</article>
