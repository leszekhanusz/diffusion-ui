import { fabric } from "fabric";
import { nextTick } from "vue";
import { useOutputStore } from "@/stores/output";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";

function undo() {
  const input = useInputStore();

  const undo_action = input.canvas_history.undo.pop();

  if (undo_action) {
    input.canvas_history.redo.push(undo_action);

    switch (undo_action.type) {
      case "erase":
        input.image_clip.remove(undo_action.path);
        input.canvas_mask.remove(undo_action.mask_path);
        input.emphasize.remove(undo_action.emphasize_path);

        input.mask_image_b64 = input.canvas_mask.toDataURL();
        input.canvas.renderAll();
        break;
    }
  }
}

function redo() {
  const input = useInputStore();

  const redo_action = input.canvas_history.redo.pop();

  if (redo_action) {
    input.canvas_history.undo.push(redo_action);

    switch (redo_action.type) {
      case "erase":
        input.image_clip.add(redo_action.path);
        input.canvas_mask.add(redo_action.mask_path);
        input.emphasize.add(redo_action.emphasize_path);

        input.mask_image_b64 = input.canvas_mask.toDataURL();
        input.canvas.renderAll();
        break;
    }
  }
}

function keyUpHandler(event) {
  if (event.ctrlKey) {
    switch (event.key) {
      case "z":
        undo();
        break;
      case "y":
        redo();
        break;
    }
  } else {
    switch (event.key) {
      case "Escape":
        resetEditorButtons();

        break;
    }
  }
}

function initCanvas(canvas_id) {
  const input = useInputStore();

  input.canvas = new fabric.Canvas(canvas_id);
  input.canvas.selection = false;

  input.canvas_mask = new fabric.Canvas();
  input.canvas_mask.selection = false;
  input.canvas_mask.setBackgroundColor("black");
  input.canvas_mask.setHeight(512);
  input.canvas_mask.setWidth(512);

  input.image_clip = new fabric.Group([], { absolutePositioned: true });
  input.image_clip.inverted = true;

  input.emphasize = new fabric.Group([], {
    absolutePositioned: true,
    opacity: 0.4,
  });

  input.brush = new fabric.PencilBrush();
  input.brush.color = "white";
  input.brush.width = 40;
  input.canvas.freeDrawingBrush = input.brush;
  input.brush.initialize(input.canvas);

  const transparentBackground = function () {
    const chess_canvas = new fabric.StaticCanvas(null, {
      enableRetinaScaling: false,
    });
    chess_canvas.setHeight(10);
    chess_canvas.setWidth(10);
    chess_canvas.setBackgroundColor("lightgrey");

    const rect1 = new fabric.Rect({
      width: 5,
      height: 5,
      left: 0,
      top: 0,
      fill: "rgba(150, 150, 150, 1)",
    });

    const rect2 = new fabric.Rect({
      width: 5,
      height: 5,
      left: 5,
      top: 5,
      fill: "rgba(150, 150, 150, 1)",
    });

    chess_canvas.add(rect1);
    chess_canvas.add(rect2);

    const transparent_pattern = new fabric.Pattern({
      source: chess_canvas.getElement(),
      repeat: "repeat",
    });
    return transparent_pattern;
  };

  input.canvas.setBackgroundColor(transparentBackground());

  input.canvas.on("path:created", function (e) {
    const path = e.path;
    path.selectable = false;

    path.opacity = 1;
    path.color = "white";

    path.clone(function (mask_path) {
      path.clone(function (emphasize_path) {
        // Add the path to the mask canvas and regenerate the mask image
        input.canvas_mask.add(mask_path);
        input.mask_image_b64 = input.canvas_mask.toDataURL();

        // Remove the path from the main canvas and add it to the image clip group
        input.canvas.remove(path);
        input.image_clip.addWithUpdate(path);

        // Add the path to the emphasize front layer
        emphasize_path.color = "blue";
        emphasize_path.opacity = 1;
        input.emphasize.addWithUpdate(emphasize_path);

        input.canvas_history.undo.push({
          type: "erase",
          path: path,
          mask_path: mask_path,
          emphasize_path: emphasize_path,
        });

        input.canvas_history.redo.length = 0;

        input.canvas.renderAll();
      });
    });
  });

  document.addEventListener("keyup", keyUpHandler);
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

    image.clone(function (transparent_image) {
      input.canvas_draw = transparent_image;

      transparent_image.set("opacity", 0.5);

      input.canvas.add(transparent_image);

      input.canvas.add(image);
      input.canvas.add(input.emphasize);

      image.clipPath = input.image_clip;

      input.canvas_image = image;
    });
  });
}

function resetMask() {
  const input = useInputStore();

  input.canvas_history.undo.forEach(function (history_event) {
    if (history_event.type === "erase") {
      const path = history_event.path;
      input.canvas.remove(path);
      input.canvas_mask.remove(path);
    }
  });

  // Clear the history
  input.canvas_history.undo.length = 0;
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
  redo,
  resetEditorButtons,
  toggleEraser,
  toggleMaskView,
  undo,
};
