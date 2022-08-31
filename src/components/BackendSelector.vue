<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
.field.grid
  label.col-fixed(for="model")
    | Diffusion model
  Dropdown#model(optionLabel="name", optionValue="code", v-model="backend.current_id", :options="backend.options")
</template>

<style scoped>
label.col-fixed {
  width: 200px;
}
</style>
