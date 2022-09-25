<script setup>
import Galleria from "primevue/galleria";
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ResultImage from "@/components/ResultImage.vue";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
const responsiveOptions = [
  {
    breakpoint: "960px",
    numVisible: 4,
  },
  {
    breakpoint: "768px",
    numVisible: 3,
  },
  {
    breakpoint: "560px",
    numVisible: 2,
  },
];
</script>

<template lang="pug">
.result-images
  template(v-if="output.loading")
    ProgressIndicator(v-if="output.loading")
  template(v-else)
    template(v-if="output.error_message")
      ErrorMessage
    template(v-else)
      template(v-if="output.images.content.length == 1")
        ResultImage(:src="output.images.content[0]", :index="0")
      template(v-else)
        Galleria(:value="output.gallery_images", :numVisible="Math.min(output.gallery_images.length, 4)", :responsiveOptions="responsiveOptions")
          template(#item="slotProps")
            template(v-if="slotProps.item")
              ResultImage(:src="slotProps.item.itemImageSrc", :index="slotProps.item.index")
          template(#thumbnail="slotProps")
            template(v-if="slotProps.item")
              img(:src="slotProps.item.thumbnailImageSrc", style="width: 70px; height: 70px;")
</template>

<style scoped>
:deep() .p-galleria-content {
  max-width: min(100vw, 512px);
}
:deep() .p-galleria-item {
  max-width: min(100vw, 512px);
}
.result-images {
  margin: auto;
  max-width: min(100vw, 512px);
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
