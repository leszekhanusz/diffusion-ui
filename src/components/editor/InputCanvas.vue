<script setup>
import { onMounted } from "vue";
import { initCanvas } from "@/actions/editor";
import { useEditorStore } from "@/stores/editor";

const editor = useEditorStore();

onMounted(() => {
  console.log("InputCanvas onMounted");
  initCanvas("canvas");
});
</script>

<template lang="pug">
canvas#canvas.main-canvas(:width="editor.canvas_width", :height="editor.canvas_height", style="{max-width: 100vw}")
</template>

<style>
.canvas-container {
  margin-left: auto;
  margin-right: auto;
  border: 1px solid lightblue;
  max-width: 100vw;
  max-height: 100vw;
}

.upper-canvas {
  max-width: 100vw;
  max-height: 100vw;
}
.lower-canvas {
  max-width: 100vw;
  max-height: 100vw;
}
</style>
