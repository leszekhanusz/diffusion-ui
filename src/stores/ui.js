import { defineStore } from "pinia";
import { useInputStore } from "@/stores/input";

export const useUIStore = defineStore({
  id: "ui",
  state: () => ({
    left_panel_visible: false,
    right_panel_visible: false,
    cursor_mode: "idle", // idle, eraser or draw
    editor_view: "composite", // "composite" for the normal view or "mask" to show the mask
    show_results: false,
  }),
  getters: {
    show_brush: (state) => state.cursor_mode !== "idle",
    show_color_picker: (state) => state.cursor_mode === "draw",
    show_eraser: function (state) {
      const input = useInputStore();
      return state.editor_view === "composite" && !input.is_drawing;
    },
    show_pencil: function (state) {
      const input = useInputStore();
      if (input.has_image) {
        if (input.is_drawing) {
          return state.editor_view === "composite";
        } else {
          return (
            state.editor_view === "composite" && input.mask_image_b64 !== null
          );
        }
      } else {
        return false;
      }
    },
    show_undo: function () {
      const input = useInputStore();
      return input.canvas_history.undo.length > 0;
    },
    show_redo: function () {
      const input = useInputStore();
      return input.canvas_history.redo.length > 0;
    },
    show_mask_button: function (state) {
      const input = useInputStore();
      return state.cursor_mode === "idle" && input.mask_image_b64 !== null;
    },
    show_strength_slider: function (state) {
      return state.show_pencil;
    },
  },
  actions: {
    showLeftPanel() {
      this.left_panel_visible = true;
    },
    hideLeftPanel() {
      this.left_panel_visible = false;
    },
    showRightPanel() {
      this.right_panel_visible = true;
    },
    hideRightPanel() {
      this.right_panel_visible = false;
    },
  },
});
