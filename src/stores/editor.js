import { defineStore } from "pinia";

export const useEditorStore = defineStore({
  id: "editor",
  state: () => ({
    has_image: false, // false = prompt only, true = image or drawing
    uploaded_image_b64: null, // original image uploaded
    init_image_b64: null, // final generated image from canvas
    mask_image_b64: null, // final generated mask from canvas
    canvas: null, // fabric.js main canvas
    canvas_mask: null, // generated fabric.js canvas for the mask
    layers: {
      // layers from top to bottom
      brush_outline: null, // Circle outline used to show a cursor for erasing or drawing
      emphasize: null, // fabric.js Group layer above the image to emphasize the masked areas
      image: null, // image layer with holes defined in image_clip
      draw: null /* fabric.js Group containing:
                      - for images:
                        * the original image
                        * all the drawn strokes
                      - for drawings:
                        * a white rectangle
                        * all the drawn strokes
                  This layer opacity will change depending on strength*/,
      // Below is a simulated transparent pattern
    },
    image_clip: null, // holes defined in the image layer (same as mask)
    brush: null, // fabric.PencilBrush
    chosen_color: "0000ff", // value returned from the color picker component
    brush_size: {
      // brush size, we're keeping different size for drawing or erasing
      eraser: 60,
      draw: 10,
      slider: 60,
    },
    history: {
      // complete history of the strokes (erasing and drawing)
      undo: [],
      redo: [],
    },
    mode: "txt2img", // "txt2img", "img2img" or "inpainting"
    width: 512, // canvas width
    height: 512, // canvas height
    zoom_max: 5,
    zoom_min: 0.4,
  }),
  getters: {
    color: function (state) {
      return "#" + state.chosen_color;
    },
    is_drawing: (state) => state.uploaded_image_b64 === null,
    img_format: function () {
      return "png";
    },
  },
  actions: {},
});
