<script setup>
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
Button.p-button-secondary(label="Parameters", @click="ui.showLeftPanel")
</template>
