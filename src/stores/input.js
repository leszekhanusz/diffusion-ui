import { defineStore } from "pinia";

export const useInputStore = defineStore({
  id: "input",
  state: () => ({
    prompt: "Cute bunny",
    uploaded_image_b64: null,
    init_image_b64: null,
    mask_image_b64: null,
    canvas: null,
  }),
  getters: {},
  actions: {},
});
