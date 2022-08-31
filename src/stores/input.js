import { defineStore } from "pinia";

export const useInputStore = defineStore({
  id: "input",
  state: () => ({
    prompt: "Cute bunny",
  }),
  getters: {},
  actions: {},
});
