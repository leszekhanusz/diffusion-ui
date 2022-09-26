<script setup>
import Button from "primevue/button";
import OverlayPanel from "primevue/overlaypanel";
import Slider from "primevue/slider";
import ColorPicker from "primevue/colorpicker";
import { useEditorStore } from "@/stores/editor";
import { useUIStore } from "@/stores/ui";
import {
  closeImage,
  redo,
  toggleDraw,
  toggleEraser,
  toggleMaskView,
  undo,
  updateBrushSize,
} from "@/actions/editor";
import { ref } from "vue";

const editor = useEditorStore();
const ui = useUIStore();

const op = ref(null);

function brushSizeButton() {
  op.value.toggle(event);
}
</script>

<template lang="pug">
.flex.flex-row.justify-content-center
  .toolbar-left
    ColorPicker(v-model="editor.chosen_color", format="hex" :style="{visibility: ui.show_color_picker ? 'visible' : 'hidden'}")
    Button.toolbar-button.brush-circle(:style="{visibility: ui.show_brush ? 'visible' : 'hidden'}", label="Primary", @click="brushSizeButton", class="p-button-raised p-button-rounded p-button-outlined", v-tooltip.bottom="{ value: 'Brush size'}")
      font-awesome-icon(icon="fa-solid fa-circle")
    OverlayPanel(ref="op", :showCloseIcon="false", :dismissable="true" class="brush-size-overlay")
      Slider(@change="updateBrushSize" v-model="editor.brush_size.slider" :min="1" :max="150" :step="2")

    Button.toolbar-button(:style="{ visibility: ui.show_eraser ? 'visible' : 'hidden'}", label="Primary", @click="toggleEraser", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.cursor_mode === 'eraser'}", v-tooltip.bottom="{ value: 'Draw zone to modify'}")
      font-awesome-icon(icon="fa-solid fa-eraser")
    Button.toolbar-button(:style="{visibility: ui.show_pencil ? 'visible' : 'hidden'}", label="Primary", @click="toggleDraw", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.cursor_mode === 'draw'}", v-tooltip.bottom="{ value: 'Draw'}")
      font-awesome-icon(icon="fa-solid fa-pencil")
  .toolbar-center
    Button.toolbar-button(:style="{visibility: ui.show_undo ? 'visible' : 'hidden'}", label="Primary", @click="undo", class="p-button-raised p-button-rounded p-button-outlined", v-tooltip.bottom="{ value: 'undo'}")
      font-awesome-icon(icon="fa-solid fa-rotate-left")
    Button.toolbar-button(:style="{visibility: ui.show_redo ? 'visible' : 'hidden'}", label="Primary", @click="redo", class="p-button-raised p-button-rounded p-button-outlined", v-tooltip.bottom="{ value: 'redo'}")
      font-awesome-icon(icon="fa-solid fa-rotate-right")
  .toolbar-right
    Button.toolbar-button(:style="{visibility: ui.show_mask_button ? 'visible' : 'hidden'}", label="Primary", @click="toggleMaskView", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.editor_view === 'mask'}", v-tooltip.bottom="{ value: 'Show mask'}")
      font-awesome-icon(icon="fa-solid fa-image")
    Button.toolbar-button.close-button(label="Primary", @click="closeImage", class="p-button-text", v-tooltip.bottom="{ value: 'Close'}", style="margin-left: 60px")
      font-awesome-icon(icon="fa-solid fa-xmark")
</template>

<style>
.brush-size-overlay {
  width: 150px;
}
</style>

<style scoped>
.p-colorpicker {
  margin-bottom: 4px;
}

.brush-circle {
  padding-left: 6px !important;
}

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
