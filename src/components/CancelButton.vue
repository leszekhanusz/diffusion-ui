<script setup>
import Button from "primevue/button";
import { cancelGeneration } from "@/actions/generate";
</script>

<template lang="pug">
Button(@click="cancelGeneration")
  | Cancel
</template>

<style scoped></style>
