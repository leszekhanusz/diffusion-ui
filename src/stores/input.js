import { defineStore } from "pinia";
import { useBackendStore } from "@/stores/backend";

export const useInputStore = defineStore({
  id: "input",
  state: () => ({}),
  getters: {
    seed: function () {
      const backend = useBackendStore();

      if (backend.hasInput("seeds")) {
        return backend.getInput("seeds");
      }

      if (backend.hasInput("seed")) {
        return backend.getInput("seed");
      }

      return "";
    },
    seed_is_set: function (state) {
      const seed = state.seed;

      return seed !== -1 && seed !== "";
    },
  },
  actions: {},
});
