import { fabric } from "fabric";
import { nextTick } from "vue";
import { useOutputStore } from "@/stores/output";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";

function initCanvas(canvas_id) {
  const input = useInputStore();

  input.canvas = new fabric.Canvas(canvas_id);
  input.canvas.selection = false;

  input.canvas_mask = new fabric.Canvas();
  input.canvas_mask.selection = false;
  input.canvas_mask.setBackgroundColor("black");
  input.canvas_mask.setHeight(512);
  input.canvas_mask.setWidth(512);

  input.brush = new fabric.PencilBrush();
  input.brush.color = "white";
  input.brush.width = 40;
  input.canvas.freeDrawingBrush = input.brush;
  input.brush.initialize(input.canvas);

  input.canvas.on("path:created", function (e) {
    const path = e.path;
    path.selectable = false;

    path.opacity = 1;
    input.canvas.add(path);

    input.canvas_history.push({ type: "erase", path: path });

    input.canvas_mask.add(path);
    input.mask_image_b64 = input.canvas_mask.toDataURL();
  });
}

function editNewImage(image_b64) {
  const input = useInputStore();

  resetMask();

  input.uploaded_image_b64 = image_b64;

  fabric.Image.fromURL(image_b64, async function (image) {
    // Waiting that the canvas has been created asynchronously by Vue
    while (input.canvas === null) {
      console.log(".");
      await nextTick();
    }

    image.scaleToHeight(input.canvas.height);
    image.set("strokeWidth", 0);
    image.clipTo = function (ctx) {
      ctx.rect(0, 0, 512, 512);
    };
    input.canvas.add(image);
    input.canvas.renderAll();
  });
}

function resetMask() {
  const input = useInputStore();

  input.canvas_history.forEach(function (history_event) {
    if (history_event.type === "erase") {
      const path = history_event.path;
      input.canvas.remove(path);
      input.canvas_mask.remove(path);
    }
  });

  // Clear the history
  input.canvas_history.length = 0;
  input.mask_image_b64 = null;
}

function resetEditorButtons() {
  const ui = useUIStore();
  const input = useInputStore();

  ui.cursor_mode = "idle";
  ui.editor_view = "composite";
  if (input.canvas) {
    input.canvas.isDrawingMode = false;
  }
}

function editResultImage(image_index) {
  const output = useOutputStore();
  editNewImage(output.images[image_index]);
}

function closeImage() {
  const input = useInputStore();

  resetMask();
  input.canvas.clear();
  input.uploaded_image_b64 = null;
}

function toggleEraser() {
  const ui = useUIStore();
  const input = useInputStore();

  if (ui.cursor_mode != "eraser") {
    ui.cursor_mode = "eraser";
    input.canvas.isDrawingMode = true;
  } else {
    ui.cursor_mode = "idle";
    input.canvas.isDrawingMode = false;
  }
  console.log(`UI cursor mode set to ${ui.cursor_mode}`);
}

function toggleMaskView() {
  const ui = useUIStore();

  if (ui.editor_view != "composite") {
    ui.editor_view = "composite";
  } else {
    ui.editor_view = "mask";
  }
  console.log(`UI editor mode set to ${ui.editor_view}`);
}

export {
  closeImage,
  editNewImage,
  editResultImage,
  initCanvas,
  resetEditorButtons,
  toggleEraser,
  toggleMaskView,
};
