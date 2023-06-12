<script setup>
import InputView from "@/views/InputView.vue";
import PanelHeader from "@/components/PanelHeader.vue";
import ResultView from "@/views/ResultView.vue";
import ConfirmDialog from "primevue/confirmdialog";
import LicenseDialog from "@/components/dialogs/LicenseDialog.vue";
import EditURLDialog from "@/components/dialogs/EditURLDialog.vue";
import Toast from "primevue/toast";

import { useEditorStore } from "@/stores/editor";
import { useUIStore } from "@/stores/ui";

const editor = useEditorStore();
const ui = useUIStore();
</script>

<template lang="pug">
main.main.flex.flex-column.justify-content-center(:class="{verticalcenter: !ui.show_results && !editor.has_image}")
  PanelHeader
  div(v-show="!ui.show_results")
    InputView
  div(v-show="ui.show_results")
    ResultView
LicenseDialog
EditURLDialog
ConfirmDialog
Toast(:autoZIndex="true")
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
