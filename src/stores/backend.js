import { defineStore } from "pinia";
import backend_latent_diffusion from "@/backends/gradio/latent-diffusion.json";
import backend_stable_diffusion from "@/backends/gradio/stable-diffusion.json";

export const useBackendStore = defineStore({
  id: "backends",
  state: () => ({
    current_id: 1,
    configs: [backend_latent_diffusion, backend_stable_diffusion],
  }),
  getters: {
    current: (state) => state.configs[state.current_id],
    options: (state) =>
      state.configs.map((backend, index) => ({
        name: backend.name,
        code: index,
      })),
  },
  actions: {},
});
