<script setup>
import Button from "primevue/button";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";
import {
  closeImage,
  redo,
  toggleEraser,
  toggleMaskView,
  undo,
} from "@/actions/editor";

const input = useInputStore();
const ui = useUIStore();
</script>

<template lang="pug">
.flex.flex-row.justify-content-center
  .toolbar-left
    Button.toolbar-button(:style="{visibility: ui.editor_view==='composite' ? 'visible' : 'hidden'}", label="Primary", @click="toggleEraser", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.cursor_mode === 'eraser'}", v-tooltip.bottom="{ value: 'Draw zone to modify'}")
      font-awesome-icon(icon="fa-solid fa-eraser")
  .toolbar-center
    Button.toolbar-button(:style="{visibility: input.canvas_history.undo.length > 0 ? 'visible' : 'hidden'}", label="Primary", @click="undo", class="p-button-raised p-button-rounded p-button-outlined", v-tooltip.bottom="{ value: 'undo'}")
      font-awesome-icon(icon="fa-solid fa-rotate-left")
    Button.toolbar-button(:style="{visibility: input.canvas_history.redo.length > 0 ? 'visible' : 'hidden'}", label="Primary", @click="redo", class="p-button-raised p-button-rounded p-button-outlined", v-tooltip.bottom="{ value: 'redo'}")
      font-awesome-icon(icon="fa-solid fa-rotate-right")
  .toolbar-right
    Button.toolbar-button(:style="{visibility: ui.cursor_mode==='idle' && input.mask_image_b64 !== null ? 'visible' : 'hidden'}", label="Primary", @click="toggleMaskView", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.editor_view === 'mask'}", v-tooltip.bottom="{ value: 'Show mask'}")
      font-awesome-icon(icon="fa-solid fa-image")
    Button.toolbar-button.close-button(label="Primary", @click="closeImage", class="p-button-text", v-tooltip.bottom="{ value: 'Close'}", style="margin-left: 60px")
      font-awesome-icon(icon="fa-solid fa-xmark")
</template>

<style scoped>
.toolbar-center {
  margin-left: auto;
  margin-right: auto;
}
.toolbar-button {
  width: 30px;
  padding-left: 5px;
  color: black !important;
  box-shadow: none !important;
  margin-left: 3px;
  margin-right: 3px;
}

.toolbar-button.active {
  transform: translateY(1px);
  border-color: currentColor !important;
  background-color: grey !important;
  color: white !important;
}
</style>
