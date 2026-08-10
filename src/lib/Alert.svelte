<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { mergeClass } from "./utils";

  type Variant = "green" | "red";

  interface Props extends HTMLAttributes<EventTarget> {
    variant?: Variant;
  }

  const { class: className, variant, children, ...restProps }: Props = $props();
</script>

<div {...restProps} class={mergeClass(variant, className?.toString())}>
  {@render children?.()}
</div>

<style lang="scss">
  @use "$assets/variables" as *;

  div {
    padding: 12px;
    border-radius: 192px;
    width: 66.666667%;
    font-size: 18px;
    line-height: 28px;
    text-align: center;

    &.green {
      background-color: #748e54;
      color: $secondary-color;
    }

    &.red {
      background-color: #7b2d26;
      color: $secondary-color;
    }
  }
</style>
