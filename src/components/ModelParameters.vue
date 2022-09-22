<script setup>
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import InputSlider from "@/components/InputSlider.vue";
import InputSwitch from "primevue/inputswitch";
import InputText from "primevue/inputtext";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
template(v-if="backend.current")
  template(v-for="input in backend.current.inputs")
    .field.grid(v-if="input.visible!==false && input.id !== 'prompt' && input.id !== 'access_code' && input.type!=='image' && input.type!=='image_mask'", :key="input.id" :title="input.description" class="justify-content-center")
      template(v-if="input.type === 'int' || input.type === 'float'")
        label(:for="'input_' + input.id" class="col-10 lg:col-4 justify-content-center lg:justify-content-end")
          | {{ input.label }}
          span(class="inline lg:hidden") : {{input.value}}
        label(class="col-1 col-offset-1 hidden lg:block")
          | {{input.value}}
        div(class="col-12 lg:col-5")
          InputSlider(:label="input.label" v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="input.step ? input.step: 1" :title="input.description")
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
:deep() .p-inputtext {
  padding: 0.35rem 0.75rem;
}
:deep() .p-dropdown-label {
  padding: 0.15rem 0.75rem;
}
:deep() .p-inputnumber-input {
  padding: 0.15rem 0.75rem;
}
.field {
  margin-bottom: 0.5rem;
}
.field > label {
  margin-bottom: 0;
}
</style>
