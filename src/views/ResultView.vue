<script setup>
import ResultImages from "@/components/ResultImages.vue";
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";

const ui = useUIStore();
const output = useOutputStore();

function goBackToInput() {
  ui.show_results = false;
}
</script>

<template lang="pug">
.flex.flex-row.justify-content-center
  Button(v-show="!output.loading", @click="goBackToInput")
    font-awesome-icon(icon="fa-solid fa-left-long")
    |  Try again
ResultImages
</template>

<style scoped>
.p-button {
  margin-bottom: 10px;
}
</style>
