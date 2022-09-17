import { useUIStore } from "@/stores/ui";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { renderImage, resetEditorButtons } from "@/actions/editor";

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

  const input_data = inputs_config.map(function (input_config) {
    return {
      id: input_config["id"],
      value: input_config["value"],
    };
  });

  const input_data_values = Object.keys(input_data).map(
    (key) => input_data[key].value
  );

  // Add dummy data at the end to support using the web ui with a newer backend version
  for (let i = 0; i < 10; i++) {
    input_data_values.push(null);
  }

  console.log("input", input_data_values);

  const response = await fetch(current_backend.api_url, {
    method: "POST",
    body: JSON.stringify({
      data: input_data_values,
    }),
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

  const data_field = json_result["data"];
  const data_images = data_field[0];
  const data_seeds = data_field[1];

  // We receive either a single image or a list of images
  let images;
  if (typeof data_images == "object") {
    images = data_images;
  } else {
    images = [data_images];
  }

  const images_with_metadata = {
    content: images,
    metadata: input_data,
  };

  if (input.has_image) {
    images_with_metadata.original_image = input.uploaded_image_b64;
    images_with_metadata.canvas_history = input.canvas_history;
  } else {
    images_with_metadata.original_image = null;
    images_with_metadata.canvas_history = null;
  }

  // Save the generated seeds in the image metadata
  const seed_metadata = images_with_metadata.metadata.find(
    (data) => data.id === "seeds"
  );

  if (seed_metadata) {
    seed_metadata.value = data_seeds;
    console.log(`Images received with seeds: ${data_seeds}`);
  }

  output.images = images_with_metadata;

  // Saving the latest images in the gallery
  output.gallery.push(images_with_metadata);
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
