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
        editor.image_clip.remove(undo_action.clip_path);
        editor.canvas_mask.remove(undo_action.mask_path);
        editor.layers.emphasize.remove(undo_action.emphasize_path);

        delete undo_action.clip_path;
        delete undo_action.mask_path;
        delete undo_action.emphasize_path;

        renderCanvasMask();
        break;

      case "draw":
        editor.layers.draw.remove(undo_action.draw_path);

        delete undo_action.draw_path;
        break;
    }

    editor.canvas.renderAll();
  }
}

async function doAction(action) {
  const editor = useEditorStore();

  switch (action.type) {
    case "erase":
      action.clip_path = await asyncClone(action.path);
      action.mask_path = await asyncClone(action.path);
      action.emphasize_path = await asyncClone(action.path);

      action.emphasize_path.stroke = "lightgrey";

      editor.image_clip.addWithUpdate(action.clip_path);
      editor.canvas_mask.add(action.mask_path);
      editor.layers.emphasize.addWithUpdate(action.emphasize_path);

      renderCanvasMask();
      break;

    case "draw":
      action.draw_path = await asyncClone(action.path);

      editor.layers.draw.addWithUpdate(action.draw_path);
      break;
  }
}

async function redo() {
  const editor = useEditorStore();

  const action = editor.history.redo.pop();

  if (action) {
    await doAction(action);
    editor.canvas.renderAll();

    editor.history.undo.push(action);
  }
}

async function redoWholeHistory(undo) {
  const nb_undo = undo.length;
  for (let i = 0; i < nb_undo; i++) {
    const action = undo[i];
    await doAction(action);
  }
}

function resetEditorActions() {
  const editor = useEditorStore();

  // Remove existing layers
  if (editor.layers.image) {
    editor.canvas.remove(editor.layers.image);
    editor.layers.image = null;
  }

  if (editor.image_clip) {
    editor.image_clip = null;
  }

  if (editor.layers.draw) {
    editor.canvas.remove(editor.layers.draw);
    editor.layers.draw = null;
  }

  if (editor.layers.emphasize) {
    editor.canvas.remove(editor.layers.emphasize);
    editor.layers.emphasize = null;
  }

  editor.canvas_mask = null;
  editor.uploaded_image_b64 = null;
  editor.mask_image_b64 = null;

  editor.history = {
    undo: [],
    redo: [],
  };
}

