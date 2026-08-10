<script lang="ts" module>
  import "$assets/main.scss";
  import { Link, StarryBackground } from "$lib";
  import { initPosthog } from "$lib/posthog";
  import type { SavedSyncData } from "$lib/storage";
  import { ArrowLeft } from "@lucide/svelte";
  import { noCase, snakeCase } from "change-case";
  import "./style.scss";

  const savedSyncDataInit = await browser.storage.sync.get<SavedSyncData>({
    disCreateWf: false,
    disMothersiteCheck: false,
    enableFilterFix: false,
    enableFunErr: false,
  });
  let savedSyncData = $state(
    Object.entries(savedSyncDataInit)
      .filter(([, val]) => typeof val === "boolean")
      .map((data) => data as [string, boolean]),
  );

  const settingNames: Record<keyof SavedSyncData, string> = {
    disCreateWf: "Disable Create WF Button",
    disMothersiteCheck: "Disable Mothersite Check",
    enableFilterFix: "Enable Filter Fix in Jira",
    enableFunErr: "Enable Funny Errors",
    posthog_distinct_id: "",
    tourSettings: "",
  };

  async function saveSyncData(data: string, idx: number, value: boolean) {
    await browser.storage.sync.set<SavedSyncData>({ [data]: !value });
    savedSyncData[idx][1] = !value;
    console.log(savedSyncData);
  }

  await initPosthog({
    capture_pageview: false,
    autocapture: true,
  });
</script>

<main>
  <div class="background">
    <StarryBackground />
  </div>

  <Link
    variant="option-back"
    href="/popup.html"
    postHogEvent="back_to_popup_link_clicked"
  >
    <ArrowLeft />
  </Link>

  <section class="constellation-wrapper">
    {#if savedSyncData}
      <div class="constellation">
        <!-- Constellation lines -->
        <svg
          class="constellation-lines"
          viewBox="0 0 600 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            class:active={savedSyncData[0]?.[1] && savedSyncData[1]?.[1]}
            x1="90"
            y1="305"
            x2="255"
            y2="105"
          />

          <line
            class:active={savedSyncData[1]?.[1] && savedSyncData[2]?.[1]}
            x1="255"
            y1="105"
            x2="415"
            y2="210"
          />

          <line
            class:active={savedSyncData[2]?.[1] && savedSyncData[3]?.[1]}
            x1="415"
            y1="210"
            x2="510"
            y2="75"
          />

          <line
            class:active={savedSyncData[0]?.[1] && savedSyncData[3]?.[1]}
            x1="90"
            y1="305"
            x2="510"
            y2="75"
          />
        </svg>

        {#each savedSyncData as [name, value], idx (name)}
          <label
            class="star star-{idx + 1}"
            class:active={value}
            title={settingNames[name as keyof typeof settingNames]}
          >
            <p>{settingNames[name as keyof typeof settingNames]}</p>
            <input
              type="checkbox"
              checked={value}
              aria-label={settingNames[name as keyof typeof settingNames]}
              onchange={async () => {
                await saveSyncData(name, idx, value);
              }}
              data-posthog-event="{noCase(snakeCase(name))}_setting_clicked"
            />

            <span class="star-halo"></span>
            <span class="star-core"></span>
          </label>
        {/each}
      </div>
    {/if}
  </section>
</main>

<style lang="scss">
  main {
    position: relative;

    width: 100%;
    height: 100vh;

    overflow: hidden;

    background: #05060d;
  }

  div.background {
    position: absolute;
    inset: 0;

    z-index: -100;

    width: 100%;
    height: 100%;

    overflow: hidden;

    opacity: 0.7;
  }

  .constellation {
    position: relative;

    width: min(650px, 90vw);
    height: min(460px, 65vh);

    &-wrapper {
      position: absolute;
      inset: 0;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    &::before {
      content: "";

      position: absolute;

      inset: 5%;

      border-radius: 50%;

      background: radial-gradient(
        ellipse,
        rgba(102, 92, 210, 0.08),
        transparent 68%
      );

      filter: blur(35px);

      pointer-events: none;
    }

    &-lines {
      position: absolute;

      inset: 0;

      width: 100%;
      height: 100%;

      overflow: visible;

      pointer-events: none;

      line {
        stroke: rgba(190, 194, 220, 0.12);
        stroke-width: 1;

        stroke-dasharray: 2 7;

        transition:
          stroke 500ms ease,
          filter 500ms ease,
          opacity 500ms ease;

        &.active {
          stroke: rgba(176, 165, 255, 0.48);

          filter: drop-shadow(0 0 3px rgba(150, 135, 255, 0.35));
        }
      }
    }
  }

  .star {
    position: absolute;

    z-index: 3;

    display: block;

    width: auto;
    height: 64px;

    cursor: pointer;

    transform: translate(-50%, -50%);

    font-size: 8px;

    /*
       * Remove the checkbox visually but keep it
       * as a real native control.
       */
    input {
      position: absolute;

      width: 1px;
      height: 1px;

      opacity: 0;
      pointer-events: none;
    }

    transition: transform 250ms ease;

    &:hover {
      transform: translate(-50%, -50%) scale(1.18);
    }

    &:focus-within {
      outline: none;

      .star-core {
        box-shadow:
          0 0 4px #fff,
          0 0 12px rgba(180, 170, 255, 1),
          0 0 28px rgba(140, 125, 255, 0.8),
          0 0 0 5px rgba(150, 140, 255, 0.12);
      }
    }

    &-1 {
      left: 15%;
      top: 73%;
    }

    &-2 {
      left: 42.5%;
      top: 25%;
    }

    &-3 {
      left: 69%;
      top: 50%;
    }

    &-4 {
      left: 85%;
      top: 18%;
    }

    &-core {
      position: absolute;

      top: 50%;
      left: 50%;

      width: 4px;
      height: 4px;

      border-radius: 50%;

      background: #4b5063;

      transform: translate(-50%, -50%);

      transition:
        width 450ms ease,
        height 450ms ease,
        background 450ms ease,
        box-shadow 600ms ease;
    }

    &-halo {
      position: absolute;

      top: 50%;
      left: 50%;

      width: 0;
      height: 0;

      border-radius: 50%;

      transform: translate(-50%, -50%);

      background: radial-gradient(
        circle,
        rgba(153, 139, 255, 0.16),
        transparent 68%
      );

      transition:
        width 600ms ease,
        height 600ms ease;
    }
  }

  /*
     * Deliberately asymmetrical.
     * It should feel like an invented constellation,
     * not an actual astronomical constellation.
     */

  .star.active {
    .star-core {
      width: 7px;
      height: 7px;

      background: #f4f1ff;

      box-shadow:
        0 0 4px #fff,
        0 0 11px rgba(197, 188, 255, 1),
        0 0 26px rgba(143, 126, 255, 0.8);
    }

    .star-halo {
      width: 52px;
      height: 52px;
    }
  }

  @keyframes twinkle {
    0% {
      opacity: 0.15;
      transform: scale(0.7);
    }

    50% {
      opacity: 0.45;
    }

    100% {
      opacity: 0.8;
      transform: scale(1.4);
    }
  }
</style>
