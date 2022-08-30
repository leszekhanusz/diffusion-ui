import { defineStore } from "pinia";

export const useOutputStore = defineStore({
  id: "output",
  state: () => ({
    loading: false,
    image_b64: null,
    error_message: null,
  }),
  getters: {},
  actions: {},
});
