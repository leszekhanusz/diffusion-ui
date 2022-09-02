import { defineStore } from "pinia";

export const useUIStore = defineStore({
  id: "ui",
  state: () => ({
    left_panel_visible: false,
    cursor_mode: "idle",
    editor_view: "composite",
  }),
  getters: {},
  actions: {
    showLeftPanel() {
      this.left_panel_visible = true;
    },
    hideLeftPanel() {
      this.left_panel_visible = false;
    },
  },
});
