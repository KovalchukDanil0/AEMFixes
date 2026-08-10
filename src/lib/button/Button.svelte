<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { ButtonProps } from ".";
  import posthog from "../posthog";
  import { mergeClass } from "../utils";

  type Props = ButtonProps &
    Omit<HTMLButtonAttributes, "color"> &
    Partial<App.PostHogProps>;

  const {
    class: className,
    color,
    rounded,
    postHogEvent,
    postHogConfig,
    children,
    onclick,
    onauxclick,
    ...restProps
  }: Props = $props();

  function posthogCapture() {
    if (!postHogEvent) {
      return;
    }

    posthog.capture(postHogEvent, postHogConfig);
  }
</script>

<button
  {...restProps}
  class={mergeClass(
    `color-${color}`,
    `rounded-${rounded}`,
    className?.toString(),
  )}
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
</button>

<style lang="scss">
  @use "$assets/variables" as *;

  button {
    cursor: pointer;

    display: flex;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 20px;
    padding-right: 20px;
    flex-direction: row;
    gap: 4px;
    border-style: none;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;

    &:hover {
      transform: scale(1.05);
    }

    &.color {
      &-gray {
        background-color: $secondary-color;
        color: $primary-color;
      }

      &-rich-black {
        background-color: $tertiary-color-1;
      }

      &-light-blue {
        background-color: $tertiary-color-2;
      }

      &-sky-blue {
        background-color: $tertiary-color-3;
        color: $primary-color;
      }

      &-deep-space-blue {
        background-color: $tertiary-color-4;
      }

      &-air-force-blue {
        background-color: $tertiary-color-5;
        color: $primary-color;
      }
    }

    &.rounded {
      &-small {
        border-radius: 8px;
      }

      &-medium {
        border-radius: 12px;
      }

      &-big {
        border-radius: 64px;
      }
    }
  }
</style>
