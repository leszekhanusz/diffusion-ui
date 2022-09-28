<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import SeedChip from "@/components/SeedChip.vue";

import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { generate } from "@/actions/generate";

const backend = useBackendStore();
const output = useOutputStore();
</script>

<template lang="pug">
div
  SeedChip
  template(v-if="backend.hasInput('prompt')")
    .p-inputgroup.shadow-3
      InputText(type="text", v-model="backend.findInput('prompt').value", @keyup.enter="generate")
      Button(@click="generate", :disabled="(output.loading || backend.show_license) ? 'disabled' : null")
        span.hide-sm Generate image
        span.show-sm
          font-awesome-icon(icon="fa-solid fa-angles-right")
  template(v-else)
    .flex.justify-content-center
      Button(@click="generate", :disabled="(output.loading || backend.show_license) ? 'disabled' : null")
        span.hide-sm Generate image
        span.show-sm
          font-awesome-icon(icon="fa-solid fa-angles-right")
</template>

<style scoped>
.p-inputgroup input:first-child {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}

.p-inputgroup button:last-child {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}
</style>
