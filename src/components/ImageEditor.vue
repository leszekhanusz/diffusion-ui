<script setup>
import InputCanvas from "@/components/InputCanvas.vue";
import ImageEditorToolbar from "@/components/ImageEditorToolbar.vue";
</script>

<template lang="pug">
.flex.flex-column
  .flex.flex-row.justify-content-center
    .toolbar.align-items-center
      ImageEditorToolbar
  InputCanvas
</template>

<style scoped>
.toolbar {
  width: 512px;
  height: 45px;
}
</style>
