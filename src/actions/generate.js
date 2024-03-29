import { useUIStore } from "@/stores/ui";
import { useEditorStore } from "@/stores/editor";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { resetEditorButtons } from "@/actions/editor";
import {
  generateImageGradio,
  cancelGenerationGradio,
  changeModelGradio,
} from "@/actions/generate_gradio";

async function getJson(response) {
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

    const error = new Error(
      `Error! The backend returned the http code: ${response.status}`
    );
    error.code = response.status;
    throw error;
  }

  return await response.json();
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
    output.loading_images = true;
    output.loading_progress = null;
    output.loading_message = null;
    output.image_preview = null;
    output.request_uuid = null;

    try {
      await generateImages();
      output.error_message = null;
    } catch (error) {
      ui.show_latest_result = true;
      output.error_message = error.message;
      console.error(error);
    } finally {
      output.loading_images = false;
    }
  }
}

async function cancelGeneration() {
  const backend = useBackendStore();

  const backend_type = backend.current["type"];

  switch (backend_type) {
    case "gradio":
      await cancelGenerationGradio();
      break;
    default:
      console.error(`backend type '${backend_type}' not valid`);
  }
}

async function changeModel() {
  const backend = useBackendStore();
  const output = useOutputStore();

  try {
    output.loading_model = true;
    const backend_type = backend.current["type"];

    switch (backend_type) {
      case "gradio":
        await changeModelGradio();
        break;
      default:
        console.error(`backend type '${backend_type}' not valid`);
    }
  } catch (error) {
    console.error(error);
    backend.$toast.add({
      severity: "error",
      detail: "Loading new model failed",
      life: 3000,
      closable: false,
    });
  } finally {
    output.loading_model = false;
  }
}

export { cancelGeneration, changeModel, generate, getJson };
