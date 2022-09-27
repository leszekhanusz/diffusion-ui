<script setup>
import InputCanvas from "@/components/editor/InputCanvas.vue";
import ImageEditorToolbar from "@/components/editor/ImageEditorToolbar.vue";
import Image from "primevue/image";
import { useEditorStore } from "@/stores/editor";
import { useUIStore } from "@/stores/ui";

const editor = useEditorStore();
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
      template(v-if="editor.mask_image_b64")
        Image(:src="editor.mask_image_b64")
</template>

<style scoped>
.toolbar {
  max-width: 512px;
  height: 45px;
}
</style>
