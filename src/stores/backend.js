import { defineStore } from "pinia";
import backend_latent_diffusion from "@/backends/gradio/latent-diffusion.json";
import backend_stable_diffusion from "@/backends/gradio/stable-diffusion.json";

const backends = [backend_latent_diffusion, backend_stable_diffusion];

backends.forEach(function (backend) {
  backend.inputs.forEach(function (input) {
    input.value = input.default;
  });
});

export const useBackendStore = defineStore({
  id: "backends",
  state: () => ({
    current_id: 1,
    configs: backends,
  }),
  getters: {
    current: (state) => state.configs[state.current_id],
    options: (state) =>
      state.configs.map((backend, index) => ({
        name: backend.name,
        code: index,
      })),
    show_license(state) {
      if (state.current.license_accepted) {
        return false;
      } else {
        if (state.license_html) {
          return true;
        } else {
          return false;
        }
      }
    },
    has_image_input: (state) =>
      state.current.inputs.some((input) => input.type === "image"),
    strength_input: (state) => {
      return state.current.inputs.find((input) => input.id === "strength");
    },
    license: (state) => state.getBackendField("license"),
    license_html: (state) => state.getBackendField("license_html"),
    description: (state) => state.getBackendField("description"),
    doc_url: (state) => state.getBackendField("doc_url"),
    api_url: (state) => state.getBackendField("api_url"),
  },
  actions: {
    acceptLicense() {
      this.current.license_accepted = true;
    },
    findInput(input_id) {
      if (this.current) {
        return this.current.inputs.find((input) => input.id === input_id);
      } else {
        return null;
      }
    },
    getBackendField(field_name) {
      if (this.current) {
        if (this.current[field_name]) {
          return this.current[field_name];
        }
      }
      return "";
    },
    showLicense() {
      this.current.license_accepted = false;
    },
  },
});
