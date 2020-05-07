import { writable } from "svelte/store";

export const active = writable();

const createWritableStore = (key, startValue) => {
  const { subscribe, set } = writable(startValue);

  return {
    subscribe,
    set,
    useLocalStorage: () => {
      const json = localStorage.getItem(key);
      if (json) {
        set(JSON.parse(json));
      }

      subscribe((current) => {
        localStorage.setItem(key, JSON.stringify(current));
      });
    },
  };
};

export const tasks = createWritableStore("Tasks", []);

export const projects = createWritableStore("Projects", []);

export const stats = createWritableStore("Stats", [
  { name: "Storage Usage", value: null },
  { name: "Last Visit", value: null },
  { name: "Longest String", value: null },
  { name: "Favorite Project", value: null },
  { name: "Oldest Project", value: null },
  { name: "Oldest Task", value: null },
]);
