<script>
  import { active, projects, tasks } from "../stores";

  $: updatedProjectName = $active;

  function modalVisible() {
    document.addEventListener("keyup", function updateOnEnter(e) {
      if (e.keyCode === 13) {
        updateProject();
        document.removeEventListener("keyup", updateOnEnter);
      }
    });
  }

  function updateProject() {
    const existingAttributes = $projects.filter(
      project => project.name === $active
    );
    const refId = $projects.findIndex(obj => obj.name === $active);
    $projects.splice(refId, 1, {
      name: updatedProjectName,
      taskCount: existingAttributes[0].taskCount,
      dateCreated: existingAttributes[0].dateCreated,
      dateModified: Date.now()
    });
    $active = updatedProjectName;
    $projects = [...$projects];
    UIkit.modal("#projectModal").hide();
    UIkit.notification(
      "<div class='uk-text-center'><span uk-icon='icon: folder'></span> Project Updated</div>",
      {
        status: "primary",
        pos: "bottom-center",
        timeout: 1500
      }
    );
    return reset();
  }

  function deleteProject() {
    UIkit.modal
      .confirm(
        `<h1 class='uk-heading-small'>Delete Project</h1>Are you sure that you would like to delete <b>${$active}</b> and all the associated tasks?<br/><br/><em>Note: This cannot be undone.</em>`
      )
      .then(
        () => {
          const refId = $projects.findIndex(obj => obj.name === $active);
          let projectCountRemoved = 0;
          $projects.splice(refId, 1);
          $projects = [...$projects];
          $tasks
            .filter(task => task.project === $active)
            .forEach(task => {
              const refId = $tasks.findIndex(obj => obj.id === task.id);
              $tasks.splice(refId, 1);
              projectCountRemoved++;
            });
          $tasks = [...$tasks];
          $active = "All Tasks";
          UIkit.modal("#projectModal").hide();
          UIkit.notification(
            "<div class='uk-text-center'><span uk-icon='icon: close'></span> Project Deleted</div>",
            {
              status: "danger",
              pos: "bottom-center",
              timeout: 1500
            }
          );
          return reset();
        },
        () => {
          return false;
        }
      );
  }

  function reset() {
    const context = document.querySelector("#projectModal");
    const input = context.querySelector("input");
    return (input.value = $active);
  }
</script>

<div id="projectModal" uk-modal on:shown={modalVisible}>
  <div class="uk-modal-dialog uk-margin-auto-vertical">
    <div class="uk-modal-header">
      <h2 class="uk-modal-title">
        Edit Project
        <p class="uk-text-meta uk-margin-remove">
          Use this form to edit the name of a project or delete it
        </p>
      </h2>
    </div>
    <div class="uk-modal-body">
      <div class="uk-flex uk-flex-middle">
        <label
          class="uk-flex-none uk-flex-nowrap uk-margin-small-right uk-text-bold">
          Project Name
        </label>
        <input class="uk-input" type="text" bind:value={updatedProjectName} />
      </div>
    </div>
    <div class="uk-modal-footer uk-flex uk-flex-between">
      <button
        class="uk-button uk-button-danger"
        type="button"
        on:click={deleteProject}>
        Delete
      </button>
      <div>
        <button
          class="uk-button uk-button-default uk-modal-close"
          type="button"
          on:click={reset}>
          Cancel
        </button>
        <button
          class="uk-button uk-button-primary"
          type="button"
          on:click={updateProject}>
          Update
        </button>
      </div>
    </div>
  </div>
</div>
