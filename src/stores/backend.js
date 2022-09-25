import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { computed } from "vue";
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
  if (backend.inputs) {
    backend.inputs.forEach(function (input) {
      input.value = input.default;
    });
  } else {
    backend.functions.forEach(function (fn) {
      fn.inputs.forEach(function (input) {
        input.value = input.default;
      });
    });
  }
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
    fn_id: null,
  }),
  getters: {
    selected_config: (state) => state.configs[state.current_id],
    current: (state) => state.selected_config.current,
    original: (state) => state.selected_config.original,
    has_multiple_functions: (state) => !!state.current.functions,
    current_function: function (state) {
      if (state.has_multiple_functions) {
        var current_fn = state.current.functions.find(
          (func) => func.id == state.fn_id
        );
        if (!current_fn) {
          state.fn_id = state.current.functions[0].id;
          current_fn = state.current.functions.find(
            (func) => func.id == state.fn_id
          );
        }
        return current_fn;
      } else {
        return state.current;
      }
    },
    mode: (state) => state.current_function.mode,
    inputs: (state) => state.current_function.inputs,
    function_options: function (state) {
      if (!state.current.functions) {
        return [];
      }
      const opts = state.current.functions.map((fn) => ({
        label: fn.label,
        id: fn.id,
      }));
      return opts;
    },
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
      state.inputs.some((input) => input.type === "image"),
    strength_input: (state) => computed(() => state.findInput("strength")),
    access_code_input: (state) => state.findInput("access_code", false),
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
    findInput(input_id, warn) {
      if (warn === undefined) {
        warn = true;
      }
      if (this.current) {
        const input = this.inputs.find((input) => input.id === input_id);
        if (!input && warn) {
          console.warn(`input ${input_id} not found`);
        }
        return input;
      } else {
        return null;
      }
    },
    hasInput: function (input_id) {
      const warn = false;
      return this.findInput(input_id, warn) !== undefined;
    },
    getInput: function (input_id, default_value) {
      const warn = false;
      const input_found = this.findInput(input_id, warn);

      if (input_found) {
        return input_found.value;
      }

      return default_value;
    },
    setInput(input_id, value, with_toast) {
      if (with_toast === undefined) {
        with_toast = true;
      }
      const input_found = this.findInput(input_id);

      if (input_found) {
        if (input_found.value !== value) {
          const message = `input ${input_id} set to ${value}.`;
          console.log(message);
          if (with_toast) {
            this.$toast.add({
              severity: "info",
              detail: message,
              life: 3000,
              closable: false,
            });
          }
          input_found.value = value;
        }
      } else {
        console.log(`input ${input_id} not found.`);
      }
    },
    isInputVisible(input_id) {
      const input = this.findInput(input_id);

      if (
        input.id === "prompt" ||
        input.id === "access_code" ||
        input.type === "image" ||
        input.type === "image_mask"
      ) {
        // Some inputs are always invisible
        return false;
      }

      if (input) {
        const visible_rule = input.visible;

        if (visible_rule === undefined) {
          return true;
        }

        if (visible_rule === false) {
          return false;
        }

        if (typeof visible_rule === "object") {
          const condition = visible_rule.condition;

          if (condition === "===") {
            const comparaison_input = this.findInput(visible_rule.input_id);

            if (comparaison_input) {
              const comp = comparaison_input.value === visible_rule.value;
              return comp;
            }
          }
        }
      }

      return true;
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
    changeFunction(function_id) {
      const message = `Switching to ${function_id}`;

      console.log(message);

      if (!this.current.functions) {
        console.warn(`Impossible to change function with this backend.`);
        return;
      }

      const new_function = this.current.functions.find(
        (func) => func.id === function_id
      );

      if (!new_function) {
        console.warn(`Function id ${function_id} not found.`);
        return;
      }

      this.$toast.add({
        severity: "info",
        detail: message,
        life: 3000,
        closable: false,
      });

      this.fn_id = function_id;
    },
    getAllowedModes(editor_mode) {
      // Return the allow backend modes depending on the editor mode
      switch (editor_mode) {
        case "txt2img":
          return ["txt2img"];
        case "img2img":
          return ["img2img", "inpainting"];
        case "inpainting":
          return ["inpainting"];
      }
    },
    changeFunctionForModes(modes) {
      if (!this.current.functions) {
        return;
      }

      console.log(`Changing for modes ${modes}`);

      if (modes.includes(this.mode)) {
        console.log(
          `The current function '${this.fn_id}' mode: '${this.mode}' is already in ${modes}`
        );
        return;
      }

      modes.every(
        function (mode) {
          const found_func = this.current.functions.find(
            (func) => func.mode === mode
          );
          if (found_func) {
            this.changeFunction(found_func.id);
            return false;
          }
          return true;
        }.bind(this)
      );
    },
  },
});
