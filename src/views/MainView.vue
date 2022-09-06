<script setup>
import InputView from "@/views/InputView.vue";
import PanelHeader from "@/components/PanelHeader.vue";
import ResultView from "@/views/ResultView.vue";
import LicenseDialog from "@/components/LicenseDialog.vue";

import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
main.main.flex.flex-column.justify-content-center
  PanelHeader
  div(v-show="!ui.show_results")
    InputView
  div(v-show="ui.show_results")
    ResultView
LicenseDialog
</template>

<style scoped>
.main {
  height: 100vh;
  width: 100vw;
  max-width: 100%;
  padding: 2rem;
}

@media (max-width: 600px) {
  .main {
    padding: 0;
  }
}
</style>
