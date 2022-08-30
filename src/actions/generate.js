import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";

async function generateImageGradio(input_data, backend_config) {
  const inputs_config = backend_config["inputs"];

  console.log(backend_config, input_data);

  const full_input_data = inputs_config.map(function (input_config) {
    if (input_config.id in input_data) {
      return input_data[input_config.id];
    } else {
      return input_config["default"];
    }
  });

  console.log("full_input_data", full_input_data);

  const response = await fetch(backend_config.url, {
    method: "POST",
    body: JSON.stringify({
      data: full_input_data,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const json_result = await response.json();

  const data_image = json_result["data"][0];

  console.log("Image received!");

  return data_image;
}

async function generateImage(input_data, backend_config) {
  const backend_type = backend_config["type"];

  switch (backend_type) {
    case "gradio":
      return await generateImageGradio(input_data, backend_config);
    default:
      console.error(`backend type '${backend_type}' not valid`);
  }
}

async function generate() {
  const backend = useBackendStore();
  const input = useInputStore();
  const output = useOutputStore();

  output.loading = true;

  try {
    output.image_b64 = await generateImage(input, backend.current);
  } catch (error) {
    console.error(error);
  } finally {
    output.loading = false;
  }
}

export { generate };
