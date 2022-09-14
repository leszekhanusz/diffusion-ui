<script setup>
import Galleria from "primevue/galleria";
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ResultImage from "@/components/ResultImage.vue";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
</script>

<template lang="pug">
.result-images
  template(v-if="output.loading")
    ProgressIndicator(v-if="output.loading")
  template(v-else)
    template(v-if="output.error_message")
      ErrorMessage
    template(v-else)
      template(v-if="output.images.length == 1")
        ResultImage(:src="output.images.content[0]", :index="0")
      template(v-else)
        Galleria(:value="output.gallery_images", :numVisible="output.images.length")
          template(#item="slotProps")
            ResultImage(:src="slotProps.item.itemImageSrc", :index="slotProps.item.index")
          template(#thumbnail="slotProps")
            img(:src="slotProps.item.thumbnailImageSrc", style="width: 70px; height: 70px; display: block;")
</template>

<style scoped>
.result-images {
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
