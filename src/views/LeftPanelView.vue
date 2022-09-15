<script setup>
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

import BackendSelector from "@/components/BackendSelector.vue";
import ModelParameters from "@/components/ModelParameters.vue";
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
Sidebar.p-sidebar-md(:visible="ui.left_panel_visible", :showCloseIcon="false")
  template(#header)
    Button.p-button-secondary.toggler(label="Close", @click="ui.hideLeftPanel")
      font-awesome-icon(icon="fa-solid fa-angle-left")
  BackendSelector
  TabView
    TabPanel
      template(#header)
        .text-center.w-full
          font-awesome-icon(icon="fa-solid fa-sliders")
      ModelParameters
    TabPanel
      template(#header)
        .text-center.w-full
          font-awesome-icon(icon="fa-solid fa-circle-info")
      div
        | Info tab
</template>

<style scoped>
.p-tabview.p-component {
  margin-top: 10px;
}
</style>

<style>
.p-sidebar {
  z-index: 1;
}

.p-sidebar .p-sidebar-header {
  padding: 0px !important;
}
.p-sidebar .toggler {
  z-index: 1;
  position: relative;
  top: 16px;
  right: 0px;
  padding: 10px 10px 10px 20px !important;
  background-color: lightgray !important;
  border-radius: 5px 0px 0px 5px !important;
}
.p-dropdown-panel {
  z-index: 1;
}

ul.p-tabview-nav > li {
  flex-grow: 1;
}
</style>
