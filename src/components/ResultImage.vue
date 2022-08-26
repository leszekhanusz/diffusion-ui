<script setup>
import Image from "primevue/image";
import { onMounted } from "vue";
import { usePromptStore } from "@/stores/prompt";

const store = usePromptStore();

onMounted(() => {
  console.log(`The initial image is '${store.image_b64}'.`);
});
</script>

<template lang="pug">
.result-image(v-if="store.image_b64 != null")
  Image(:src="store.image_b64")
</template>

<style scoped>
.result-image {
  width: 100%;
  display: flex;
  justify-content: center;
}

.p-image {
  padding: 20px;
}

img {
  width: 512px;
  height: 512px;
}
</style>
