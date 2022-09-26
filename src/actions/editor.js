import { fabric } from "fabric";
import { nextTick } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { useEditorStore } from "@/stores/editor";
import { useUIStore } from "@/stores/ui";
import { resetInputsFromResultImage } from "@/actions/output";

function undo({ save_redo = true } = {}) {
  const editor = useEditorStore();

  const undo_action = editor.history.undo.pop();

  if (undo_action) {
    if (save_redo) {
      editor.history.redo.push(undo_action);
    }

    switch (undo_action.type) {
      case "erase":
        editor.image_clip.remove(undo_action.path);
        editor.canvas_mask.remove(undo_action.mask_path);
        editor.emphasize.remove(undo_action.emphasize_path);

        editor.mask_image_b64 = editor.canvas_mask.toDataURL();
        break;

      case "draw":
        editor.canvas_draw.remove(undo_action.path);
        break;
    }

    editor.canvas.renderAll();
  }
}

function redo_action(action) {
  const editor = useEditorStore();

  switch (action.type) {
    case "erase":
      editor.image_clip.add(action.path);
      editor.canvas_mask.add(action.mask_path);
      editor.emphasize.add(action.emphasize_path);

      editor.mask_image_b64 = editor.canvas_mask.toDataURL();
      break;

    case "draw":
      editor.canvas_draw.add(action.path);
      break;
  }
}

