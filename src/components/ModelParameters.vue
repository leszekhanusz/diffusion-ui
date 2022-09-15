<script setup>
import InputSlider from "@/components/InputSlider.vue";
import InputText from "primevue/inputtext";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
template(v-if="backend.current")
  template(v-for="input in backend.current.inputs")
    .flex.flex-column.align-items-center(v-if="!(input.visible===false)", :key="input.id")
      template(v-if="input.type == 'int'")
        InputSlider(:label="input.label" v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="1" :title="input.description")
      template(v-if="input.type == 'float'")
        InputSlider(:label="input.label" v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="input.step" :title="input.description")
      template(v-if="input.type == 'text' && input.id !=='prompt'")
        span.p-float-label
          InputText(type="text", id="input.id", v-model="input.value", :title="input.description")
          label(for="input.id") {{ input.label }}
</template>

<style scoped>
.field.grid {
  justify-content: center;
}
</style>
