<script setup>
import Button from "primevue/button";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";
import { closeImage, toggleEraser, toggleMaskView } from "@/actions/editor";

const input = useInputStore();
const ui = useUIStore();
</script>

<template lang="pug">
.flex.flex-row.justify-content-center
  .toolbar-center
    Button.toolbar-button(v-show="ui.editor_view==='composite'", label="Primary", @click="toggleEraser", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.cursor_mode === 'eraser'}", v-tooltip.bottom="{ value: 'Draw zone to inpaint'}")
      font-awesome-icon(icon="fa-solid fa-eraser")
  .toolbar-right
    Button.toolbar-button(v-show="ui.cursor_mode==='idle' && input.mask_image_b64 !== null", label="Primary", @click="toggleMaskView", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.editor_view === 'mask'}", v-tooltip.bottom="{ value: 'Show mask'}")
      font-awesome-icon(icon="fa-solid fa-image")
    Button.toolbar-button.close-button(label="Primary", @click="closeImage", class="p-button-text", v-tooltip.bottom="{ value: 'Close'}", style="margin-left: 60px")
      font-awesome-icon(icon="fa-solid fa-xmark")
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
