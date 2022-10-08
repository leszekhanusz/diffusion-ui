import { getJson } from "@/actions/generate";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
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

  const request_json = await getJsonStableHorde(request_response);

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

  const json_result = await getJsonStableHorde(result_response);
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

async function cancelGenerationStableHorde() {
  const backend = useBackendStore();
  const output = useOutputStore();
  const ui = useUIStore();

  const api_cancel_url =
    backend.base_url + "/api/v2/generate/status/" + output.request_uuid;

  console.log("api_cancel_url", api_cancel_url);

  const cancel_response = await fetch(api_cancel_url, {
    method: "DELETE",
  });

  const cancel_json = await getJsonStableHorde(cancel_response);
  console.log("cancel_json", cancel_json);

  output.loading = false;
  ui.show_results = false;
}

export { generateImageStableHorde, cancelGenerationStableHorde };
