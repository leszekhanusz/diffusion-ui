<script setup>
import ModelParameter from "@/components/ModelParameter.vue";
import LoadConfigButton from "@/components/LoadConfigButton.vue";
import Dropdown from "primevue/dropdown";
import LayoutComponent from "@/components/LayoutComponent.vue";
import Divider from "primevue/divider";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
template(v-if="backend.current")
  template(v-if="backend.needs_gradio_config")
    LoadConfigButton
  template(v-else)
    template(v-if="backend.has_multiple_functions && backend.function_options.length > 1")
      .flex.flex-column.align-items-center
        Dropdown#fn_dropdown(optionLabel="label", optionValue="id", v-model="backend.fn_id", :options="backend.function_options")
      Divider
    template(v-if="backend.current_function.layout !== undefined")
      template(v-for="component in backend.current_function.layout" :key="component.id")
        LayoutComponent(:component="component")
    template(v-else)
      template(v-for="input in backend.inputs" :key="input.id")
        ModelParameter(:input="input")
</template>

<style scoped>
#fn_dropdown {
  margin-bottom: 10px;
}
:deep() .p-inputtext {
  padding: 0.35rem 0.75rem;
}
:deep() .p-dropdown-label {
  padding: 0.15rem 0.75rem;
}
:deep() .p-inputnumber-input {
  padding: 0.15rem 0.75rem;
}
</style>
