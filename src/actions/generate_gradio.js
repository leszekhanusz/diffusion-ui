import { getJson } from "@/actions/generate";
import { useEditorStore } from "@/stores/editor";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { renderImage } from "@/actions/editor";
import { handleOutput } from "@/actions/output";
import { sleep } from "@/actions/sleep";

async function check_progress(progress_status) {
  const backend = useBackendStore();
  const output = useOutputStore();

  const payload = {
    id_task: progress_status.id_task,
    id_live_preview: progress_status.id_live_preview,
  };

  const body = JSON.stringify(payload);

  try {
    const result = await fetch(backend.progress_url, {
      method: "POST",
      body: body,
      headers: { "Content-Type": "application/json" },
    });

    if (progress_status.cancelled) {
      return;
    }

    const json_result = await getJson(result);

    //const active = json_result.active;
    //const queued = json_result.queued;
    const completed = json_result.completed;
    const progress = json_result.progress;
    //const eta = json_result.eta;
    const id_live_preview = json_result.id_live_preview;

    progress_status.id_live_preview = id_live_preview;

    if (progress) {
      output.loading_progress = progress * 100;
    }

    if (completed) {
      progress_status.cancelled = true;
    }

    const image_preview_data = json_result.live_preview;

    if (image_preview_data) {
      output.image_preview = image_preview_data;
    }
  } catch (e) {
    // Nothing here, error simply ignored
  }
}

async function check_progress_loop(progress_status) {
  const backend = useBackendStore();

  if (!backend.current.progress_path) {
    return;
  }

  progress_status.cancel = function () {
    progress_status.cancelled = true;
  };

  while (!progress_status.cancelled) {
    await sleep(500);
    await check_progress(progress_status);
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

  const id_task = "task(" + Math.random().toString(36).slice(2) + ")";
  input_data["label"] = id_task;

  // selected tab in img2img tag:
  // img2img = 0, sketch, inpaint, inpaint sketch, inpaint upload = 4, batch)
  const img2img_type = editor.mask_image_b64 ? 4 : 0;
  input_data["label_0"] = img2img_type;

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

  let progress_status = {
    id_task: id_task,
    id_live_preview: -1,
    cancelled: false,
  };

  const responses = await Promise.all([
    check_progress_loop(progress_status),
    (async function () {
      try {
        const result = await fetch(backend.api_url, {
          method: "POST",
          body: body,
          headers: { "Content-Type": "application/json" },
        });
        return result;
      } finally {
        if (progress_status.cancel) {
          progress_status.cancel();
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

async function changeModelGradio() {
  const backend = useBackendStore();

  const models_input = backend.models_input;
  if (!models_input) {
    return;
  }

  const fn_index = backend.model_change_fn_index;

  if (!fn_index) {
    return;
  }

  const requested_model = models_input.value;
  console.log(`Requesting changing model to ${requested_model}`);

  const payload = {
    data: [requested_model],
    fn_index: fn_index,
  };

  const body = JSON.stringify(payload);

  await fetch(backend.api_url, {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" },
  });
}

async function initModelDropdown() {
  const backend = useBackendStore();

  const fn_index = backend.model_change_load_fn_index;

  if (!fn_index) {
    return;
  }

  const payload = {
    data: [],
    fn_index: fn_index,
  };

  const body = JSON.stringify(payload);

  const response = await fetch(backend.api_url, {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" },
  });

  const json_result = await getJson(response);

  const model = json_result.data[0];
  console.log(`Current model: ${model}`);

  backend.models_input.value = model;
}

async function initGradio() {
  await initModelDropdown();
}

export {
  cancelGenerationGradio,
  changeModelGradio,
  generateImageGradio,
  initGradio,
};
