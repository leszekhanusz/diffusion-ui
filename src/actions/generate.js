import { useUIStore } from "@/stores/ui";
import { useEditorStore } from "@/stores/editor";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { renderImage, resetEditorButtons } from "@/actions/editor";
import { handleOutput } from "@/actions/output";

async function generateImageGradio() {
  const editor = useEditorStore();
  const backend = useBackendStore();

  const inputs_config = backend.inputs;

  const backend_id = backend.backend_id;
  const function_id = backend.current_function.id;

  const original_image = editor.uploaded_image_b64;
  const history = editor.has_image ? editor.history : null;

  if (backend.has_image_input) {
    let image_input = backend.getImageInput();
    let mask_image_input = backend.getImageMaskInput();

    backend.image_inputs.forEach((input) => (input.value = null));

    if (image_input) {
      if (editor.has_image) {
        // Create final image in input.init_image_b64
        renderImage();

        image_input.value = editor.init_image_b64;
      }
    }

    if (mask_image_input) {
      mask_image_input.value = editor.mask_image_b64;
    }
  }

  const input_data = Object.assign(
    {},
    ...inputs_config.map((x) => ({ [x["id"]]: x["value"] }))
  );

  console.log("input_data", input_data);

  const input_data_values = Object.values(input_data);

  // Add dummy data at the end to support using the web ui with a newer backend version
  for (let i = 0; i < 10; i++) {
    input_data_values.push(null);
  }

  const payload = {
    data: input_data_values,
  };

  if (backend.fn_index) {
    // Some gradio interfaces need a function index
    payload["fn_index"] = backend.fn_index;
  }

  const body = JSON.stringify(payload);

  //console.log("sent", body);

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

  handleOutput(
    input_data,
    backend_id,
    function_id,
    original_image,
    history,
    json_result
  );
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

function checkEditorMode() {
  const backend = useBackendStore();
  const editor = useEditorStore();

  const backend_mode = backend.mode;

  // Special case, reset editor mode to img2img if we are in inpainting mode
  // and backend is in img2img mode
  if (backend_mode === "img2img" && editor.mode === "inpainting") {
    editor.mode = "img2img";
  }

  // Some backends have a single mode for everything
  if (!backend_mode) {
    return true;
  }

  const allowed_modes = backend.getAllowedModes(editor.mode);

  const allowed = allowed_modes.includes(backend_mode);

  if (!allowed) {
    var message;
    switch (backend_mode) {
      case "txt2img":
        message = "Text to Image mode cannot use an image!";
        break;
      case "img2img":
      case "inpainting":
        message = "You need an image!";
        break;
      default:
        message = "Invalid backend mode!";
    }

    backend.$toast.add({
      severity: "warn",
      detail: message,
      life: 3000,
      closable: false,
    });
  }
  return allowed;
}

async function generate() {
  const output = useOutputStore();
  const backend = useBackendStore();
  const ui = useUIStore();

  if (!checkEditorMode()) {
    return;
  }

  ui.show_results = true;
  ui.show_latest_result = true;

  resetEditorButtons();

  if (!output.loading && !backend.show_license) {
    output.loading = true;

    try {
      await generateImages();
      output.error_message = null;
    } catch (error) {
      ui.show_latest_result = true;
      output.error_message = error;
      console.error(error);
    } finally {
      output.loading = false;
    }
  }
}

export { generate };
