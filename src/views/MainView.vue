<script setup>
import InputView from "@/views/InputView.vue";
import PanelHeader from "@/components/PanelHeader.vue";
import ResultView from "@/views/ResultView.vue";
import LicenseDialog from "@/components/LicenseDialog.vue";

import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template lang="pug">
main
  PanelHeader
  div(v-show="!ui.show_results")
    InputView
  div(v-show="ui.show_results")
    ResultView
LicenseDialog
</template>
