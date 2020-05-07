<script>
  import { active, projects, tasks } from "../stores.js";

  let entryOptions = ["Project", "Task"];
  let entryType, entryName, entryProject;

  function modalVisible() {
    document.addEventListener("keyup", function submitOnEnter(e) {
      if (e.keyCode === 13) {
        makeEntry();
        document.removeEventListener("keyup", submitOnEnter);
      }
    });
  }

  function makeEntry() {
    if (entryType === "Project") {
      $projects = [
        ...$projects,
        {
          name: entryName,
          taskCount: 0,
          dateCreated: Date.now(),
          dateModified: Date.now()
        }
      ];
    }
    if (entryType === "Task") {
      $projects.filter(project => project.name === entryProject)[0].taskCount++;
      $projects = [...$projects];
      $tasks = [
        ...$tasks,
        {
          id: Date.now(),
          name: entryName,
          project: entryProject,
          dateCreated: Date.now(),
          dateModified: Date.now()
        }
      ];
    }
    UIkit.notification(
      `<div class='uk-text-center'><span uk-icon='icon: ${
        entryType === "Project" ? "folder" : "check"
      }'></span> ${entryType} Added</div>`,
      {
        status: "primary",
        pos: "bottom-center",
        timeout: 1500
      }
    );
    UIkit.modal("#entryModal").hide();
    return reset();
  }

  function reset() {
    const context = document.querySelector("div#entryModal");
    const inputs = context.querySelectorAll("input");
    inputs.forEach(input => {
      if (input.type === "text") {
        input.value = "";
      }
      if (input.type === "radio") {
        input.checked = false;
      }
      if (input.type === "select") {
        input.value = "Select a project";
      }
      entryType = entryName = entryProject = undefined;
    });
  }
</script>

<div id="entryModal" uk-modal on:shown={modalVisible}>
  <div class="uk-modal-dialog uk-margin-auto-vertical">
    <div class="uk-modal-header">
      <h2 class="uk-modal-title">
        Add Stuff
        <p class="uk-text-meta uk-margin-remove">
          Use this form to add a new project or task
        </p>
      </h2>
    </div>
    <div class="uk-modal-body">
      <div class="uk-flex uk-flex-middle">
        <label
          class="uk-flex-none uk-flex-nowrap uk-margin-small-right uk-text-bold
          uk-width-1-4">
          Entry Type
        </label>
        <div class="uk-form-controls">
          {#each entryOptions as entry}
            <label class="uk-margin-small-right">
              <input
                type="radio"
                class="uk-radio"
                name="entryType"
                bind:group={entryType}
                value={entry} />
              {entry}
            </label>
          {/each}
        </div>
      </div>
      {#if entryType === 'Task'}
        <div class="uk-flex uk-flex-middle uk-margin-top">
          <label
            class="uk-flex-none uk-flex-nowrap uk-margin-small-right
            uk-text-bold uk-width-1-4">
            Project
          </label>
          <select id="entryProject" class="uk-select" bind:value={entryProject}>
            <option value="Select a project" selected disabled>
              Select a project
            </option>
            {#each $projects as project}
              <option value={project.name}>{project.name}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if entryType !== undefined}
        <div class="uk-flex uk-flex-middle uk-margin-top">
          <label
            class="uk-flex-none uk-flex-nowrap uk-margin-small-right
            uk-text-bold uk-width-1-4">
            {entryType} Name
          </label>
          <input
            id="entryName"
            class="uk-input"
            type="text"
            placeholder="Enter a value"
            bind:value={entryName} />
        </div>
      {/if}
    </div>
    <div class="uk-modal-footer uk-text-right">
      <button
        class="uk-button uk-button-default uk-modal-close"
        type="button"
        on:click={reset}>
        Cancel
      </button>
      <button
        class="uk-button uk-button-primary"
        type="button"
        on:click={makeEntry}>
        Add
      </button>
    </div>
  </div>
</div>
