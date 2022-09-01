<script setup>
import { fabric } from "fabric";
import { useInputStore } from "@/stores/input";
import { onMounted, getCurrentInstance } from "vue";

const input = useInputStore();

onMounted(() => {
  const ref = getCurrentInstance().ctx.$refs.can;
  input.canvas = new fabric.Canvas(ref);
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
