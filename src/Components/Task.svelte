<script>
  export let object;

  import { tasks, active } from "../stores.js";

  function editTask(object) {
    const name = UIkit.modal.prompt("Edit Task", object.name).then(text => {
      if (text !== object.name && text !== null) {
        const target = $tasks.filter(task => task.name === object.name)[0];
        target.name = text;
        target.dateModified = Date.now();
        $tasks = [...$tasks];
        return UIkit.notification(
          "<div class='uk-text-center'><span uk-icon='icon: file-edit'></span> Task Edited</div>",
          {
            status: "primary",
            pos: "bottom-center",
            timeout: 1500
          }
        );
      } else {
        return false;
      }
    });
  }

  function deleteTask(object) {
    UIkit.modal
      .confirm(
        `<h1 class='uk-heading-small'>Delete Task</h1>Are you sure that you would like to delete <b>${object.name}</b>?<br/><br/><em>Note: This cannot be undone.</em>`
      )
      .then(
        () => {
          const refId = $tasks.findIndex(obj => obj.name === object.name);
          $tasks.splice(refId, 1);
          $tasks = [...$tasks];
          return UIkit.notification(
            "<div class='uk-text-center'><span uk-icon='icon: close'></span> Task Deleted</div>",
            {
              status: "danger",
              pos: "bottom-center",
              timeout: 1500
            }
          );
        },
        () => {
          return false;
        }
      );
  }
</script>

<style>
  a[uk-icon="icon: close"]:hover {
    color: #ff0000;
  }

  a[uk-icon="icon: check"]:hover {
    color: #11ca00;
  }

  .custom_taskname {
    font-family: "Annie Use Your Telescope", cursive;
  }
</style>

<li data-tags={object.project}>
  <!--<li data-tags={object.project} data-object={JSON.stringify(object)}>-->
  <form
    class="uk-card uk-card-default uk-card-body uk-flex uk-flex-between
    uk-flex-middle uk-width-3-4@s uk-width-2-3@m uk-width-1-2@l uk-margin-auto
    uk-box-shadow-small">
    {#if $active === 'All Tasks'}
      <span
        class="uk-label uk-margin-right"
        uk-tooltip="title: Project Name; pos: right; delay: 500;">
        {object.project}
      </span>
    {/if}
    <div class="uk-flex-1">
      <span class="custom_taskname uk-text-large">
        {@html object.name}
      </span>
    </div>
    <ul class="uk-iconnav uk-padding-remove">
      <li>
        <a
          href="#"
          uk-icon="icon: check"
          uk-tooltip="title: Mark Complete; pos: top; delay: 1000;"
          on:click={editTask(object)} />
      </li>
      <li>
        <a
          href="#"
          uk-icon="icon: pencil"
          uk-tooltip="title: Edit Task; pos: top; delay: 1000;"
          on:click={editTask(object)} />
      </li>
      <li>
        <a
          href="#"
          uk-icon="icon: close"
          uk-tooltip="title: Delete Task; pos: top; delay: 1000;"
          on:click={deleteTask(object)} />
      </li>
    </ul>
  </form>
</li>
