<script setup>
import { fabric } from "fabric";
import { useInputStore } from "@/stores/input";
import { onMounted, getCurrentInstance } from "vue";

const input = useInputStore();

onMounted(() => {
  const ref = getCurrentInstance().ctx.$refs.can;
  input.canvas = new fabric.Canvas(ref);
  input.canvas.selection = false;

  input.canvas_mask = new fabric.Canvas();
  input.canvas_mask.selection = false;
  input.canvas_mask.setBackgroundColor("black");
  input.canvas_mask.setHeight(512);
  input.canvas_mask.setWidth(512);

  input.brush = new fabric.PencilBrush();
  input.brush.color = "white";
  input.brush.width = 40;
  input.canvas.freeDrawingBrush = input.brush;
  input.brush.initialize(input.canvas);

  input.canvas.on("path:created", function (e) {
    const path = e.path;
    path.selectable = false;

    path.opacity = 1;
    input.canvas.add(path);

    input.canvas_history.push({ type: "erase", path: path });

    input.canvas_mask.add(path);
    input.mask_image_b64 = input.canvas_mask.toDataURL();
  });
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
