<script setup>
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import BackendSelector from "@/components/BackendSelector.vue";
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
Sidebar.p-sidebar-lg(:visible="ui.left_panel_visible", :showCloseIcon="false")

  template(#header)
    Button.p-button-secondary(label="Close", @click="ui.hideLeftPanel")
      | Close
  BackendSelector
</template>
