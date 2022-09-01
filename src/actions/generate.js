import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";

async function generateImageGradio() {
  const input = useInputStore();
  const backend = useBackendStore();

  const current_backend = backend.current;
  const inputs_config = current_backend["inputs"];

  if (backend.has_image_input) {
    if (input.uploaded_image_b64) {
      input.init_image_b64 = input.canvas.toDataURL();

      let image_input = inputs_config.find(
        (input_config) => input_config.type === "image"
      );

      image_input.value = input.init_image_b64;
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
  let data_image = data_field[0];

  // For now in all case we return only one image
  if (typeof data_image == "object") {
    data_image = data_image[0];
  }

  console.log("Image received!");

  return data_image;
}

async function generateImage() {
  const backend = useBackendStore();

  const backend_type = backend.current["type"];

  switch (backend_type) {
    case "gradio":
      return await generateImageGradio();
    default:
      console.error(`backend type '${backend_type}' not valid`);
  }
}

async function generate() {
  const output = useOutputStore();
  const backend = useBackendStore();

  if (!output.loading && !backend.show_license) {
    output.loading = true;

    try {
      output.image_b64 = await generateImage();
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
