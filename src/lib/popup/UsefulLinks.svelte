<script lang="ts">
  import { FolderGit2Icon, Wrench } from "@lucide/svelte";
  import { Link } from "..";
</script>

<div class="useful-links">
  <Link href="/options.html" postHogEvent="options_link_clicked">
    <Wrench />
  </Link>

  <Link
    href="https://github.com/KovalchukDanil0/aem-fixes#features"
    target="_blank"
    postHogEvent="guide_link_clicked"
  >
    <FolderGit2Icon />
  </Link>
</div>

<style lang="scss">
  div.useful-links {
    display: flex;
    flex-grow: 1;
    gap: 8px;
    align-items: flex-end;
    width: 100%;
    justify-content: space-between;
  }
</style>
