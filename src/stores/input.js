import { defineStore } from "pinia";

export const useInputStore = defineStore({
  id: "input",
  state: () => ({
    prompt: "Cute bunny",
    uploaded_image_b64: null,
    init_image_b64: null,
    mask_image_b64: null,
    canvas: null,
    canvas_image: null,
    canvas_draw: null,
    image_clip: null,
    emphasize: null,
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
    undo_levels: 0,
  }),
  getters: {
    color: function (state) {
      return "#" + state.chosen_color;
    },
  },
  actions: {},
});
