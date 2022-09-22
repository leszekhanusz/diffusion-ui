<script setup>
import Slider from "primevue/slider";

const emit = defineEmits(["update:modelValue"]);

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "props" }]*/
const props = defineProps({
  label: String,
  description: String,
  modelValue: Number,
  min: Number,
  max: Number,
  step: Number,
});

function onChanged(e) {
  emit("update:modelValue", e);
}
</script>

<template lang="pug">
Slider(@change="onChanged" :modelValue="modelValue" :min="min" :max="max" :step="step")
</template>

<style scoped>
.p-slider-horizontal {
  width: 80%;
  vertical-align: middle;
  margin-left: 10%;
  margin-right: 10%;
  display: inline-block;
}
</style>
