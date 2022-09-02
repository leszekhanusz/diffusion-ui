<script setup>
import { onMounted } from "vue";
import { initCanvas } from "@/actions/editor";

onMounted(() => {
  initCanvas("canvas");
});
</script>

<template lang="pug">
canvas#canvas.main-canvas(width="512", height="512")
</template>

<style>
.canvas-container {
  margin-left: auto;
  margin-right: auto;
  border: 1px solid lightblue;
}
</style>
