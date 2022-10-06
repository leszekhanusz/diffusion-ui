<script setup>
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";
import ImageThumbnails from "@/components/ImageThumbnails.vue";
import ProgressIndicator from "@/components/ProgressIndicator.vue";

const ui = useUIStore();
const output = useOutputStore();

function thumbnailClick(index) {
  output.images = output.gallery[index];
  ui.show_results = true;
  ui.show_latest_result = false;

  var width = window.innerWidth;

  if (width && width < 1800) {
    ui.hideRightPanel();
  }
}

function progressIndicatorClick() {
  ui.show_latest_result = true;
}
</script>

<template lang="pug">
Sidebar.p-sidebar-md(:visible="ui.right_panel_visible", :showCloseIcon="false" position="right" :modal="false")

  template(#header)
    Button.p-button-secondary.toggler.r(label="Close", @click="ui.hideRightPanel")
      font-awesome-icon(icon="fa-solid fa-angle-right")

  .flex.flex-column.thumbnails
    template(v-for="(images, index) in output.gallery" :key="index")
      ImageThumbnails(:images="images.content" @click="thumbnailClick(index)")
  .thumbnails
    ProgressIndicator.cursor-pointer(v-if="output.loading" @click="progressIndicatorClick")
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
  padding-right: 30px;
}
</style>
