<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import SeedChip from "@/components/SeedChip.vue";
import { onMounted } from "vue";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { generate } from "@/actions/generate";

const input = useInputStore();
const output = useOutputStore();
const backend = useBackendStore();

onMounted(() => {
  console.log(`The initial prompt is '${input.prompt_input.value}'.`);
});
</script>

<template lang="pug">
div
  SeedChip
  .p-inputgroup.shadow-3
    InputText(type="text", v-model="input.prompt_input.value", @keyup.enter="generate")
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
