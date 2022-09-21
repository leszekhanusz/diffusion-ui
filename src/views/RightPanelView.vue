<script setup>
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";
import ImageThumbnails from "@/components/ImageThumbnails.vue";

const ui = useUIStore();
const output = useOutputStore();

function thumbnailClick(index) {
  output.images = output.gallery[index];
  ui.show_results = true;
  ui.hideRightPanel();
}
</script>

<template lang="pug">
Sidebar.p-sidebar-md(:visible="ui.right_panel_visible", :showCloseIcon="false" position="right")

  template(#header)
    Button.p-button-secondary.toggler.r(label="Close", @click="ui.hideRightPanel")
      font-awesome-icon(icon="fa-solid fa-angle-right")

  .flex.flex-column.thumbnails
    template(v-for="(images, index) in output.gallery" :key="index")
      ImageThumbnails(:images="images.content" @click="thumbnailClick(index)")
</template>

<style>
.p-sidebar-right .p-sidebar-header {
  display: block;
}

.p-sidebar .toggler.r {
  border-radius: 0px 5px 5px 0px !important;
}

.thumbnails {
  padding-top: 40px;
  padding-left: 30px;
}
</style>
