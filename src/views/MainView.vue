<script setup>
import InputView from "@/views/InputView.vue";
import PanelHeader from "@/components/PanelHeader.vue";
import ResultView from "@/views/ResultView.vue";
import ConfirmDialog from "primevue/confirmdialog";
import LicenseDialog from "@/components/LicenseDialog.vue";
import EditURLDialog from "@/components/EditURLDialog.vue";

import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";

const input = useInputStore();
const ui = useUIStore();
</script>

<template lang="pug">
main.main.flex.flex-column.justify-content-center(:class="{verticalcenter: !ui.show_results && !input.has_image}")
  PanelHeader
  div(v-show="!ui.show_results")
    InputView
  div(v-show="ui.show_results")
    ResultView
LicenseDialog
EditURLDialog
ConfirmDialog
</template>

<style scoped>
.main {
  width: 100vw;
  max-width: 100%;
  padding: 2rem;
  padding-top: 5rem;
}

.main.verticalcenter {
  height: max(300px, 100vh);
  padding-top: 0;
}

@media (max-width: 600px) {
  .main {
    padding: 0;
    padding-top: 3.5rem;
  }
}
</style>
