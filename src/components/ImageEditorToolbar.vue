<script setup>
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();

function toggleEraser() {
  if (ui.cursor_mode != "eraser") {
    ui.cursor_mode = "eraser";
  } else {
    ui.cursor_mode = "idle";
  }
  console.log(`UI cursor mode set to ${ui.cursor_mode}`);
}
</script>

<template lang="pug">
.flex.flex-row.justify-content-center
  .toolbar.align-items-center
    Button.toolbar-button(label="Primary", @click="toggleEraser", class="p-button-raised p-button-rounded p-button-outlined", :class="{ active: ui.cursor_mode === 'eraser'}")
      font-awesome-icon(icon="fa-solid fa-eraser")
</template>

<style scoped>
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
