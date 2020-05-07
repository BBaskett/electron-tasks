<script>
  import { onMount } from "svelte";
  import { projects, tasks, active } from "../stores.js";

  // Components
  import Task from "./Task.svelte";

  projects.useLocalStorage();
  tasks.useLocalStorage();
  $active = "All Tasks";

  let addActionRadio;

  $: projectTaskCount =
    $active && $active === "All Tasks"
      ? $tasks.length
      : $projects.filter(project => project.name === $active)[0].taskCount;
</script>

<div class="uk-section-xsmall">
  <div class="uk-flex uk-flex-between">
    <ul class="uk-iconnav">
      <li>
        <a href="#" uk-icon="icon: plus" uk-toggle="target: #entryModal" />
      </li>
      {#if $active !== 'All Tasks'}
        <li>
          <a
            href="#"
            uk-icon="icon: pencil"
            uk-toggle="target: #projectModal" />
        </li>
      {/if}
    </ul>
  </div>
</div>

<div class="uk-section-xsmall" uk-filter="target: .js-filter">
  {#if $projects.length === 0}
    <div class="uk-flex" uk-height-viewport="expand:true">
      <p
        class="uk-heading-small uk-text-danger uk-text-center uk-margin-auto
        uk-margin-auto-top uk-margin-auto-bottom">
        No Projects Exist
        <br />
        <span
          class="uk-text-primary uk-text-small uk-button"
          on:click={newProject}>
          Create a project to begin
        </span>
      </p>
    </div>
  {:else}
    <ul
      class="uk-subnav uk-margin-auto uk-subnav-pill uk-text-small
      uk-background-default uk-padding-small"
      uk-sticky>
      <li
        class="uk-active uk-position-relative"
        on:click={() => ($active = 'All Tasks')}
        uk-filter-control>
        <a href="#">All Tasks</a>
      </li>
      {#each $projects as project, index}
        <li
          class="uk-position-relative"
          uk-filter-control={`[data-tags*="${project.name}"]`}
          data-name={project.name}
          data-taskCount={project.taskCount}
          data-dateCreated={project.dateCreated}
          data-dateModified={project.dateModified}
          on:click={() => ($active = project.name)}>
          <a href="#">{project.name}</a>
        </li>
      {/each}
    </ul>
    <hr class="uk-divider-icon" />
    <p class="uk-text-meta uk-text-right">
      {`Task Count: ${projectTaskCount}`}
    </p>
    {#if $tasks.length > 0}
      <ul id="taskList" class="uk-list js-filter">
        {#each $tasks as task}
          <Task object={task} />
        {/each}
      </ul>
    {:else}
      <div class="uk-flex" uk-height-viewport="expand:true">
        <p
          class="uk-heading-small uk-text-danger uk-text-center uk-margin-auto
          uk-margin-auto-top uk-margin-auto-bottom">
          No tasks in this project
          <br />
          <span
            class="uk-text-primary uk-text-small uk-button"
            on:click={newTask}>
            Add a Task
          </span>
        </p>
      </div>
    {/if}
  {/if}
</div>
