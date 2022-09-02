<script setup>
import InputCanvas from "@/components/editor/InputCanvas.vue";
import ImageEditorToolbar from "@/components/editor/ImageEditorToolbar.vue";
import Image from "primevue/image";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";

const input = useInputStore();
const ui = useUIStore();
</script>

<template lang="pug">
.flex.flex-column
  .flex.flex-row.justify-content-center
    .toolbar.align-items-center
      ImageEditorToolbar
  .flex.flex-row.justify-content-center
    div(v-show="ui.editor_view=='composite'")
      InputCanvas(v-show="ui.editor_view=='composite'")
    div(v-show="ui.editor_view=='mask'")
      template(v-if="input.mask_image_b64")
        Image(:src="input.mask_image_b64")
</template>

<style scoped>
.toolbar {
  width: 512px;
  height: 45px;
}
</style>
