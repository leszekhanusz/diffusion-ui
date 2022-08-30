<script setup>
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
Button.left-panel-toggler(@click="ui.showLeftPanel")
  font-awesome-icon(icon="fa-solid fa-gears")
  font-awesome-icon(icon="fa-solid fa-angle-right")
.top-padding
</template>

<style scoped>
.left-panel-toggler {
  position: fixed;
  z-index: 100;
  top: 16px;
  left: 0px;
  padding: 10px 10px 10px 20px;
  background-color: lightgray;
  border-radius: 0px 5px 5px 0px;
}

.top-padding {
  min-height: 40px;
}
</style>
