import { defineStore } from "pinia";
import backend_latent_diffusion from "@/backends/gradio/latent-diffusion.json";

export const useBackendStore = defineStore({
  id: "backends",
  state: () => ({
    current_id: 0,
    configs: [backend_latent_diffusion],
  }),
  getters: {
    current: (state) => state.configs[state.current_id],
  },
  actions: {},
});
