<script setup>
import Button from "primevue/button";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";

const input = useInputStore();
const ui = useUIStore();

function toggleEraser() {
  if (ui.cursor_mode != "eraser") {
    ui.cursor_mode = "eraser";
    input.canvas.isDrawingMode = true;
  } else {
    ui.cursor_mode = "idle";
    input.canvas.isDrawingMode = false;
  }
  console.log(`UI cursor mode set to ${ui.cursor_mode}`);
}

function toggleMaskView() {
  if (ui.editor_view != "composite") {
    ui.editor_view = "composite";
  } else {
    ui.editor_view = "mask";
  }
  console.log(`UI editor mode set to ${ui.editor_view}`);
}
</script>

<template lang="pug">
.flex.flex-row.justify-content-center
  .toolbar-center
    Button.toolbar-button(v-show="ui.editor_view==='composite'", label="Primary", @click="toggleEraser", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.cursor_mode === 'eraser'}", v-tooltip.bottom="{ value: 'Draw zone to inpaint'}")
      font-awesome-icon(icon="fa-solid fa-eraser")
  .toolbar-right
    Button.toolbar-button(v-show="ui.cursor_mode==='idle' && input.mask_image_b64 !== null", label="Primary", @click="toggleMaskView", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.editor_view === 'mask'}", v-tooltip.bottom="{ value: 'Show mask'}")
      font-awesome-icon(icon="fa-solid fa-image")
</template>

<style scoped>
.toolbar-right {
  margin-left: auto;
}
.toolbar-center {
  margin-left: 50%;
}
.toolbar-button {
  width: 30px;
  padding-left: 5px;
  color: black !important;
  box-shadow: none !important;
}

.toolbar-button.active {
  transform: translateY(1px);
  border-color: currentColor !important;
  background-color: grey !important;
  color: white !important;
}
</style>
