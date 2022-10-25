import { getJson } from "@/actions/generate";
import { useBackendStore } from "@/stores/backend";
import { useEditorStore } from "@/stores/editor";
import { useOutputStore } from "@/stores/output";
import { useStableHordeStore } from "@/stores/stablehorde";
import { useUIStore } from "@/stores/ui";
import { renderImage } from "@/actions/editor";
import { handleOutput } from "@/actions/output";
import { sleep } from "@/actions/sleep";

async function getJsonStableHorde(response) {
  try {
    return await getJson(response);
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

async function generateImageStableHorde() {
  const backend = useBackendStore();
  const editor = useEditorStore();
  const output = useOutputStore();
  const sh_store = useStableHordeStore();

  const original_image = editor.uploaded_image_b64;
  const history = editor.has_image ? editor.history : null;

  const inputs_config = backend.inputs;

  const backend_id = backend.backend_id;

  const input_data = Object.assign(
    {},
    ...inputs_config.map((x) => ({ [x["id"]]: x["value"] }))
  );

  const api_key = input_data.api_key;

  const root_keys = [
    "prompt",
    "nsfw",
    "censor_nsfw",
    "source_image",
    "workers",
  ];

  const image_input = backend.getImageInput();

  if (editor.has_image) {
    // Create final image in input.init_image_b64
    renderImage("webp");

    const image_value = editor.init_image_b64;
    const ignored_prefix = "data:image/webp;base64,";
    image_input.value = image_value.slice(ignored_prefix.length);
  } else {
    image_input.value = null;
  }

  const frame = inputs_config.reduce(
    function (result, input) {
      const input_id = input.id;

      if (input_id === "api_key") {
        return result;
      }

      if (input_id === "source_image" && !input.value) {
        return result;
      }

      if (input_id === "strength" && !editor.has_image) {
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

  const request_json = await getJsonStableHorde(request_response);

  const request_uuid = request_json.id;

  output.request_uuid = request_uuid;

  const api_check_url =
    backend.base_url + "/api/v2/generate/check/" + request_uuid;
  console.log("api_check_url", api_check_url);

  let elapsed_seconds = 0;

  for (;;) {
    try {
      const check_response = await fetch(api_check_url, {
        method: "GET",
      });

      const check_json = await getJsonStableHorde(check_response);

      const done = check_json.done;
      const wait_time = check_json.wait_time;

      const percentage = 100 * (1 - wait_time / (wait_time + elapsed_seconds));
      output.loading_progress = Math.round(percentage * 100) / 100;
      output.loading_message = `Estimated wait time: ${wait_time}s`;
      console.log(`${output.loading_progress.toFixed(2)}%`);

      if (done) {
        break;
      }
    } catch (e) {
      break;
    }

    for (let i = 0; i < 10; i++) {
      if (!output.loading_images) {
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

  const json_result = await getJsonStableHorde(result_response);
  console.log("json_result", json_result);

  handleOutput(
    "stable_horde",
    backend_id,
    null,
    input_data,
    original_image,
    history,
    json_result
  );

  // Update the kudos count
  if (!sh_store.anonymous) {
    getUserInfoStableHorde();
  }
}

async function cancelGenerationStableHorde() {
  const backend = useBackendStore();
  const output = useOutputStore();
  const ui = useUIStore();

  const api_cancel_url =
    backend.base_url + "/api/v2/generate/status/" + output.request_uuid;

  const cancel_response = await fetch(api_cancel_url, {
    method: "DELETE",
  });

  const cancel_json = await getJsonStableHorde(cancel_response);
  console.log("cancel_json", cancel_json);

  output.loading_images = false;
  ui.show_results = false;
}

async function getUserInfoStableHorde() {
  const backend = useBackendStore();
  const output = useOutputStore();
  const sh_store = useStableHordeStore();
  const api_key = sh_store.api_key;

  output.loading_user_info = true;
  try {
    const api_finduser_url = backend.base_url + "/api/v2/find_user";

    const finduser_response = await fetch(api_finduser_url, {
      method: "GET",
      headers: {
        apikey: api_key,
      },
    });

    const finduser_json = await getJsonStableHorde(finduser_response);
    console.log("finduser_json", finduser_json);

    sh_store.user_info = finduser_json;
  } catch (e) {
    sh_store.user_info = null;
  } finally {
    output.loading_user_info = false;
  }
}

export {
  cancelGenerationStableHorde,
  generateImageStableHorde,
  getUserInfoStableHorde,
};
