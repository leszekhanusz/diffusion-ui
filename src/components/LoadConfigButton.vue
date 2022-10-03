<script setup>
import Button from "primevue/button";

import { useBackendStore } from "@/stores/backend";
const backend = useBackendStore();
</script>

<template lang="pug">
.flex.flex-column.align-items-center
  Button.p-button-secondary.p-button-outlined.p-button-sm.p-button-text(@click="backend.loadGradioConfig")
    font-awesome-icon(icon="fa-solid fa-arrows-rotate")
    |  
    | Load config
</template>

<style scoped></style>
