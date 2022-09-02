<script setup>
import { onMounted } from "vue";
import { initCanvas } from "@/actions/editor";

onMounted(() => {
  initCanvas();
});
</script>

<template lang="pug">
canvas.main-canvas(ref="can", width="512", height="512")
</template>

<style>
.canvas-container {
  margin-left: auto;
  margin-right: auto;
  border: 1px solid lightblue;
}
</style>
