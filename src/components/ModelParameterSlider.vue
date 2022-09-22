<script setup>
import InputSlider from "@/components/InputSlider.vue";

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "props" }]*/
const props = defineProps({
  input: Object,
});
</script>

<template lang="pug">
label(:for="'input_' + input.id" class="col-10 lg:col-4 justify-content-center lg:justify-content-end")
  | {{ input.label }}
  span(class="inline lg:hidden") : {{input.value}}
label(class="col-1 col-offset-1 hidden lg:block")
  | {{input.value}}
div(class="col-12 lg:col-5")
  InputSlider(:label="input.label" v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="input.step ? input.step: 1" :title="input.description")
</template>

<style scoped>
.field {
  margin-bottom: 0.5rem;
}
.field > label {
  margin-bottom: 0;
}
</style>
