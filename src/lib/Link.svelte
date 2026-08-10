<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import posthog from "./posthog";

  type ColorVariant = "green" | "red";
  type Variant = "icon" | "option-back";

  interface Props extends HTMLAnchorAttributes, Partial<App.PostHogProps> {
    color?: ColorVariant;
    variant?: Variant;
  }

  const {
    color,
    variant,
    onclick,
    onauxclick,
    children,
    postHogEvent,
    postHogConfig,
    ...restProps
  }: Props = $props();

  function posthogCapture() {
    if (!postHogEvent) {
      return;
    }

    posthog.capture(postHogEvent, postHogConfig);
  }
</script>

<a
  {...restProps}
  class={variant && [color ?? "", variant]}
  onclick={(ev) => {
    onclick?.(ev);
    posthogCapture();
  }}
  onauxclick={(ev) => {
    onauxclick?.(ev);
    posthogCapture();
  }}
>
  {@render children?.()}
</a>

<style lang="scss">
  a {
    cursor: pointer;
    color: white;

    border-radius: 12px;
    border-style: none;
    font-size: 16px;
    line-height: 24px;

    &.icon {
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
    }

    &.option-back {
      position: absolute;

      top: 20px;
      left: 20px;

      z-index: 10;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.green {
      background-color: green;
    }

    &.red {
      background-color: red;
    }
  }
</style>
