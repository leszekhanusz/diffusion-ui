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

const backend_options = [
  {
    label: "Online",
    id: "online",
    backends: [{ label: "Latent Diffusion", id: "latent_diffusion" }],
  },
  {
    label: "Local",
    id: "local",
    backends: [
      { label: "Stable Diffusion", id: "stable_diffusion" },
      { label: "Automatic1111 fork", id: "stable_diffusion_automatic1111" },
    ],
  },
];

const default_backend = backends.find(
  (backend) => backend.original.id === "stable_diffusion"
);
const default_backend_id = default_backend.original.id;

export const useBackendStore = defineStore({
  id: "backends",
  state: () => ({
    backends: backends,
    backend_options: backend_options,
    backend_id: useStorage("backend_id", default_backend_id),
    fn_id: null,
  }),
  getters: {
    selected_backend: function (state) {
      var backend_found = state.backends.find(
        (backend) => backend.original.id === state.backend_id
      );
      if (!backend_found) {
        // Use default backend
        state.backend_id = default_backend_id;
        backend_found = state.backends.find(
          (backend) => backend.original.id === state.backend_id
        );
      }
      return backend_found;
    },
    current: (state) => state.selected_backend.current,
    original: (state) => state.selected_backend.original,
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
    common_inputs: (state) => state.current.common_inputs,
    inputs: function (state) {
      return state.current_function.inputs.map(function (input) {
        if (input.type === "common_input") {
          return state.common_inputs.find(
            (common_input) => common_input.id === input.id
          );
        }
        return input;
      });
    },
    outputs: (state) => state.current_function.outputs,
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
    has_img2img_mode: function (state) {
      if (state.has_image_input) {
        return true;
      }

      if (state.current.functions) {
        return state.current.functions.some((func) => func.mode === "img2img");
      }

      return false;
    },
    strength_input: (state) => state.findInput("strength"),
    strength: (state) => state.getInput("strength", 0),
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
          this.selected_backend.current = JSON.parse(
            JSON.stringify(this.selected_backend.original)
          );
        },
      });
    },
    changeBackend(backend_id) {
      if (this.backend_id !== backend_id) {
        const message = `Switching backend to ${backend_id}`;

        console.log(message);

        this.$toast.add({
          severity: "info",
          detail: message,
          life: 3000,
          closable: false,
        });

        this.backend_id = backend_id;
      }
    },
    changeFunction(function_id) {
      if (this.fn_id !== function_id) {
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
      }
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
