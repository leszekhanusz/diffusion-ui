import { useUIStore } from "@/stores/ui";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { renderImage, resetEditorButtons } from "@/actions/editor";
import { handleOutput } from "@/actions/output";

async function generateImageGradio() {
  const input = useInputStore();
  const backend = useBackendStore();

  const inputs_config = backend.inputs;

  if (backend.has_image_input) {
    let image_input = inputs_config.find(
      (input_config) => input_config.type === "image"
    );

    let mask_image_input = inputs_config.find(
      (input_config) => input_config.type === "image_mask"
    );

    if (image_input) {
      if (input.has_image) {
        // Create final image in input.init_image_b64
        renderImage();

        image_input.value = input.init_image_b64;
      } else {
        image_input.value = null;
      }
    }

    if (mask_image_input) {
      if (input.mask_image_b64) {
        mask_image_input.value = input.mask_image_b64;
      } else {
        mask_image_input.value = null;
      }
    }
  }

  const input_data = Object.assign(
    {},
    ...inputs_config.map((x) => ({ [x["id"]]: x["value"] }))
  );

  const input_data_values = Object.values(input_data);

  // Add dummy data at the end to support using the web ui with a newer backend version
  for (let i = 0; i < 10; i++) {
    input_data_values.push(null);
  }

  const payload = {
    data: input_data_values,
  };

  if (backend.current_function.fn_index) {
    // Some gradio interfaces need a function index
    payload["fn_index"] = backend.current_function.fn_index;
  }

  const body = JSON.stringify(payload);

  console.log("sent", body);

  const response = await fetch(backend.current.api_url, {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    var json_error = null;
    try {
      json_error = await response.json();
    } catch (e) {
      // Ignore here, error thrown below
    }

    if (json_error) {
      if (json_error.error) {
        throw new Error(json_error.error);
      }
    }

    throw new Error(
      `Error! The backend returned the http code: ${response.status}`
    );
  }

  const json_result = await response.json();

  handleOutput(input_data, json_result);
}

async function generateImages() {
  const backend = useBackendStore();

  const backend_type = backend.current["type"];

  switch (backend_type) {
    case "gradio":
      await generateImageGradio();
      break;
    default:
      console.error(`backend type '${backend_type}' not valid`);
  }
}

async function generate() {
  const output = useOutputStore();
  const backend = useBackendStore();
  const ui = useUIStore();

  ui.show_results = true;
  resetEditorButtons();

  if (!output.loading && !backend.show_license) {
    output.loading = true;

    try {
      await generateImages();
      output.error_message = null;
    } catch (error) {
      output.error_message = error;
      console.error(error);
    } finally {
      output.loading = false;
    }
  }
}

export { generate };
