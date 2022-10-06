import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { useUIStore } from "@/stores/ui";

function handleOutputAutomatic1111(
  json_result,
  images_with_metadata,
  backend_function
) {
  const data_field = json_result["data"];
  const data_images = data_field[0];

  if (backend_function.outputs[1].type === "json") {
    const metadata_json = data_field[1];

    if (!metadata_json) {
      // On errors, the backend will send an empty string here
      throw new Error(data_field[2]);
    }

    const output_metadata = JSON.parse(metadata_json);
    console.log("output metadata", output_metadata);

    images_with_metadata.metadata.output = output_metadata;

    if (data_images.length > 1) {
      // If there is more than one image, a grid is inserted as a first image
      const first_seed = images_with_metadata.metadata.output.all_seeds[0];
      images_with_metadata.metadata.output.all_seeds.unshift(first_seed);
    }
  }
}

function handleOutputDefault(json_result, images_with_metadata) {
  const data_field = json_result["data"];
  const data_seeds = data_field[1];

  // Save the generated seeds in the image metadata
  const metadata = images_with_metadata.metadata;

  if ("seeds" in metadata.input) {
    metadata.input["seeds"] = data_seeds;
    console.log(`Images received with seeds: ${data_seeds}`);
  }
}

function handleOutputGradio(
  backend_id,
  function_id,
  input_data,
  original_image,
  history,
  json_result
) {
  const backend = useBackendStore();
  const output = useOutputStore();
  const ui = useUIStore();

  const data_field = json_result["data"];
  const data_images = data_field[0];

  // We receive either a single image or a list of images
  let images;
  if (typeof data_images == "object") {
    images = data_images;
  } else {
    images = [data_images];
  }

  const images_with_metadata = {
    content: images,
    metadata: {
      input: input_data,
      backend_id: backend_id,
      function_id: function_id,
    },
    original_image: original_image,
    history: history,
  };

  if (backend.current_function.handle_output) {
    if (backend.current_function.handle_output === "automatic1111") {
      const backend_function = backend.getFunction(backend_id, function_id);
      handleOutputAutomatic1111(
        json_result,
        images_with_metadata,
        backend_function
      );
    }
  } else {
    handleOutputDefault(json_result, images_with_metadata);
  }

  // Saving the latest images in the gallery
  output.gallery.push(images_with_metadata);

  if (ui.show_latest_result) {
    output.gallery_index = output.nb_gallery - 1;
  }
}

function handleOutputStableHorde(
  backend_id,
  function_id,
  input_data,
  original_image,
  history,
  json_result
) {
  const output = useOutputStore();
  const ui = useUIStore();

  const generations = json_result["generations"];

  const images = generations.map(
    (generation) => "data:image/png;base64," + generation.img
  );
  const seeds = generations.map((generation) => generation.seed);

  const images_with_metadata = {
    content: images,
    metadata: {
      input: input_data,
      backend_id: backend_id,
    },
    original_image: null,
    history: null,
  };

  if (ui.show_latest_result) {
    output.images = images_with_metadata;
  }

  const output_metadata = {
    all_seeds: seeds,
  };

  console.log("output metadata", output_metadata);

  images_with_metadata.metadata.output = output_metadata;

  console.log(`Images received with seeds: ${seeds}`);

  // Saving the latest images in the gallery
  output.gallery.push(images_with_metadata);
}

function handleOutput(backend_type, ...args) {
  switch (backend_type) {
    case "gradio":
      handleOutputGradio(...args);
      break;
    case "stable_horde":
      handleOutputStableHorde(...args);
      break;
    default:
      console.warn(`Invalid backend type: ${backend_type}`);
  }
}

function resetInputsFromResultImage(image_index) {
  const backend = useBackendStore();
  const output = useOutputStore();

  const input_metadata = output.images.metadata.input;
  const output_metadata = output.images.metadata.output;

  const backend_id = output.images.metadata.backend_id;
  const function_id = output.images.metadata.function_id;

  backend.changeBackend(backend_id);

  if (function_id) {
    backend.changeFunction(function_id);
  }

  let new_batch_count = null;
  let new_batch_size = null;

  Object.entries(input_metadata).forEach(function (entry) {
    const [data_id, data_value] = entry;

    if (data_id === "seeds") {
      const seeds = data_value;
      const seed = seeds.split(",")[image_index];

      backend.setInput("seeds", seed);
    } else if (data_id === "seed") {
      if (output_metadata) {
        if (output_metadata.all_seeds) {
          const all_seeds = output_metadata.all_seeds;

          const seed = output_metadata.all_seeds[image_index];
          backend.setInput(data_id, seed);

          if (
            all_seeds.length > 1 &&
            output_metadata.index_of_first_image &&
            image_index < output_metadata.index_of_first_image
          ) {
            // Image grid selected
            new_batch_count = input_metadata.batch_count;
            new_batch_size = input_metadata.batch_size;
          } else {
            // Requesting only one image if it's not the grid which is selected

            new_batch_count = 1;
            new_batch_size = 1;
          }
        }
      }
    } else {
      backend.setInput(data_id, data_value);
    }
  });

  if (new_batch_count) {
    backend.setInput("batch_count", new_batch_count);
  }
  if (new_batch_size) {
    backend.setInput("batch_size", new_batch_size);
  }
}

function resetSeeds() {
  const backend = useBackendStore();

  const without_toast = false;

  if (backend.hasInput("seeds")) {
    backend.setInput("seeds", "", without_toast);
    return;
  }

  const input = backend.findInput("seed");

  if (input) {
    let value;
    if (input.type === "text") {
      value = "";
    } else {
      value = -1;
    }
    input.value = value;
  }
}

export { handleOutput, resetInputsFromResultImage, resetSeeds };
