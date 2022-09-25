import { useBackendStore } from "@/stores/backend";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";

function handleOutputAutomatic1111(json_result) {
  const output = useOutputStore();

  const data_field = json_result["data"];
  const data_images = data_field[0];
  const metadata_json = data_field[1];

  if (!metadata_json) {
    // On errors, the backend will send an empty string here
    throw new Error(data_field[2]);
  }

  const output_metadata = JSON.parse(metadata_json);
  console.log("output metadata", output_metadata);

  output.images.metadata.output = output_metadata;

  if (data_images.length > 1) {
    // If there is more than one image, a grid is inserted as a first image
    const first_seed = output.images.metadata.output.all_seeds[0];
    output.images.metadata.output.all_seeds.unshift(first_seed);
  }
}

function handleOutputDefault(json_result) {
  const output = useOutputStore();

  const data_field = json_result["data"];
  const data_seeds = data_field[1];

  // Save the generated seeds in the image metadata
  const seed_metadata = output.images.metadata.find(
    (data) => data.id === "seeds"
  );

  if (seed_metadata) {
    seed_metadata.value = data_seeds;
    console.log(`Images received with seeds: ${data_seeds}`);
  }
}

function handleOutput(input_data, function_id, json_result) {
  const backend = useBackendStore();
  const input = useInputStore();
  const output = useOutputStore();

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
      function_id: function_id,
    },
  };

  if (input.has_image) {
    images_with_metadata.original_image = input.uploaded_image_b64;
    images_with_metadata.canvas_history = input.canvas_history;
  } else {
    images_with_metadata.original_image = null;
    images_with_metadata.canvas_history = null;
  }

  output.images = images_with_metadata;

  if (backend.current_function.handle_output) {
    if (backend.current_function.handle_output === "automatic1111") {
      handleOutputAutomatic1111(json_result);
    }
  } else {
    handleOutputDefault(json_result);
  }

  // Saving the latest images in the gallery
  output.gallery.push(output.images);
}

function resetInputsFromResultImage(image_index) {
  const backend = useBackendStore();
  const output = useOutputStore();

  const input_metadata = output.images.metadata.input;
  const output_metadata = output.images.metadata.output;

  const function_id = output.images.metadata.function_id;

  if (function_id) {
    backend.changeFunction(function_id);
  }

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
          backend.setInput("seed", seed);

          if (all_seeds.length > 1) {
            // More than one image requested --> grid as first image

            if (
              output_metadata.index_of_first_image &&
              image_index < output_metadata.index_of_first_image
            ) {
              // Image grid selected
              backend.setInput("batch_count", input_metadata.batch_count);
              backend.setInput("batch_size", input_metadata.batch_size);
            } else {
              // Requesting only one image if it's not the grid which is selected

              backend.setInput("batch_count", 1);
              backend.setInput("batch_size", 1);
            }
          }
        }
      }
    } else {
      backend.setInput(data_id, data_value);
    }
  });
}

export { handleOutput, resetInputsFromResultImage };
