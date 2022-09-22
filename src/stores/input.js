import { defineStore } from "pinia";
import { useBackendStore } from "@/stores/backend";

export const useInputStore = defineStore({
  id: "input",
  state: () => ({
    has_image: false, // false = prompt only, true = image or drawing
    is_drawing: false, // wether the canvas is only a drawing or not
    uploaded_image_b64: null, // original image uploaded
    init_image_b64: null, // final generated image from canvas
    mask_image_b64: null, // final generated mask from canvas
    canvas: null, // fabric.js main canvas
    canvas_image: null, // image layer with holes (mask)
    canvas_draw: null, // draw layer with opacity changing with strength
    image_clip: null, // holes in the image (mask)
    emphasize: null, // layer above the image to emphasize the masked areas
    brush: null,
    chosen_color: "0000ff",
    brush_size: {
      eraser: 60,
      draw: 10,
      slider: 60,
    },
    brush_outline: null,
    canvas_history: {
      undo: [],
      redo: [],
    },
    canvas_mask: null,
  }),
  getters: {
    color: function (state) {
      return "#" + state.chosen_color;
    },
    prompt_input: function () {
      const backend = useBackendStore();
      return backend.findInput("prompt");
    },
    seed: function () {
      const backend = useBackendStore();

      if (backend.hasInput("seeds")) {
        return backend.getInput("seeds");
      }

      if (backend.hasInput("seed")) {
        return backend.getInput("seed");
      }

      return "";
    },
    seed_is_set: function (state) {
      const seed = state.seed;

      return seed !== -1 && seed !== "";
    },
  },
  actions: {},
});
