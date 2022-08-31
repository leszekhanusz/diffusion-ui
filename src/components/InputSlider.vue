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
.field.grid
  label.col-fixed.first-col(for="model")
    | {{ label }}: {{ modelValue }}
  Slider.col-fixed(@change="onChanged" :modelValue="modelValue" :min="min" :max="max" :step="step")
  label.col-fixed.description.text-overflow-clip
    | {{ description }}
</template>

<style scoped>
label.first-col {
  width: 200px;
}

label.description {
  color: lightgrey;
  max-width: 100%;
}

.p-slider-horizontal {
  width: 14rem;
  margin-top: 10px;
}
</style>
