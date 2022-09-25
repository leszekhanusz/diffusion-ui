import { fabric } from "fabric";
import { nextTick } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";
import { resetInputsFromResultImage } from "@/actions/output";

function undo({ save_redo = true } = {}) {
  const input = useInputStore();

  const undo_action = input.canvas_history.undo.pop();

  if (undo_action) {
    if (save_redo) {
      input.canvas_history.redo.push(undo_action);
    }

    switch (undo_action.type) {
      case "erase":
        input.image_clip.remove(undo_action.path);
        input.canvas_mask.remove(undo_action.mask_path);
        input.emphasize.remove(undo_action.emphasize_path);

        input.mask_image_b64 = input.canvas_mask.toDataURL();
        break;

      case "draw":
        input.canvas_draw.remove(undo_action.path);
        break;
    }

    input.canvas.renderAll();
  }
}

function redo_action(action) {
  const input = useInputStore();

  switch (action.type) {
    case "erase":
      input.image_clip.add(action.path);
      input.canvas_mask.add(action.mask_path);
      input.emphasize.add(action.emphasize_path);

      input.mask_image_b64 = input.canvas_mask.toDataURL();
      break;

    case "draw":
      input.canvas_draw.add(action.path);
      break;
  }
}

function redo() {
  const input = useInputStore();

  const action = input.canvas_history.redo.pop();

  if (action) {
    redo_action(action);
    input.canvas.renderAll();

    input.canvas_history.undo.push(action);
  }
}

function redo_whole_history(undo) {
  const nb_undo = undo.length;
  for (let i = 0; i < nb_undo; i++) {
    const action = undo[i];
    redo_action(action);
  }
}

function resetEditorActions() {
  const input = useInputStore();

  input.image_clip._objects.length = 0;
  input.image_clip.dirty = true;

  input.canvas_mask = new fabric.Canvas();
  input.canvas_mask.selection = false;
  input.canvas_mask.setBackgroundColor("black");
  input.canvas_mask.setHeight(512);
  input.canvas_mask.setWidth(512);

  input.mask_image_b64 = null;

  input.emphasize._objects.length = 0;
  input.emphasize.dirty = true;

  if (input.canvas_draw) {
    input.canvas_draw._objects.length = 0;
    input.canvas_draw.dirty = true;
  }

  input.canvas_history = {
    undo: [],
    redo: [],
  };

  input.canvas.renderAll();
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

/*
DEBUG
function print_objects() {
  const input = useInputStore();

  const objects = input.canvas.getObjects();

  console.log("PRINT");
  objects.forEach(object => console.log(object.nam));
}
*/

function add_to_canvas(name, item) {
  const input = useInputStore();

  item.nam = name;

  input.canvas.add(item);

  console.log(`Adding ${name} to canvas.`);
}

function initCanvas(canvas_id) {
  const backend = useBackendStore();
  const input = useInputStore();
  const ui = useUIStore();

  console.log("Init canvas!");

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
    opacity: 0.2,
    selectable: false,
  });

  add_to_canvas("emphasize", input.emphasize);

  input.brush = new fabric.PencilBrush();
  input.brush.color = "white";
  input.brush.width = input.brush_size.eraser;
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

  input.brush_outline = new fabric.Circle({
    left: 0,
    right: 0,
    originX: "center",
    originY: "center",
    radius: input.brush_size.eraser,
    angle: 0,
    fill: "",
    stroke: "#b25d5d",
    strokeDashArray: [4, 6, 1],
    strokeWidth: 3,
    opacity: 0,
  });

  add_to_canvas("brush_outline", input.brush_outline);
  input.canvas.freeDrawingCursor = "none";

  input.canvas.on("mouse:move", function (o) {
    if (ui.cursor_mode !== "idle") {
      var pointer = input.canvas.getPointer(o.e);
      input.brush_outline.left = pointer.x;
      input.brush_outline.top = pointer.y;
      input.brush_outline.opacity = 0.9;

      switch (ui.cursor_mode) {
        case "eraser":
          input.brush_outline.set("strokeWidth", 3);
          input.brush_outline.set("fill", "");
          input.brush_outline.set("radius", input.brush_size.eraser / 2);
          break;

        case "draw":
          input.brush_outline.set("strokeWidth", 0);
          input.brush_outline.set("fill", input.color);
          input.brush_outline.set("radius", input.brush_size.draw / 2);
          input.brush.color = input.color;
          break;
      }

      input.canvas.renderAll();
    }
  });

  input.canvas.on("mouse:out", function () {
    input.brush_outline.opacity = 0;

    input.canvas.renderAll();
  });

  input.canvas.on("path:created", function (e) {
    const path = e.path;
    path.selectable = false;

    path.opacity = 1;

    input.canvas_history.redo.length = 0;
    input.canvas.remove(path);

    switch (ui.cursor_mode) {
      case "eraser":
        path.color = "white";
        path.clone(function (mask_path) {
          path.clone(function (emphasize_path) {
            // Add the path to the mask canvas and regenerate the mask image
            input.canvas_mask.add(mask_path);
            input.mask_image_b64 = input.canvas_mask.toDataURL();

            // Add the path to the image clip group
            input.image_clip.addWithUpdate(path);

            // Add the path to the emphasize front layer
            emphasize_path.stroke = "lightgrey";
            emphasize_path.opacity = 1;
            input.emphasize.addWithUpdate(emphasize_path);

            input.canvas_history.undo.push({
              type: "erase",
              path: path,
              mask_path: mask_path,
              emphasize_path: emphasize_path,
            });

            // Update the opacity depending on the strength
            if (backend.strength_input) {
              input.canvas_draw.set(
                "opacity",
                1 - backend.strength_input.value.value
              );
            }

            // Change the mode to inpainting if needed
            backend.changeFunctionForModes(["inpainting"]);
          });
        });
        break;

      case "draw":
        path.stroke = input.color;
        input.canvas_draw.addWithUpdate(path);

        input.canvas_history.undo.push({
          type: "draw",
          path: path,
        });

        break;
    }

    input.canvas.renderAll();
  });

  document.addEventListener("keyup", keyUpHandler);
}

