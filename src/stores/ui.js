import { defineStore } from "pinia";
import { useEditorStore } from "@/stores/editor";
import { useBackendStore } from "@/stores/backend";

export const useUIStore = defineStore({
  id: "ui",
  state: () => ({
    left_panel_visible: false,
    right_panel_visible: false,
    edit_url_visible: false,
    edit_url_new_url: "",
    cursor_mode: "idle", // idle, eraser or draw
    editor_view: "composite", // "composite" for the normal view or "mask" to show the mask
    show_results: false,
    show_latest_result: true,
  }),
  getters: {
    show_brush: (state) => state.cursor_mode !== "idle",
    show_color_picker: (state) => state.cursor_mode === "draw",
    show_eraser: function (state) {
      const editor = useEditorStore();
      return state.editor_view === "composite" && !editor.is_drawing;
    },
    show_pencil: function (state) {
      const editor = useEditorStore();
      if (editor.has_image) {
        if (editor.is_drawing) {
          return state.editor_view === "composite";
        } else {
          return (
            state.editor_view === "composite" && editor.mask_image_b64 !== null
          );
        }
      } else {
        return false;
      }
    },
    show_undo: function () {
      const editor = useEditorStore();
      return editor.history.undo.length > 0;
    },
    show_redo: function () {
      const editor = useEditorStore();
      return editor.history.redo.length > 0;
    },
    show_mask_button: function (state) {
      const editor = useEditorStore();
      return state.cursor_mode === "idle" && editor.mask_image_b64 !== null;
    },
    show_strength_slider: function (state) {
      const editor = useEditorStore();
      return editor.has_image && state.editor_view === "composite";
    },
  },
  actions: {
    showEditURL() {
      const backend = useBackendStore();
      this.edit_url_new_url = backend.current.base_url;
      this.edit_url_visible = true;
    },
    hideEditURL() {
      this.edit_url_visible = false;
    },
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
