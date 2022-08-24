import { defineStore } from "pinia";

export const usePromptStore = defineStore({
  id: "prompt",
  state: () => ({
    prompt: "Dark Vador playing the guitar in a field",
  }),
  getters: {},
  actions: {
    run() {
      alert(this.prompt);
    },
  },
});