function updateBrushSize() {
  const input = useInputStore();
  const ui = useUIStore();

  input.brush.width = input.brush_size.slider;

  if (ui.cursor_mode === "eraser") {
    input.brush_size.eraser = input.brush_size.slider;
  } else if (ui.cursor_mode === "draw") {
    input.brush_size.draw = input.brush_size.slider;
  }
}

function renderImage() {
  const input = useInputStore();

  // Save opacity of ignored layers
  const emphasize_opacity = input.emphasize.opacity;
  const draw_opacity = input.canvas_draw.opacity;

  // Set the opacity to capture final image
  input.emphasize.set("opacity", 0);
  input.canvas_draw.set("opacity", 1);

  // render the image in the store
  input.init_image_b64 = input.canvas.toDataURL();

  // Restore the initial opacity
  input.emphasize.set("opacity", emphasize_opacity);
  input.canvas_draw.set("opacity", draw_opacity);
}

function _editNewImage(image, transparent_image) {
  const backend = useBackendStore();
  const input = useInputStore();

  const is_drawing = image === undefined;
  input.is_drawing = is_drawing;

  var canvas_draw_background;

  if (is_drawing) {
    if (backend.strength_input) {
      backend.strength_input.value = 0;
    }
    canvas_draw_background = new fabric.Rect({
      width: 512,
      height: 512,
      left: 0,
      top: 0,
      fill: "white",
      absolutePositioned: true,
      selectable: false,
    });
  } else {
    canvas_draw_background = transparent_image;
  }

  input.canvas_draw = new fabric.Group([canvas_draw_background], {
    selectable: false,
    absolutePositioned: true,
  });

  if (backend.strength_input) {
    input.canvas_draw.set("opacity", 1 - backend.strength_input.value);
  }

  add_to_canvas("draw", input.canvas_draw);

  if (image) {
    add_to_canvas("image", image);
    image.clipPath = input.image_clip;
    input.canvas_image = image;
  }

  if (is_drawing) {
    input.emphasize.set("opacity", 0);
  } else {
    input.emphasize.set("opacity", 0.2);
  }

  input.canvas.bringToFront(input.emphasize);
  input.canvas.bringToFront(input.brush_outline);
}