function redo() {
  const editor = useEditorStore();

  const action = editor.history.redo.pop();

  if (action) {
    redo_action(action);
    editor.canvas.renderAll();

    editor.history.undo.push(action);
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
  const editor = useEditorStore();

  editor.image_clip._objects.length = 0;
  editor.image_clip.dirty = true;

  editor.canvas_mask = new fabric.Canvas();
  editor.canvas_mask.selection = false;
  editor.canvas_mask.setBackgroundColor("black");
  editor.canvas_mask.setHeight(editor.canvas_height);
  editor.canvas_mask.setWidth(editor.canvas_width);

  editor.mask_image_b64 = null;

  editor.emphasize._objects.length = 0;
  editor.emphasize.dirty = true;

  if (editor.canvas_draw) {
    editor.canvas_draw._objects.length = 0;
    editor.canvas_draw.dirty = true;
  }

  editor.history = {
    undo: [],
    redo: [],
  };

  editor.canvas.renderAll();
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
  const editor = useEditorStore();

  const objects = editor.canvas.getObjects();

  console.log("PRINT");
  objects.forEach(object => console.log(object.nam));
}
*/

function add_to_canvas(name, item) {
  const editor = useEditorStore();

  item.nam = name;

  editor.canvas.add(item);

  console.log(`Adding ${name} to canvas.`);
}

function initCanvas(canvas_id) {
  const backend = useBackendStore();
  const editor = useEditorStore();
  const ui = useUIStore();

  console.log("Init canvas!");

  editor.canvas = new fabric.Canvas(canvas_id);
  editor.canvas.selection = false;

  editor.canvas_mask = new fabric.Canvas();
  editor.canvas_mask.selection = false;
  editor.canvas_mask.setBackgroundColor("black");
  editor.canvas_mask.setHeight(editor.canvas_height);
  editor.canvas_mask.setWidth(editor.canvas_width);

  editor.image_clip = new fabric.Group([], { absolutePositioned: true });
  editor.image_clip.inverted = true;

  editor.emphasize = new fabric.Group([], {
    absolutePositioned: true,
    opacity: 0.2,
    selectable: false,
  });

  add_to_canvas("emphasize", editor.emphasize);

  editor.brush = new fabric.PencilBrush();
  editor.brush.color = "white";
  editor.brush.width = editor.brush_size.eraser;
  editor.canvas.freeDrawingBrush = editor.brush;
  editor.brush.initialize(editor.canvas);

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

  editor.canvas.setBackgroundColor(transparentBackground());

  editor.brush_outline = new fabric.Circle({
    left: 0,
    right: 0,
    originX: "center",
    originY: "center",
    radius: editor.brush_size.eraser,
    angle: 0,
    fill: "",
    stroke: "#b25d5d",
    strokeDashArray: [4, 6, 1],
    strokeWidth: 3,
    opacity: 0,
  });

  add_to_canvas("brush_outline", editor.brush_outline);
  editor.canvas.freeDrawingCursor = "none";

  editor.canvas.on("mouse:move", function (o) {
    if (ui.cursor_mode !== "idle") {
      var pointer = editor.canvas.getPointer(o.e);
      editor.brush_outline.left = pointer.x;
      editor.brush_outline.top = pointer.y;
      editor.brush_outline.opacity = 0.9;

      switch (ui.cursor_mode) {
        case "eraser":
          editor.brush_outline.set("strokeWidth", 3);
          editor.brush_outline.set("fill", "");
          editor.brush_outline.set("radius", editor.brush_size.eraser / 2);
          break;

        case "draw":
          editor.brush_outline.set("strokeWidth", 0);
          editor.brush_outline.set("fill", editor.color);
          editor.brush_outline.set("radius", editor.brush_size.draw / 2);
          editor.brush.color = editor.color;
          break;
      }

      editor.canvas.renderAll();
    }
  });

  editor.canvas.on("mouse:out", function () {
    editor.brush_outline.opacity = 0;

    editor.canvas.renderAll();
  });

  editor.canvas.on("path:created", async function (e) {
    const path = e.path;
    path.selectable = false;

    path.opacity = 1;

    editor.history.redo.length = 0;
    editor.canvas.remove(path);

    switch (ui.cursor_mode) {
      case "eraser":
        {
          path.color = "white";

          // Clone the path twice: for the mask and for the emphasize layer
          const mask_path = await asyncClone(path);
          const emphasize_path = await asyncClone(path);

          // Add the path to the mask canvas and regenerate the mask image
          editor.canvas_mask.add(mask_path);
          editor.mask_image_b64 = editor.canvas_mask.toDataURL();

          // Add the path to the image clip group
          editor.image_clip.addWithUpdate(path);

          // Add the path to the emphasize front layer
          emphasize_path.stroke = "lightgrey";
          emphasize_path.opacity = 1;
          editor.emphasize.addWithUpdate(emphasize_path);

          editor.history.undo.push({
            type: "erase",
            path: path,
            mask_path: mask_path,
            emphasize_path: emphasize_path,
          });

          // Update the opacity depending on the strength
          if (backend.strength_input) {
            editor.canvas_draw.set(
              "opacity",
              1 - backend.strength_input.value.value
            );
          }

          // Change the mode to inpainting if needed
          editor.mode = "inpainting";
        }
        break;

      case "draw":
        path.stroke = editor.color;
        editor.canvas_draw.addWithUpdate(path);

        editor.history.undo.push({
          type: "draw",
          path: path,
        });

        break;
    }

    editor.canvas.renderAll();
  });

  document.addEventListener("keyup", keyUpHandler);
}

function updateBrushSize() {
  const editor = useEditorStore();
  const ui = useUIStore();

  editor.brush.width = editor.brush_size.slider;

  if (ui.cursor_mode === "eraser") {
    editor.brush_size.eraser = editor.brush_size.slider;
  } else if (ui.cursor_mode === "draw") {
    editor.brush_size.draw = editor.brush_size.slider;
  }
}

function renderImage() {
  const editor = useEditorStore();

  // Save opacity of ignored layers
  const emphasize_opacity = editor.emphasize.opacity;
  const draw_opacity = editor.canvas_draw.opacity;

  // Set the opacity to capture final image
  editor.emphasize.set("opacity", 0);
  editor.canvas_draw.set("opacity", 1);

  // render the image in the store
  editor.init_image_b64 = editor.canvas.toDataURL();

  // Restore the initial opacity
  editor.emphasize.set("opacity", emphasize_opacity);
  editor.canvas_draw.set("opacity", draw_opacity);
}

function _editNewImage(image, transparent_image) {
  const backend = useBackendStore();
  const editor = useEditorStore();

  const is_drawing = image === undefined;
  editor.is_drawing = is_drawing;

  var canvas_draw_background;

  if (is_drawing) {
    if (backend.strength_input) {
      backend.strength_input.value = 0;
    }
    canvas_draw_background = new fabric.Rect({
      width: editor.canvas_width,
      height: editor.canvas_height,
      left: 0,
      top: 0,
      fill: "white",
      absolutePositioned: true,
      selectable: false,
    });
  } else {
    canvas_draw_background = transparent_image;
  }

  editor.canvas_draw = new fabric.Group([canvas_draw_background], {
    selectable: false,
    absolutePositioned: true,
  });

  if (backend.strength_input) {
    editor.canvas_draw.set("opacity", 1 - backend.strength_input.value);
  }

  add_to_canvas("draw", editor.canvas_draw);

  if (image) {
    add_to_canvas("image", image);
    image.clipPath = editor.image_clip;
    editor.canvas_image = image;
  }

  if (is_drawing) {
    editor.emphasize.set("opacity", 0);
  } else {
    editor.emphasize.set("opacity", 0.2);
  }

  editor.canvas.bringToFront(editor.emphasize);
  editor.canvas.bringToFront(editor.brush_outline);
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

async function asyncClone(object) {
  return new Promise(function (resolve, reject) {
    try {
      object.clone(function (cloned_object) {
        resolve(cloned_object);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function editNewImage(image_b64) {
  const editor = useEditorStore();

  resetEditorActions();

  // Forget history
  editor.history.redo.length = 0;

  editor.has_image = true;

  if (editor.canvas_image) {
    editor.canvas.remove(editor.canvas_image);
    editor.canvas_image = null;
  }

  if (editor.canvas_draw) {
    editor.canvas.remove(editor.canvas_draw);
    editor.canvas_draw = null;
  }

  // Waiting that the canvas has been created asynchronously by Vue
  while (editor.canvas === null) {
    console.log(".");
    await nextTick();
  }

  if (image_b64) {
    editor.uploaded_image_b64 = image_b64;

    const image = await fabricImageFromURL(image_b64);
    image.selectable = false;

    const width = image.width;
    const height = image.height;
    console.log(`Uploaded image with resolution: ${width}x${height}`);

    if (width === 512 && height === 512) {
      editor.canvas_width = width;
      editor.canvas_height = height;
    } else {
      if (width > height) {
        image.scaleToWidth(512);

        editor.canvas_width = 512;
        editor.canvas_height = 512 * (height / width);
      } else {
        image.scaleToHeight(512);

        editor.canvas_height = 512;
        editor.canvas_width = 512 * (width / height);
      }
      console.log(
        `Scaled resolution: ${editor.canvas_width}x${editor.canvas_height}`
      );
    }

    editor.canvas.setWidth(editor.canvas_width);
    editor.canvas.setHeight(editor.canvas_height);

    editor.canvas_mask.setWidth(editor.canvas_width);
    editor.canvas_mask.setHeight(editor.canvas_height);

    const transparent_image = await asyncClone(image);

    _editNewImage(image, transparent_image);
  } else {
    _editNewImage();
  }

  editor.mode = "img2img";
}

function resetEditorButtons() {
  const ui = useUIStore();
  const editor = useEditorStore();

  ui.cursor_mode = "idle";
  ui.editor_view = "composite";
  if (editor.canvas) {
    editor.canvas.isDrawingMode = false;
    editor.brush_outline.opacity = 0;
    editor.canvas.renderAll();
  }
}

function editResultImage(image_index) {
  const output = useOutputStore();
  editNewImage(output.images.content[image_index]);
}

async function generateAgainResultImage(image_index) {
  const editor = useEditorStore();
  const output = useOutputStore();

  resetInputsFromResultImage(image_index);

  if (output.images.history) {
    // If the output was made using an uploaded image or a drawing
    await editNewImage(output.images.original_image);
    redo_whole_history(output.images.history.undo);
    editor.history.undo = [...output.images.history.undo];
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
  const editor = useEditorStore();

  resetEditorActions();
  resetEditorButtons();
  editor.uploaded_image_b64 = null;
  editor.has_image = false;
  editor.mode = "txt2img";
}

function setCursorMode(cursor_mode) {
  const ui = useUIStore();
  const editor = useEditorStore();

  ui.cursor_mode = cursor_mode;

  if (ui.cursor_mode === "idle") {
    editor.canvas.isDrawingMode = false;
  } else {
    editor.canvas.isDrawingMode = true;

    if (ui.cursor_mode === "eraser") {
      editor.brush_size.slider = editor.brush_size.eraser;
      editor.brush.color = "white";
    } else if (ui.cursor_mode === "draw") {
      editor.brush_size.slider = editor.brush_size.draw;
      editor.brush.color = editor.color;
    }

    editor.brush.width = editor.brush_size.slider;
    editor.canvas.renderAll();
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
