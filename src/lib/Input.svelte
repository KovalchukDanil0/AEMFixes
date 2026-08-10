<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import posthog from "./posthog";

    type Props = HTMLInputAttributes & Partial<App.PostHogProps>;

    const {
        onclick,
        onauxclick,
        postHogEvent,
        postHogConfig,
        ...restProps
    }: Props = $props();

    function posthogCapture({
        currentTarget: { checked },
    }: App.EventHandler<HTMLInputElement>) {
        if (!postHogEvent?.[0]) {
            return;
        }

        posthog.capture(postHogEvent, { ...postHogConfig, checked });
    }
</script>

<input
    {...restProps}
    onclick={(ev) => {
        onclick?.(ev);
        posthogCapture(ev);
    }}
    onauxclick={(ev) => {
        onauxclick?.(ev);
        posthogCapture(ev);
    }}
/>
