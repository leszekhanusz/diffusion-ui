import { defineStore } from "pinia";

export const useInputStore = defineStore({
  id: "input",
  state: () => ({
    prompt: "Cute bunny",
    width: 256,
    height: 256,
    nb_steps: 50,
    nb_images: 1,
    diversity_scale: 15.0,
  }),
  getters: {},
  actions: {},
});
