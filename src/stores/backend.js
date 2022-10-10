import { version } from "@/version";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { reactive, toRaw } from "vue";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";
import deepmerge from "deepmerge";
import backend_latent_diffusion from "@/backends/gradio/latent-diffusion.json";
import backend_stable_diffusion from "@/backends/gradio/stable-diffusion.json";
import backend_stable_diffusion_automatic1111 from "@/backends/gradio/stable-diffusion-automatic1111.json";
import backend_stable_horde from "@/backends/stable_horde/stable_horde.json";

const backends_json = [
  backend_latent_diffusion,
  backend_stable_diffusion,
  backend_stable_diffusion_automatic1111,
  backend_stable_horde,
];

backends_json.forEach(function (backend) {
  if (backend.inputs) {
    backend.inputs.forEach(function (input) {
      input.value = input.default;
    });
  } else {
    backend.functions.forEach(function (fn) {
      if (fn.inputs !== "auto") {
        fn.inputs.forEach(function (input) {
          input.value = input.default;
        });
      }
    });
  }
});

function mergeBackend(storageValue, defaults) {
  // Merging the backend data from the config json file
  // and from the saved values in local storage

  let merged = defaults;

  if (
    !storageValue.diffusionui_version ||
    storageValue.diffusionui_version !== version
  ) {
    console.log(
      `New version of diffusion-ui detected for ${defaults.id}: (${storageValue.diffusionui_version} instead of ${version}) ==> Reloading new config`
    );
  } else {
    merged = deepmerge(defaults, storageValue, {
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
  }

  return merged;
}

const backends = backends_json.map(function (backend) {
  const backend_original = JSON.parse(JSON.stringify(backend));

  let backend_config = {
    original: backend_original,
    current: useStorage("backend_" + backend.id, backend, localStorage, {
      mergeDefaults: mergeBackend,
    }),
    gradio_config: "config_path" in backend_original ? null : undefined,
  };

  backend_config.current.value["diffusionui_version"] = version;

  return backend_config;
});

const backend_options = [
  {
    label: "Online",
    id: "online",
    backends: [
      { label: "Latent Diffusion", id: "latent_diffusion" },
      { label: "Stable Horde", id: "stable_horde" },
    ],
  },
  {
    label: "Local",
    id: "local",
    backends: [
      {
        label: "Automatic1111",
        id: "automatic1111",
      },
      { label: "Stable Diffusion", id: "stable_diffusion" },
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
    loading_config: false,
    fn_id: null, // txt2img, img2img, inpainting
  }),
  getters: {
    backend_ids: (state) =>
      state.backends.map((backend) => backend.original.id),
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
    base_url: (state) => state.current.base_url,
    api_url: (state) => state.base_url + "/" + state.current.api_path,
    config_url: function (state) {
      if (state.current.config_path) {
        return state.base_url + "/" + state.current.config_path;
      } else {
        return null;
      }
    },
    cancellable: (state) =>
      state.current.type === "stable_horde" || state.cancel_fn_index,
    use_gradio_config: (state) => !!state.selected_backend.original.config_path,
    needs_gradio_config: (state) =>
      state.use_gradio_config && !state.selected_backend.gradio_config,
    gradio_config: function (state) {
      if (state.needs_gradio_config) {
        this.loadGradioConfig();
      }
      return state.selected_backend.gradio_config;
    },
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
    fn_index: function (state) {
      const fn_index_config = state.current_function.fn_index;
      if (!fn_index_config || typeof fn_index_config === "number") {
        return fn_index_config;
      } else {
        return this.getGradioConfigFunctionIndex(fn_index_config.conditions);
      }
    },
    cancel_fn_index: function (state) {
      const cancel_info = state.current_function.cancel;

      if (cancel_info) {
        return this.getGradioConfigFunctionIndex(
          cancel_info.fn_index.conditions
        );
      }

      return null;
    },
    progress_fn_index: function (state) {
      const progress_info = state.current_function.progress;

      if (progress_info) {
        return this.getGradioConfigFunctionIndex(
          progress_info.fn_index.conditions
        );
      }

      return null;
    },
    gradio_function: function (state) {
      return state.gradio_config?.dependencies[state.fn_index];
    },
    gradio_input_ids: function (state) {
      return state.gradio_function?.inputs;
    },
    gradio_inputs: function (state) {
      return state.gradio_input_ids?.map((id) =>
        state.gradio_config.components.find((component) => component.id === id)
      );
    },
    mode: (state) => state.current_function.mode,
    common_inputs: (state) => state.current.common_inputs,
    inputs: function (state) {
      const inputs_json = state.current_function.inputs;
      console.log("Computing inputs");

      if (inputs_json === "auto") {
        if (!state.current_function.auto_inputs) {
          state.current_function.auto_inputs = {};
        }
        const auto_inputs = state.current_function.auto_inputs;
        if (state.gradio_inputs) {
          const convert_context = {
            used_ids: [],
            images_found: 0,
          };
          return state.gradio_inputs.map(function (gradio_input) {
            var auto_input = state.convertGradioInput(
              gradio_input,
              convert_context
            );

            const auto_id = auto_input.auto_id;
            if (!(auto_id in auto_inputs)) {
              auto_inputs[auto_id] = {};
            }

            const input_def_reactive = auto_inputs[auto_id];
            const input_def = toRaw(input_def_reactive);

            if (input_def.type === "common_input") {
              const common_input_found_reactive = state.common_inputs.find(
                (common_input) => common_input.id === input_def.id
              );

              if (common_input_found_reactive) {
                const common_input_found = toRaw(common_input_found_reactive);
                if (!("value" in common_input_found)) {
                  common_input_found.value = common_input_found.default;
                }
                return reactive(common_input_found);
              } else {
                console.warn(`common_input ${auto_id} not found`);
              }
            }

            if (!("value" in input_def)) {
              input_def.value = auto_input.default;
            }

            Object.assign(auto_input, input_def);

            Object.defineProperty(auto_input, "value", {
              get() {
                return input_def.value;
              },
              set(value) {
                input_def_reactive.value = value;
              },
            });

            return reactive(auto_input);
          });
        }
      } else {
        return inputs_json.map(function (input) {
          if (input.type === "common_input") {
            return state.common_inputs.find(
              (common_input) => common_input.id === input.id
            );
          }
          return input;
        });
      }
      return [];
    },
    image_inputs: (state) =>
      state.inputs.filter(
        (input) => input.type === "image" || input.type === "image_mask"
      ),
    model_info_inputs: (state) =>
      state.inputs.filter((input) => input.on_model_info_tab),
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
    has_seed: (state) => state.hasInput("seeds") || state.hasInput("seed"),
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
    getBackend(backend_id) {
      return this.backends.find(
        (backend) => backend.original.id === backend_id
      );
    },
    getFunction(backend_id, function_id) {
      const backend = this.getBackend(backend_id);

      if (backend) {
        if (backend.current.functions) {
          return backend.current.functions.find(
            (func) => func.id === function_id
          );
        }
      }
      return null;
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
    async loadGradioConfig() {
      const config_url = this.config_url;

      if (config_url) {
        let error_message = null;

        try {
          this.loading_config = true;
          console.log(`Downloading gradio config from ${config_url}`);
          const config_response = await fetch(config_url, {
            method: "GET",
          });

          const gradio_config = await config_response.json();

          console.log("gradio_config", gradio_config);

          const gradio_config_keys = [
            "version",
            "mode",
            "components",
            "dependencies",
          ];

          const is_gradio_config = gradio_config_keys.every(
            (key) => key in gradio_config
          );

          if (is_gradio_config) {
            this.selected_backend.gradio_config = gradio_config;
          } else {
            error_message =
              "The config json file downloaded does not seem to be a gradio config file";
            console.error(error_message, gradio_config);
          }
        } catch (e) {
          error_message = "Error trying to download the gradio config";
          console.error(error_message, e);
        } finally {
          this.loading_config = false;
        }

        if (error_message) {
          const ui = useUIStore();
          const output = useOutputStore();
          ui.show_latest_result = true;
          ui.show_results = true;
          output.error_message = error_message;
        }
      }
    },
    getImageInput() {
      const conditions = this.current_function?.image?.conditions;

      return this.inputs.find(function (input) {
        if (input.type === "image") {
          if (conditions) {
            return Object.keys(conditions).every(
              (cond_key) => input.props[cond_key] === conditions[cond_key]
            );
          } else {
            return true;
          }
        }
      });
    },
    getImageMaskInput() {
      const conditions = this.current_function?.image_mask?.conditions;

      return this.inputs.find(function (input) {
        if (input.type === "image_mask") {
          if (conditions) {
            return Object.keys(conditions).every(
              (cond_key) => input.props[cond_key] === conditions[cond_key]
            );
          } else {
            return true;
          }
        }
      });
    },
    getGradioConfigFunctionIndex(conditions) {
      if (this.gradio_config) {
        const dependencies = this.gradio_config.dependencies;
        const components = this.gradio_config.components;

        const fn_index = Object.keys(dependencies).find(function (key) {
          const dependency = dependencies[key];
          return Object.keys(conditions).every(function (cond_key) {
            if (cond_key === "targets") {
              return Object.keys(conditions.targets).every(function (
                target_key
              ) {
                const target_conditions =
                  conditions.targets[target_key].conditions;

                const component_key = Object.keys(components).find(function (
                  comp_key
                ) {
                  let component = components[comp_key];

                  return Object.keys(target_conditions).every(function (
                    target_cond_key
                  ) {
                    if (target_cond_key === "type") {
                      return target_conditions["type"] === component.type;
                    } else {
                      return (
                        target_conditions[target_cond_key] ===
                        component.props[target_cond_key]
                      );
                    }
                  });
                });

                const component = components[component_key];

                if (component) {
                  return dependency.targets[target_key] == component.id;
                } else {
                  return false;
                }
              });
            } else {
              return dependency[cond_key] === conditions[cond_key];
            }
          });
        });

        return fn_index;
      }
    },
    convertGradioInput(gradio_input, convert_context) {
      let input;

      const props = gradio_input.props;
      switch (gradio_input.type) {
        case "label":
          input = {
            label: props.name,
            visible: false,
            default: 0,
          };
          break;
        case "textbox":
          input = {
            label: props.label,
            type: "text",
          };
          break;
        case "dropdown":
        case "radio":
          input = {
            label: props.label,
            type: "choice",
            validation: {
              options: props.choices,
            },
          };
          break;
        case "slider":
          input = {
            label: props.label,
            type: "float",
            step: props.step,
            validation: {
              min: props.minimum,
              max: props.maximum,
            },
          };
          break;
        case "checkbox":
          input = {
            label: props.label,
            type: "boolean",
          };
          break;
        case "number":
          input = {
            label: props.label,
            type: "bigint",
            validation: {
              min: -1,
              max: 4294967296,
            },
          };
          break;
        case "file":
          input = {
            label: props.label,
            default: null,
            visible: false,
          };
          break;
        case "checkboxgroup":
          input = {
            label: props.label,
            id: "checkboxgroup_" + gradio_input.id,
            default: props.value,
            visible: false,
          };
          break;
        case "html":
          input = {
            label: props.name,
            id: "html_" + gradio_input.id,
            default: "",
            visible: false,
          };
          break;
        case "image":
          if (gradio_input.props.tool === "editor") {
            input = {
              label: props.label,
              id: "image_" + convert_context.images_found++,
              type: props.label.toLowerCase().includes("mask")
                ? "image_mask"
                : "image",
              props: props,
              default: null,
              visible: false,
            };
          } else {
            input = {
              label: props.label,
              id: "image_" + convert_context.images_found++,
              default: null,
              visible: false,
            };
          }
          break;
        default:
          console.log("Unsupported gradio component type: ", gradio_input.type);
          console.log("Unsupported gradio component type: ", gradio_input);
          input = {
            label: props.label,
            default: null,
            visible: false,
          };
          break;
      }

      if (!("visible" in input)) {
        input.visible = gradio_input.visible;
      }
      if (!("default" in input)) {
        input.default = gradio_input.props.value;
      }

      if (!("id" in input)) {
        input.id = input.label.replace(/\s+/g, "_").toLowerCase();
      }

      const input_id = input.id;
      let next_id = 0;
      while (convert_context.used_ids.includes(input.id)) {
        input.id = input_id + "_" + next_id;
        next_id++;
      }

      convert_context.used_ids.push(input.id);
      input.auto_id = input.id;
      input.description = "";

      return input;
    },
  },
});
