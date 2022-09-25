<script setup>
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import ModelParameterSlider from "@/components/ModelParameterSlider.vue";
import InputSwitch from "primevue/inputswitch";
import InputText from "primevue/inputtext";
import { useBackendStore } from "@/stores/backend";
import { computed } from "vue";

const backend = useBackendStore();

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "props" }]*/
const props = defineProps({
  input: Object,
});

const isVisible = computed(() => {
  return backend.isInputVisible(props.input.id);
});
</script>

<template lang="pug">
.field.grid(v-if="input && isVisible", :title="input.description" class="justify-content-center")
  template(v-if="input.type === 'int' || input.type === 'float'")
    ModelParameterSlider(:input="input")
  template(v-if="input.type == 'text' || input.type == 'choice' || input.type == 'bigint'")
    label(:for="'input_' + input.id" class="col-12 lg:col-4 justify-content-center lg:justify-content-end")
      | {{ input.label }}
    div(class="col-12 lg:col-6 lg:col-offset-1")
      template(v-if="input.type == 'text'")
        InputText.min-w-full(type="text", :id="'input_' + input.id", v-model="input.value")
      template(v-if="input.type == 'choice'")
        Dropdown(v-model="input.value" :options="input.validation.options" class="w-full lg:w-min")
      template(v-if="input.type == 'bigint'")
        InputNumber.flex(mode="decimal" showButtons v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="input.step ? input.step: 1" :title="input.description" :useGrouping="false")
  template(v-if="input.type == 'boolean'")
    label(:for="'input_' + input.id" class="col-6 lg:col-4 justify-content-center lg:justify-content-end")
      | {{ input.label }}
    div(class="col-6 lg:col-6 lg:col-offset-1")
      template(v-if="input.type == 'boolean'")
        InputSwitch(v-model="input.value")
</template>

<style scoped>
.field {
  margin-bottom: 0.5rem;
}
.field > label {
  margin-bottom: 0;
}
</style>
