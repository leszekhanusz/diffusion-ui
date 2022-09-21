<script setup>
import InputSlider from "@/components/InputSlider.vue";
import InputSwitch from "primevue/inputswitch";
import InputText from "primevue/inputtext";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
template(v-if="backend.current")
  template(v-for="input in backend.current.inputs")
    .flex.flex-column.align-items-center(v-if="!(input.visible===false)", :key="input.id")
      template(v-if="input.type == 'int'")
        InputSlider(:label="input.label" v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="input.step ? input.step: 1" :title="input.description")
      template(v-if="input.type == 'float'")
        InputSlider(:label="input.label" v-model="input.value" :min="input.validation.min" :max="input.validation.max" :step="input.step" :title="input.description")
      template(v-if="(input.type == 'text' || input.type == 'boolean') && input.id !=='prompt' && input.id !=='access_code'")
        .field.grid(:title="input.description")
          label.col-fixed(:for="'input_' + input.id" style="min-width: 150px; margin:auto")
            span {{ input.label }}
          .col
            template(v-if="input.type == 'text'")
              InputText.min-w-full(type="text", :id="'input_' + input.id", v-model="input.value")
            template(v-if="input.type == 'boolean'")
              InputSwitch(v-model="input.value")
</template>

<style scoped>
.field.grid {
  justify-content: center;
}
</style>
