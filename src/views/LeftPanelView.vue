<script setup>
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import BackendSelector from "@/components/BackendSelector.vue";
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
Sidebar.p-sidebar-md(:visible="ui.left_panel_visible", :showCloseIcon="false")

  template(#header)
    Button.p-button-secondary.toggler(label="Close", @click="ui.hideLeftPanel")
      font-awesome-icon(icon="fa-solid fa-angle-left")
  BackendSelector
</template>

<style>
.p-sidebar .p-sidebar-header {
  padding: 0px !important;
}
.p-sidebar .toggler {
  position: relative;
  z-index: 100;
  top: 16px;
  right: 0px;
  padding: 10px 10px 10px 20px !important;
  background-color: lightgray !important;
  border-radius: 5px 0px 0px 5px !important;
}
</style>
