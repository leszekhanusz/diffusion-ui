<script setup>
import Dropdown from "primevue/dropdown";

import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
Dropdown(optionLabel="name", optionValue="code", v-model="backend.current_id", :options="backend.options")
</template>

<style scoped></style>
