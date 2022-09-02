import { useUIStore } from "@/stores/ui";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { resetEditorButtons } from "@/actions/editor";

async function generateImageGradio() {
  const input = useInputStore();
  const output = useOutputStore();
  const backend = useBackendStore();

  const current_backend = backend.current;
  const inputs_config = current_backend["inputs"];

  if (backend.has_image_input) {
    let image_input = inputs_config.find(
      (input_config) => input_config.type === "image"
    );

    let mask_image_input = inputs_config.find(
      (input_config) => input_config.type === "image_mask"
    );

    if (image_input) {
      if (input.uploaded_image_b64) {
        input.init_image_b64 = input.canvas.toDataURL();

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

  const full_input_data = inputs_config.map(function (input_config) {
    if (input_config.id in input) {
      return input[input_config.id];
    } else {
      return input_config["value"];
    }
  });

  console.log("full_input_data", full_input_data);

  const response = await fetch(current_backend.url, {
    method: "POST",
    body: JSON.stringify({
      data: full_input_data,
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Error! The backend returned the http code: ${response.status}`
    );
  }

  const json_result = await response.json();

  const data_field = json_result["data"];
  const data_images = data_field[0];

  // We receive either a single image or a list of images
  if (typeof data_images == "object") {
    output.images = data_images;
  } else {
    output.images = [data_images];
  }

  console.log("Images received!");
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
