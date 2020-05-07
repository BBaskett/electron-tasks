<script>
  export let name;
  import { stats, tasks, projects } from "./stores";
  import { onMount, beforeUpdate } from "svelte";

  // Components
  import Stats from "./Components/Stats.svelte";
  import List from "./Components/List.svelte";
  import EntryModal from "./Components/EntryModal.svelte";
  import ProjectModal from "./Components/ProjectModal.svelte";

  stats.useLocalStorage();

  let storageUsed = null;

  function oldestTask() {
    let largestDifference = 0;
    let oldest;
    $tasks.forEach(task => {
      const difference = Date.now() - task.dateCreated;
      if (difference > largestDifference) {
        largestDifference = difference;
        oldest = task.name;
      }
    });
    return largestDifference / (1000 * 60 * 60) >= 1
      ? `${oldest}<br/><br/><div class="uk-text-success">${(
          largestDifference /
          (1000 * 60 * 60)
        ).toFixed(0)} hours</div>`
      : `${oldest}<br/><br/><div class="uk-text-success">${(
          largestDifference /
          (1000 * 60 * 60)
        ).toFixed(0)} hour</div>`;
  }

  function oldestProject() {
    let largestDifference = 0;
    let oldest;
    $projects.forEach(project => {
      const difference = Date.now() - project.dateCreated;
      if (difference > largestDifference) {
        largestDifference = difference;
        oldest = project.name;
      }
    });
    return largestDifference / (1000 * 60 * 60) >= 1
      ? `${oldest}<br/><br/><div class="uk-text-success">${(
          largestDifference /
          (1000 * 60 * 60)
        ).toFixed(0)} hours</div>`
      : `${oldest}<br/><br/><div class="uk-text-success">${(
          largestDifference /
          (1000 * 60 * 60)
        ).toFixed(0)} hour</div>`;
  }

  function favoriteProject() {
    let greatestTaskCount = 0;
    let favorite;
    $projects.forEach(project => {
      if (project.taskCount > greatestTaskCount) {
        greatestTaskCount = project.taskCount;
        favorite = project.name;
      }
    });
    return `${favorite}<br/><br/><div class="uk-text-success">(Task Count: ${greatestTaskCount})</div>`;
  }

  function longestString() {
    let stringLength = 0;
    let longest;
    $tasks.forEach(task => {
      if (task.name.length > stringLength) {
        stringLength = task.name.length;
        longest = task.name;
      }
    });
    return `${longest}<br/><br/><div class="uk-text-success">(Characters: ${stringLength})</div>`;
  }

  navigator.storage.estimate().then(({ usage, quota }) => {
    storageUsed = `${((usage / quota) * 100).toFixed(2)}%`;
    $stats = [...$stats];
  });

  function updateStats() {
    return ($stats = [
      {
        name: "Storage Usage",
        value:
          storageUsed !== null
            ? storageUsed
            : "Calculating<div class='uk-margin-small-left' uk-spinner='ratio: 0.5'/>"
      },
      {
        name: "Last Visit",
        value:
          $stats.filter(stat => stat.name === "Last Visit").length > 0
            ? Date(
                $stats.filter(stat => stat.name === "Last Visit")[0].value
              ).toLocaleString()
            : "No Date"
      },
      { name: "Longest String", value: longestString() },
      { name: "Favorite Project", value: favoriteProject() },
      { name: "Oldest Project", value: oldestProject() },
      { name: "Oldest Task", value: oldestTask() }
    ]);
  }

  onMount(() => {
    updateStats();
  });

  beforeUpdate(() => {
    updateStats();
  });

  window.onunload = () => {
    $stats.filter(stat => stat.name === "Last Visit")[0].value = Date.now();
  };
</script>

<style>
  nav.uk-navbar-container {
    background: linear-gradient(to bottom, #0079b5, #00abff);
  }

  nav h1 {
    font-family: "Permanent Marker", cursive;
  }
</style>

<nav class="uk-navbar-container uk-light" uk-navbar>
  <div class="uk-navbar-left">
    <div class="uk-navbar-item">
      <h1 class="uk-heading uk-margin-remove">
        <span>{name}</span>
      </h1>
    </div>
  </div>
  <div class="uk-navbar-right">
    <ul class="uk-navbar-nav">
      <li>
        <a href="#" uk-toggle="target: #nerdStats">Stats</a>
      </li>
    </ul>
  </div>
</nav>
<div class="uk-container">
  <List />
</div>
<Stats />
<EntryModal />
<ProjectModal />
