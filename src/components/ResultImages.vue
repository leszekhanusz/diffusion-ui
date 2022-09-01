<script setup>
import Image from "primevue/image";
import Galleria from "primevue/galleria";
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
</script>

<template lang="pug">
.result-image
  template(v-if="output.loading")
    ProgressIndicator(v-if="output.loading")
  template(v-else)
    template(v-if="output.error_message")
      ErrorMessage
    template(v-else)
      template(v-if="output.images.length == 1")
        Image(:src="output.images[0]")
      template(v-else)
        Galleria(:value="output.gallery_images", :numVisible="4")
          template(#item="slotProps")
            Image(:src="slotProps.item.itemImageSrc")
          template(#thumbnail="slotProps")
            img(:src="slotProps.item.thumbnailImageSrc", style="width: 70px; height: 70px; display: block;")
</template>

<style scoped>
.result-image {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 256px;
}

.p-image {
  padding: 20px;
}

img {
  width: 512px;
  height: 512px;
}
</style>
