<script>
  import { fly, fade } from "svelte/transition";
  import { stats } from "../stores.js";

  function resetStorage() {
    UIkit.modal
      .confirm(
        `<h1 class='uk-heading-small'>Reset Storage</h1>Are you sure that you would like to reset storage?<br/><br/><em>Note: This cannot be undone.</em>`
      )
      .then(
        () => {
          localStorage.clear();
          return UIkit.notification(
            "<div class='uk-text-center'><span uk-icon='icon: database'></span> Storage Reset</div>",
            {
              status: "danger",
              pos: "bottom-center",
              timeout: 3000
            }
          );
        },
        () => {
          return false;
        }
      );
  }
</script>

<div id="nerdStats" uk-offcanvas="overlay: true">
  <div class="uk-offcanvas-bar uk-width-1-2@s uk-width-1-3@m">
    <button class="uk-offcanvas-close" type="button" uk-close />
    <h2 class="uk-heading-small">Nerd Stats</h2>
    {#if $stats.length > 0}
      <dl class="uk-description-list">
        {#each $stats as stat}
          <dt class="uk-text-emphasis">{stat.name}</dt>
          <dd class="uk-margin-left uk-margin-right">
            {@html stat.value}
          </dd>
          <hr />
        {/each}
      </dl>
    {/if}
    <p>The following technologies were used to build this application.</p>
    <div class="uk-flex uk-flex-around uk-flex-middle uk-margin">
      <a href="https://www.electronjs.org/" target="_blank">
        <img
          data-src="images/electron.png"
          width="64"
          height="64"
          alt="electron"
          uk-img
          uk-tooltip="Electron.js" />
      </a>
      <a href="https://getuikit.com/" target="_blank">
        <img
          data-src="images/uikit.png"
          width="64"
          height="64"
          alt="uikit"
          uk-img
          uk-tooltip="UIkit" />
      </a>
      <a href="https://svelte.dev/" target="_blank">
        <img
          data-src="images/svelte.png"
          width="64"
          height="64"
          alt="svelte"
          uk-img
          uk-tooltip="Svelte" />
      </a>
    </div>
    <button
      class="uk-button uk-button-danger uk-margin-medium-top uk-width-1-1"
      on:click={resetStorage}>
      Reset Storage
    </button>
  </div>
</div>
