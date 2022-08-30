<script setup>
import Image from "primevue/image";
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
      Image(:src="output.image_b64", v-if="output.image_b64 != null")
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
