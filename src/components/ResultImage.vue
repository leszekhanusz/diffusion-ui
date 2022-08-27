<script setup>
import Image from "primevue/image";
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import { onMounted } from "vue";
import { usePromptStore } from "@/stores/prompt";

const store = usePromptStore();

onMounted(() => {
  console.log(`The initial image is '${store.image_b64}'.`);
});
</script>

<template lang="pug">
.result-image
  Image(:src="store.image_b64", v-if="store.image_b64 != null && !store.loading")
  ProgressIndicator(v-if="store.loading")
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
