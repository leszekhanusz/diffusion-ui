<script setup>
import Image from "primevue/image";

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "props" }]*/
const props = defineProps({
  images: Array,
});
</script>

<template lang="pug">
.flex.flex-row.gap-1.grow
  template(v-for="(image, index) in images" :key="index")
    Image(:src="image", width="64", height="64")
</template>

<style scoped>
.grow {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.grow:hover {
  transform: scale(1.1);
}
</style>
