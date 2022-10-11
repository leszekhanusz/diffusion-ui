<script setup>
import Galleria from "primevue/galleria";
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import CancelButton from "@/components/CancelButton.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ResultImage from "@/components/ResultImage.vue";
import Image from "primevue/image";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { useUIStore } from "@/stores/ui";

const backend = useBackendStore();
const output = useOutputStore();
const ui = useUIStore();
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
  template(v-if="output.loading_images && ui.show_latest_result")
    .flex.flex-column.w-full.align-items-center
      template(v-if="output.image_preview")
        Image(:src="output.image_preview" imageStyle="max-width: min(100vw, 512px);")
      ProgressIndicator(v-if="output.loading_images")
      template(v-if="backend.cancellable")
        CancelButton
  template(v-else)
    template(v-if="output.error_message")
      ErrorMessage
    template(v-else)
      template(v-if="output.images")
        template(v-if="output.images.content.length == 1")
          ResultImage(v-touch:swipe.top="output.goDown" v-touch:swipe.bottom="output.goUp" :src="output.images.content[0]", :index="0")
        template(v-else)
          Galleria(v-touch:swipe.left="output.goRight" v-touch:swipe.right="output.goLeft" v-touch:swipe.top="output.goDown" v-touch:swipe.bottom="output.goUp" v-model:activeIndex="output.image_index.current" :value="output.gallery_images", :numVisible="Math.min(output.gallery_images.length, 4)", :responsiveOptions="responsiveOptions")
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