async function onKeyUp(event) {
  if (event.ctrlKey) {
    switch (event.key) {
      case "z":
        undo();
        break;
      case "y":
        await redo();
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

function addToCanvas(name, item) {
  const editor = useEditorStore();

  item.nam = name;

  editor.canvas.add(item);

  console.log(`Adding ${name} to canvas.`);
}

function updateDrawLayerOpacity() {
  const backend = useBackendStore();
  const editor = useEditorStore();

  if (editor.layers.draw) {
    const opacity = 1 - backend.getInput("strength", 0);

    editor.layers.draw.set("opacity", opacity);
  }
}

function makeNewCanvasMask() {
  const editor = useEditorStore();

  editor.canvas_mask = new fabric.Canvas();
  editor.canvas_mask.selection = false;
  editor.canvas_mask.setBackgroundColor("white");
  editor.canvas_mask.setHeight(editor.height);
  editor.canvas_mask.setWidth(editor.width);

  let canvas_mask_background = new fabric.Rect({
    width: editor.width,
    height: editor.height,
    left: 0,
    top: 0,
    fill: "black",
    absolutePositioned: true,
    selectable: false,
  });

  editor.canvas_mask.add(canvas_mask_background);
}

function makeNewImageClip() {
  const editor = useEditorStore();

  editor.image_clip = new fabric.Group([], { absolutePositioned: true });
  editor.image_clip.inverted = true;
}

function makeNewLayerEmphasize() {
  const editor = useEditorStore();

  editor.layers.emphasize = new fabric.Group([], {
    absolutePositioned: true,
    opacity: 0.2,
    selectable: false,
  });
}

async function makeNewLayerImage(image) {
  const editor = useEditorStore();

  image.selectable = false;

  let width = image.width;
  let height = image.height;

  console.log(`Uploaded image with resolution: ${width}x${height}`);

  if (width !== 512 || height !== 512) {
    if (width > height) {
      image.scaleToWidth(512);

      height = Math.floor(512 * (height / width));
      width = 512;
    } else {
      image.scaleToHeight(512);

      width = Math.floor(512 * (width / height));
      height = 512;
    }
    console.log(`Scaled resolution: ${width}x${height}`);
  }

  // new editor.image_clip
  makeNewImageClip();

  image.clipPath = editor.image_clip;
  editor.layers.image = image;

  return { width, height };
}

async function makeNewLayerDraw(image) {
  const backend = useBackendStore();
  const editor = useEditorStore();

  let draw_background;

  if (image) {
    draw_background = await asyncClone(image);
  } else {
    backend.setInput("strength", 0, false);

    draw_background = new fabric.Rect({
      width: editor.width,
      height: editor.height,
      left: 0,
      top: 0,
      fill: "white",
      absolutePositioned: true,
      selectable: false,
    });
  }

  editor.layers.draw = new fabric.Group([draw_background], {
    selectable: false,
    absolutePositioned: true,
  });
}

function makeNewEditorBrush() {
  const editor = useEditorStore();

  editor.brush = new fabric.PencilBrush();
  editor.brush.color = "white";
  editor.brush.width = editor.brush_size.eraser;
  editor.canvas.freeDrawingBrush = editor.brush;
  editor.brush.initialize(editor.canvas);
}

function makeNewTransparentBackground() {
  const editor = useEditorStore();

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
}

function makeNewLayerBrushOutline() {
  const editor = useEditorStore();

  editor.layers.brush_outline = new fabric.Circle({
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
}

function onMouseMove(opt) {
  const editor = useEditorStore();
  const ui = useUIStore();
  const evt = opt.e;

  if (ui.cursor_mode === "idle") {
    if (this.isDragging) {
      let vpt = this.viewportTransform;
      vpt[4] += evt.clientX - this.lastPosX;
      vpt[5] += evt.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;

      renderCanvasMask();
    }
  } else {
    var pointer = editor.canvas.getPointer(evt);
    editor.layers.brush_outline.left = pointer.x;
    editor.layers.brush_outline.top = pointer.y;
    editor.layers.brush_outline.opacity = 0.9;

    switch (ui.cursor_mode) {
      case "eraser":
        editor.layers.brush_outline.set("strokeWidth", 3);
        editor.layers.brush_outline.set("fill", "");
        editor.layers.brush_outline.set("radius", editor.brush_size.eraser / 2);
        break;

      case "draw":
        editor.layers.brush_outline.set("strokeWidth", 0);
        editor.layers.brush_outline.set("fill", editor.color);
        editor.layers.brush_outline.set("radius", editor.brush_size.draw / 2);
        editor.brush.color = editor.color;
        break;
    }

    editor.canvas.renderAll();
  }
}

function onMouseOut() {
  const editor = useEditorStore();

  editor.layers.brush_outline.opacity = 0;

  editor.canvas.renderAll();
}

function onMouseDown(opt) {
  console.log("mouseDown", opt);

  const evt = opt.e;

  this.isDragging = true;
  this.lastPosX = evt.clientX;
  this.lastPosY = evt.clientY;
}

function onMouseUp(opt) {
  console.log("mouseUp", opt);

  this.setViewportTransform(this.viewportTransform);
  this.isDragging = false;
}

function onMouseWheel(opt) {
  const editor = useEditorStore();

  const canvas = editor.canvas;
  const zoom_min = editor.zoom_min;
  const zoom_max = editor.zoom_max;

  const evt = opt.e;
  const delta = evt.deltaY;

  let previous_zoom = canvas.getZoom();
  let zoom = previous_zoom * 0.999 ** delta;

  console.log(`zoom previous: ${previous_zoom}, new: ${zoom}`);
  if (zoom > zoom_max) {
    zoom = zoom_max;
  } else if (zoom < zoom_min) {
    zoom = zoom_min;
  }

  if ((zoom >= 1 && previous_zoom < 1) || (zoom <= 1 && previous_zoom > 1)) {
    // Reset the zoom and panning of the canvas
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    editor.canvas.renderAll();
  } else {
    canvas.zoomToPoint(
      {
        x: evt.offsetX,
        y: evt.offsetY,
      },
      zoom
    );
  }

  renderCanvasMask();

  evt.preventDefault();
  evt.stopPropagation();

  // Change the mode to inpainting if we zoom out
  setModeToImg2ImgOrInpainting();
}

async function onPathCreated(e) {
  const editor = useEditorStore();
  const ui = useUIStore();

  const path = e.path;
  path.selectable = false;

  path.opacity = 1;

  editor.history.redo.length = 0;
  editor.canvas.remove(path);

  switch (ui.cursor_mode) {
    case "eraser":
      {
        path.color = "white";

        const eraser_action = {
          type: "erase",
          path: path,
        };

        await doAction(eraser_action);

        editor.history.undo.push(eraser_action);

        // Update the opacity depending on the strength
        updateDrawLayerOpacity();

        // Change the mode to inpainting if needed
        editor.mode = "inpainting";
      }
      break;

    case "draw":
      {
        path.stroke = editor.color;

        const draw_action = {
          type: "draw",
          path: path,
        };

        await doAction(draw_action);

        editor.history.undo.push(draw_action);
      }
      break;
  }

  editor.canvas.renderAll();
}

function setupEventListeners() {
  const editor = useEditorStore();

  editor.canvas.on("mouse:down", onMouseDown);
  editor.canvas.on("mouse:up", onMouseUp);
  editor.canvas.on("mouse:move", onMouseMove);
  editor.canvas.on("mouse:out", onMouseOut);
  editor.canvas.on("mouse:wheel", onMouseWheel);
  editor.canvas.on("path:created", onPathCreated);
}

function initCanvas(canvas_id) {
  const editor = useEditorStore();

  console.log("Init canvas!");

  // new fabric canvas
  editor.canvas = new fabric.Canvas(canvas_id);
  editor.canvas.selection = false;
  editor.canvas.freeDrawingCursor = "none";

  // put a transparent pattern as the editor.canvas background
  makeNewTransparentBackground();

  // new editor.brush (PencilBrush) associated to editor.canvas
  makeNewEditorBrush();

  // new editor.canvas_mask
  makeNewCanvasMask();

  // new editor.layers.brush_outline
  makeNewLayerBrushOutline();

  // Add to layers to canvas
  addToCanvas("brush_outline", editor.layers.brush_outline);

  // listen to canvas events
  setupEventListeners();
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

function isCanvasMaskEmpty() {
  // Ignoring pixels at the edge of the mask because apparently
  // after zooming in and out, the black rectangle in the canvas mask
  // is not reset completely right, leaving a grey row and column of 1 pixel
  const editor = useEditorStore();

  const canvas_mask = editor.canvas_mask;
  const context = canvas_mask.getContext();
  const width = canvas_mask.width;
  const height = canvas_mask.height;
  const imageData = context.getImageData(0, 0, width, height);
  const pixelData = new Uint32Array(imageData.data.buffer);

  const blackColor = 0xff000000;

  let isBlack = true;

  // Iterate through the pixel data and check if any pixel is not the specified color
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      const pixelColor = pixelData[y * width + x];
      if (pixelColor !== blackColor) {
        isBlack = false;
        break;
      }
    }
    if (!isBlack) {
      break;
    }
  }

  return isBlack;
}

function setModeToImg2ImgOrInpainting() {
  const editor = useEditorStore();

  if (isCanvasMaskEmpty()) {
    editor.mode = "img2img";
  } else {
    editor.mode = "inpainting";
  }
}

function renderCanvasMask() {
  const editor = useEditorStore();

  // Set the viewport of the mask same as the canvas
  // This will reset the zoom level and panning of the canvas mask
  editor.canvas_mask.setViewportTransform(editor.canvas.viewportTransform);

  editor.canvas_mask.renderAll();

  // Regenerate canvas mask image
  editor.mask_image_b64 = editor.canvas_mask.toDataURL({
    format: editor.img_format,
  });
}

function renderImage() {
  const editor = useEditorStore();
  const img_format = editor.img_format;

  console.log(`Rendering image with format: ${img_format}`);

  let emphasize_opacity = 0;

  // Save opacity of ignored layers
  if (editor.layers.emphasize) {
    emphasize_opacity = editor.layers.emphasize.opacity;
    editor.layers.emphasize.set("opacity", 0);
  }

  const draw_opacity = editor.layers.draw.opacity;
  // Set the opacity to capture final image
  editor.layers.draw.set("opacity", 1);

  // render the image in the store
  editor.init_image_b64 = editor.canvas.toDataURL({ format: img_format });

  // Restore the initial opacity
  if (editor.layers.emphasize) {
    editor.layers.emphasize.set("opacity", emphasize_opacity);
  }
  editor.layers.draw.set("opacity", draw_opacity);
}

async function fabricImageFromURL(image_url) {
  return new Promise(function (resolve, reject) {
    try {
      fabric.Image.fromURL(
        image_url,
        function (image) {
          resolve(image);
        }.bind(this),
        {
          crossOrigin: "anonymous",
        }
      );
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

  // Remove existing layers
  resetEditorActions();

  editor.has_image = true;
  editor.mode = "img2img";

  // will allow the inputs to be changed to img2img (useful for strength input change)
  await nextTick();

  // Waiting that the canvas has been created asynchronously by Vue
  while (editor.canvas === null) {
    console.log(".");
    await nextTick();
  }

  let image = null;
  let width = 512;
  let height = 512;

  // Reset the zoom and viewport of the canvas
  editor.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];

  if (image_b64) {
    editor.uploaded_image_b64 = image_b64;

    image = await fabricImageFromURL(image_b64);

    // make editor.layers.image with new editor.image_clip
    ({ width, height } = await makeNewLayerImage(image));
  }

  // Save new image aspect ratio and modify canvas size if needed
  if (editor.width !== width) {
    editor.width = width;
    editor.canvas.setWidth(editor.width);
  }
  if (editor.height !== height) {
    editor.height = height;
    editor.canvas.setHeight(editor.height);
  }

  // new editor.layers.draw with either white rect or image
  await makeNewLayerDraw(image);

  // Update the opacity of the draw layer depending on the strength
  updateDrawLayerOpacity();

  addToCanvas("draw", editor.layers.draw);

  if (image) {
    // new editor.layers.emphasize
    makeNewLayerEmphasize();

    addToCanvas("image", editor.layers.image);
    addToCanvas("emphasize", editor.layers.emphasize);
  }

  // Keep the brush at the front
  editor.canvas.bringToFront(editor.layers.brush_outline);

  // new editor.canvas_mask
  makeNewCanvasMask();
}

function resetEditorButtons() {
  const ui = useUIStore();
  const editor = useEditorStore();

  ui.cursor_mode = "idle";
  ui.editor_view = "composite";
  if (editor.canvas) {
    editor.canvas.isDrawingMode = false;
    editor.layers.brush_outline.opacity = 0;
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

  if (output.images.history) {
    // If the output was made using an uploaded image or a drawing
    await editNewImage(output.images.original_image);
    await redoWholeHistory(output.images.history.undo);
    editor.history.undo = [...output.images.history.undo];
  } else {
    closeImage();
  }

  resetInputsFromResultImage(image_index);
}

function newDrawing() {
  console.log("New drawing requested");
  editNewImage();
}

function closeImage() {
  const editor = useEditorStore();

  resetEditorActions();
  resetEditorButtons();
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
  const backend = useBackendStore();
  const ui = useUIStore();

  if (ui.cursor_mode !== "eraser") {
    if (backend.inpainting_allowed) {
      setCursorMode("eraser");
    } else {
      backend.$toast.add({
        severity: "warn",
        detail: "Inpainting is not allowed with this model",
        life: 3000,
        closable: false,
      });
    }
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

function renderCanvas() {
  const editor = useEditorStore();

  if (editor.canvas) {
    editor.canvas.renderAll();
  }
}

export {
  closeImage,
  editNewImage,
  editResultImage,
  generateAgainResultImage,
  initCanvas,
  newDrawing,
  redo,
  renderCanvas,
  renderImage,
  resetEditorButtons,
  toggleDraw,
  toggleEraser,
  toggleMaskView,
  undo,
  updateBrushSize,
  updateDrawLayerOpacity,
  onKeyUp,
};
