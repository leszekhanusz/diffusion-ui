<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
.flex.flex-column.align-items-center
  Dropdown#model(optionLabel="name", optionValue="code", v-model="backend.current_id", :options="backend.options")
</template>

<style scoped>
label.col-fixed {
  width: 200px;
}
</style>
