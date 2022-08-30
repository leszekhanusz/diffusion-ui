<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
h3
 | Model
Dropdown(optionLabel="name", optionValue="code", v-model="backend.current_id", :options="backend.options")
</template>

<style scoped></style>
