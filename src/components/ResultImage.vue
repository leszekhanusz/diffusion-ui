<script setup>
import Image from "primevue/image";
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
</script>

<template lang="pug">
.result-image
  Image(:src="output.image_b64", v-if="output.image_b64 != null && !output.loading")
  ProgressIndicator(v-if="output.loading")
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
