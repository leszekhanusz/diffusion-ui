<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { changeModel } from "@/actions/generate";

const backend = useBackendStore();
const output = useOutputStore();
</script>

<template lang="pug">
.flex.flex-column.align-items-center
  Dropdown#backend(optionLabel="label", optionValue="id", optionGroupLabel="label" optionGroupChildren="backends" v-model="backend.backend_id", :options="backend.backend_options" title="Selection of the server backend")

  template(v-if="backend.models_input && backend.models_input.validation.options.length > 1")
    Dropdown#model(:loading="output.loading_model" @change="changeModel" v-model="backend.models_input.value" :options="backend.models_input.validation.options" :title="backend.models_input.description" :disabled="output.loading" class="w-full lg:w-min")
</template>

<style scoped>
label.col-fixed {
  width: 200px;
}
:deep() #model .p-dropdown-label {
  padding: 0.15rem 0.75rem;
}

#model {
  margin-top: 8px;
}
</style>

<style>
li.p-dropdown-item-group {
  font-size: 20px;
  text-decoration: underline;
}
</style>