async function fabricImageFromURL(image_url) {
  return new Promise(function (resolve, reject) {
    try {
      fabric.Image.fromURL(image_url, function (image) {
        resolve(image);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function fabricImageClone(image) {
  return new Promise(function (resolve, reject) {
    try {
      image.clone(function (cloned_image) {
        resolve(cloned_image);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function editNewImage(image_b64) {
  const backend = useBackendStore();
  const input = useInputStore();

  resetEditorActions();

  // Forget history
  input.canvas_history.redo.length = 0;

  input.has_image = true;

  if (input.canvas_image) {
    input.canvas.remove(input.canvas_image);
    input.canvas_image = null;
  }

  if (input.canvas_draw) {
    input.canvas.remove(input.canvas_draw);
    input.canvas_draw = null;
  }

  // Waiting that the canvas has been created asynchronously by Vue
  while (input.canvas === null) {
    console.log(".");
    await nextTick();
  }

  if (image_b64) {
    input.uploaded_image_b64 = image_b64;

    const image = await fabricImageFromURL(image_b64);

    image.selectable = false;
    image.scaleToHeight(input.canvas.height);

    const transparent_image = await fabricImageClone(image);

    _editNewImage(image, transparent_image);
  } else {
    _editNewImage();
  }

  // Automatically set the backend function to one which uses images
  backend.changeFunctionForModes(["img2img", "inpainting"]);
}

function resetEditorButtons() {
  const ui = useUIStore();
  const input = useInputStore();

  ui.cursor_mode = "idle";
  ui.editor_view = "composite";
  if (input.canvas) {
    input.canvas.isDrawingMode = false;
    input.brush_outline.opacity = 0;
    input.canvas.renderAll();
  }
}

function editResultImage(image_index) {
  const output = useOutputStore();
  editNewImage(output.images.content[image_index]);
}

async function generateAgainResultImage(image_index) {
  const input = useInputStore();
  const output = useOutputStore();

  resetInputsFromResultImage(image_index);

  if (output.images.canvas_history) {
    // If the output was made using an uploaded image or a drawing
    await editNewImage(output.images.original_image);
    redo_whole_history(output.images.canvas_history.undo);
    input.canvas_history.undo = output.images.canvas_history.undo;
  } else {
    closeImage();
  }
}

function resetSeeds() {
  const backend = useBackendStore();

  const without_toast = false;

  if (backend.hasInput("seeds")) {
    backend.setInput("seeds", "", without_toast);
  }

  if (backend.hasInput("seed")) {
    backend.setInput("seed", -1, without_toast);
  }
}

function newDrawing() {
  console.log("New drawing requested");
  editNewImage();
}

function closeImage() {
  const backend = useBackendStore();
  const input = useInputStore();

  resetEditorActions();
  resetEditorButtons();
  input.uploaded_image_b64 = null;
  input.has_image = false;
  backend.changeFunctionForModes(["txt2img"]);
}

function setCursorMode(cursor_mode) {
  const ui = useUIStore();
  const input = useInputStore();

  ui.cursor_mode = cursor_mode;

  if (ui.cursor_mode === "idle") {
    input.canvas.isDrawingMode = false;
  } else {
    input.canvas.isDrawingMode = true;

    if (ui.cursor_mode === "eraser") {
      input.brush_size.slider = input.brush_size.eraser;
      input.brush.color = "white";
    } else if (ui.cursor_mode === "draw") {
      input.brush_size.slider = input.brush_size.draw;
      input.brush.color = input.color;
    }

    input.brush.width = input.brush_size.slider;
    input.canvas.renderAll();
  }

  console.log(`UI cursor mode set to ${ui.cursor_mode}`);
}

function toggleEraser() {
  const ui = useUIStore();

  if (ui.cursor_mode !== "eraser") {
    setCursorMode("eraser");
  } else {
    setCursorMode("idle");
  }
}

function toggleDraw() {
  const ui = useUIStore();

  if (ui.cursor_mode !== "draw") {
    setCursorMode("draw");
  } else {
    setCursorMode("idle");
  }
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
  generateAgainResultImage,
  initCanvas,
  newDrawing,
  redo,
  renderImage,
  resetEditorButtons,
  resetSeeds,
  toggleDraw,
  toggleEraser,
  toggleMaskView,
  undo,
  updateBrushSize,
};
