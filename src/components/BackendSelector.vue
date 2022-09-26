<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
.flex.flex-column.align-items-center
  Dropdown#model(optionLabel="label", optionValue="id", optionGroupLabel="label" optionGroupChildren="backends" v-model="backend.backend_id", :options="backend.backend_options")
</template>

<style scoped>
label.col-fixed {
  width: 200px;
}
</style>

<style>
li.p-dropdown-item-group {
  font-size: 20px;
  text-decoration: underline;
}
</style>
