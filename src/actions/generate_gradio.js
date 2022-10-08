import { getJson } from "@/actions/generate";
import { useEditorStore } from "@/stores/editor";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { renderImage } from "@/actions/editor";
import { handleOutput } from "@/actions/output";
import { sleep } from "@/actions/sleep";

async function check_progress(cancel_token) {
  const backend = useBackendStore();
  const output = useOutputStore();

  const fn_index = backend.progress_fn_index;

  if (!fn_index) {
    return;
  }

  var stop = false;

  cancel_token.cancel = function () {
    stop = true;
  };

  const payload = {
    data: [],
    fn_index: fn_index,
  };

  const body = JSON.stringify(payload);

  const percent_regex = />([0-9]*)%/;

  while (!stop) {
    await sleep(500);

    try {
      const result = await fetch(backend.api_url, {
        method: "POST",
        body: body,
        headers: { "Content-Type": "application/json" },
      });

      if (stop) {
        break;
      }

      const json_result = await getJson(result);

      const html_progress = json_result.data[0];

      const percentage_match = html_progress.match(percent_regex);

      const percentage = parseInt(percentage_match[1], 10);

      output.loading_progress = percentage;

      const image_preview_data = json_result.data.find(function (data) {
        try {
          return data.startsWith("data:image");
        } catch (e) {
          return false;
        }
      });

      if (image_preview_data) {
        output.image_preview = image_preview_data;
      }
    } catch (e) {
      // Nothing here, error simply ignored
    }
  }
}

async function generateImageGradio() {
  const editor = useEditorStore();
  const backend = useBackendStore();

  const inputs_config = backend.inputs;

  const backend_id = backend.backend_id;
  const function_id = backend.has_multiple_functions
    ? backend.current_function.id
    : null;

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

  let cancel_token = {};

  const responses = await Promise.all([
    check_progress(cancel_token),
    (async function () {
      try {
        const result = await fetch(backend.api_url, {
          method: "POST",
          body: body,
          headers: { "Content-Type": "application/json" },
        });
        return result;
      } finally {
        if (cancel_token.cancel) {
          cancel_token.cancel();
        }
      }
    })(),
  ]);

  const response = responses[1];
  const json_result = await getJson(response);

  handleOutput(
    "gradio",
    backend_id,
    function_id,
    input_data,
    original_image,
    history,
    json_result
  );
}

async function cancelGenerationGradio() {
  const backend = useBackendStore();

  const fn_index = backend.cancel_fn_index;

  if (!fn_index) {
    return;
  }

  const payload = {
    data: [],
    fn_index: fn_index,
  };

  const body = JSON.stringify(payload);

  await fetch(backend.api_url, {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" },
  });
}

export { cancelGenerationGradio, generateImageGradio };
