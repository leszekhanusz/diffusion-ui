import { fabric } from "fabric";
import { nextTick } from "vue";
import { useOutputStore } from "@/stores/output";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";

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
        break;

      case "draw":
        input.canvas_draw.add(redo_action.path);
        break;
    }

    input.canvas.renderAll();
  }
}

function resetMask() {
  const input = useInputStore();

  for (var i = 0; i < input.canvas_history.undo.length; i++) {
    undo({ save_redo: false });
  }

  input.mask_image_b64 = null;
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
  const ui = useUIStore();

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

  input.canvas.add(input.brush_outline);
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

    switch (ui.cursor_mode) {
      case "eraser":
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

            input.canvas.renderAll();
          });
        });
        break;

      case "draw":
        input.canvas_draw.addWithUpdate(path);
        input.canvas.remove(path);
        input.canvas.renderAll();

        input.canvas_history.undo.push({
          type: "draw",
          path: path,
        });

        break;
    }
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

function editNewImage(image_b64) {
  const input = useInputStore();

  resetMask();

  input.uploaded_image_b64 = image_b64;

  fabric.Image.fromURL(image_b64, async function (image) {
    image.selectable = false;

    // Waiting that the canvas has been created asynchronously by Vue
    while (input.canvas === null) {
      console.log(".");
      await nextTick();
    }

    image.scaleToHeight(input.canvas.height);

    image.clone(function (transparent_image) {
      input.canvas_draw = new fabric.Group([transparent_image], {
        absolutePositioned: true,
      });

      transparent_image.set("opacity", 0.5);

      input.canvas.add(input.canvas_draw);

      input.canvas.add(image);
      input.canvas.add(input.emphasize);

      image.clipPath = input.image_clip;

      input.canvas_image = image;

      input.canvas.bringToFront(input.brush_outline);
    });
  });
}

function resetEditorButtons() {
  const ui = useUIStore();
  const input = useInputStore();

  ui.cursor_mode = "idle";
  ui.editor_view = "composite";
  if (input.canvas) {
    input.canvas.isDrawingMode = false;
  }
  input.brush_outline.opacity = 0;
  input.canvas.renderAll();
}

function editResultImage(image_index) {
  const output = useOutputStore();
  editNewImage(output.images[image_index]);
}

function closeImage() {
  const input = useInputStore();

  resetMask();
  resetEditorButtons();
  input.canvas.clear();
  input.uploaded_image_b64 = null;
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
  initCanvas,
  redo,
  renderImage,
  resetEditorButtons,
  toggleDraw,
  toggleEraser,
  toggleMaskView,
  undo,
  updateBrushSize,
};
