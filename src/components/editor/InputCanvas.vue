<script setup>
import { onMounted } from "vue";
import { initCanvas } from "@/actions/editor";
import { useInputStore } from "@/stores/input";

const input = useInputStore();

onMounted(() => {
  console.log("InputCanvas onMounted");
  initCanvas("canvas");
});
</script>

<template lang="pug">
canvas#canvas.main-canvas(:width="input.canvas_width", :height="input.canvas_height", style="{max-width: 100vw}")
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
