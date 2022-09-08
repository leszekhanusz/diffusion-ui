<script setup>
import Button from "primevue/button";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";

const ui = useUIStore();
const output = useOutputStore();
</script>

<template lang="pug">
Button.left-panel-toggler(@click="ui.showLeftPanel", v-show="!ui.show_results")
  font-awesome-icon(icon="fa-solid fa-gears")
Button.right-panel-toggler(@click="ui.showRightPanel", v-show="!output.loading")
  font-awesome-icon(icon="fa-solid fa-images")
</template>

<style scoped>
.right-panel-toggler {
  position: fixed;
  z-index: 1;
  top: 16px;
  right: 0px;
  padding: 10px 10px 10px 20px;
  background-color: lightgray;
  border-radius: 5px 0px 0px 5px;
}

.left-panel-toggler {
  position: fixed;
  z-index: 1;
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
