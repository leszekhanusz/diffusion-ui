<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
.flex.flex-column.align-items-center
  Dropdown#model(optionLabel="name", optionValue="id", v-model="backend.backend_id", :options="backend.backend_options")
</template>

<style scoped>
label.col-fixed {
  width: 200px;
}
</style>
