import { useUIStore } from "@/stores/ui";
import { useEditorStore } from "@/stores/editor";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { renderImage, resetEditorButtons } from "@/actions/editor";
import { handleOutput } from "@/actions/output";
import { sleep } from "@/actions/sleep";

async function get_json(response) {
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

async function get_json_stable_horde(response) {
  try {
    return await get_json(response);
  } catch (e) {
    let new_error = null;

    if (e.code) {
      switch (e.code) {
        case 400:
          new_error = "<p>Validation Error</p>";
          break;
        case 401:
          new_error = "<p>Invalid API Key</p>";
          break;
        case 429:
          new_error = "<p>Too Many Prompts</p>";
          break;
        case 503:
          new_error =
            "<p>Stable Horde is in maintenance mode. <br/>Please try again later.</p>";
          break;
      }
    }

    if (new_error) {
      throw new Error(new_error);
    } else {
      throw e;
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

  //console.log("sent", body);

  const response = await fetch(backend.api_url, {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" },
  });

  const json_result = await get_json(response);

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

async function generateImageStableHorde() {
  const backend = useBackendStore();
  const output = useOutputStore();

  const inputs_config = backend.inputs;

  const backend_id = backend.backend_id;

  const input_data = Object.assign(
    {},
    ...inputs_config.map((x) => ({ [x["id"]]: x["value"] }))
  );

  const api_key = input_data.api_key;

  const root_keys = ["prompt", "nsfw", "censor_nsfw", "workers"];

  const frame = inputs_config.reduce(
    function (result, input) {
      const input_id = input.id;

      if (input_id === "api_key") {
        return result;
      }

      const api_id = input.api_id ? input.api_id : input_id;
      const value = input.value;

      if (root_keys.includes(api_id)) {
        result[api_id] = value;
      } else {
        result.params[api_id] = value;
      }

      return result;
    },
    {
      params: {},
    }
  );

  console.log("frame", frame);

  const body = JSON.stringify(frame);

  const api_request_url = backend.base_url + "/api/v2/generate/async";

  const request_response = await fetch(api_request_url, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
      apikey: api_key,
    },
  });

  const request_json = await get_json_stable_horde(request_response);

  const request_uuid = request_json.id;

  output.request_uuid = request_uuid;

  const api_check_url =
    backend.base_url + "/api/v2/generate/check/" + request_uuid;
  console.log("api_check_url", api_check_url);

  let elapsed_seconds = 0;

  for (;;) {
    const check_response = await fetch(api_check_url, {
      method: "GET",
    });

    const check_json = await get_json_stable_horde(check_response);

    const done = check_json.done;
    const wait_time = check_json.wait_time;

    const percentage = 100 * (1 - wait_time / (wait_time + elapsed_seconds));
    output.loading_progress = Math.round(percentage * 100) / 100;
    output.loading_message = `Estimated wait time: ${wait_time}s`;
    console.log(`${output.loading_progress.toFixed(2)}%`);

    if (done) {
      break;
    }

    for (let i = 0; i < 10; i++) {
      if (!output.loading) {
        // cancelled
        return;
      }

      await sleep(100);
    }

    elapsed_seconds++;
  }

  const api_get_result_url =
    backend.base_url + "/api/v2/generate/status/" + request_uuid;

  const result_response = await fetch(api_get_result_url, {
    method: "GET",
  });

  const json_result = await get_json_stable_horde(result_response);
  console.log("json_result", json_result);

  handleOutput(
    "stable_horde",
    backend_id,
    null,
    input_data,
    null,
    null,
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
    case "stable_horde":
      await generateImageStableHorde();
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
    output.loading_progress = null;
    output.loading_message = null;
    output.request_uuid = null;

    try {
      await generateImages();
      output.error_message = null;
    } catch (error) {
      ui.show_latest_result = true;
      output.error_message = error.message;
      console.error(error);
    } finally {
      output.loading = false;
    }
  }
}

async function cancelGeneration() {
  const backend = useBackendStore();
  const output = useOutputStore();
  const ui = useUIStore();

  const api_cancel_url =
    backend.base_url + "/api/v2/generate/status/" + output.request_uuid;

  console.log("api_cancel_url", api_cancel_url);

  const cancel_response = await fetch(api_cancel_url, {
    method: "DELETE",
  });

  const cancel_json = await get_json_stable_horde(cancel_response);
  console.log("cancel_json", cancel_json);

  output.loading = false;
  ui.show_results = false;
}

export { generate, cancelGeneration };
