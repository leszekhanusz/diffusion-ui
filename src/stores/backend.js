import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import deepmerge from "deepmerge";
import backend_latent_diffusion from "@/backends/gradio/latent-diffusion.json";
import backend_stable_diffusion from "@/backends/gradio/stable-diffusion.json";
import backend_stable_diffusion_automatic1111 from "@/backends/gradio/stable-diffusion-automatic1111.json";

const backends_json = [
  backend_latent_diffusion,
  backend_stable_diffusion,
  backend_stable_diffusion_automatic1111,
];

backends_json.forEach(function (backend) {
  backend.inputs.forEach(function (input) {
    input.value = input.default;
  });
});

function mergeBackend(storageValue, defaults) {
  // Merging the backend data from the config json file
  // and from the saved values in local storage

  const merged = deepmerge(defaults, storageValue, {
    arrayMerge: function (defaultArray, storageArray) {
      // If the saved array does not have the same number of items
      // than the config (after an update probably)
      // then reset the array to the default value
      if (defaultArray.length === storageArray.length) {
        return storageArray;
      } else {
        return defaultArray;
      }
    },
  });

  return merged;
}

const backends = backends_json.map(function (backend) {
  const backend_original = JSON.parse(JSON.stringify(backend));

  return {
    original: backend_original,
    current: useStorage("backend_" + backend.name, backend, localStorage, {
      mergeDefaults: mergeBackend,
    }),
  };
});

export const useBackendStore = defineStore({
  id: "backends",
  state: () => ({
    current_id: 1,
    configs: backends,
  }),
  getters: {
    selected_config: (state) => state.configs[state.current_id],
    current: (state) => state.selected_config.current,
    original: (state) => state.selected_config.original,
    options: (state) =>
      state.configs.map((backend, index) => ({
        name: backend.current.name,
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
    strength_input: (state) => state.findInput("strength"),
    access_code_input: (state) => state.findInput("access_code"),
    has_access_code: (state) => !!state.access_code_input,
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
    hasInput: function (input_id) {
      return this.findInput(input_id) !== undefined;
    },
    getInput: function (input_id, default_value) {
      const input_found = this.findInput(input_id);

      if (input_found) {
        return input_found.value;
      }

      return default_value;
    },
    setInput(input_id, value) {
      const input_found = this.findInput(input_id);

      if (input_found) {
        if (input_found.value !== value) {
          console.log(`input ${input_id} set to ${value}.`);
          input_found.value = value;
        }
      } else {
        console.log(`input ${input_id} not found.`);
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
    resetCurrentBackendToDefaults() {
      this.$confirm.require({
        message: `Reset ${this.current.name} to default values?`,
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          console.log(
            `Resetting backend ${this.current.name} to default values.`
          );
          this.selected_config.current = JSON.parse(
            JSON.stringify(this.selected_config.original)
          );
        },
      });
    },
  },
});
