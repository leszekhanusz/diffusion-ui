<script setup>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { onMounted } from "vue";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { useBackendStore } from "@/stores/backend";
import { generate } from "@/actions/generate";
import { resetSeeds } from "@/actions/editor";

const input = useInputStore();
const output = useOutputStore();
const backend = useBackendStore();

onMounted(() => {
  console.log(`The initial prompt is '${input.prompt_input.value}'.`);
});
</script>

<template lang="pug">
div
  template(v-if="input.seeds")
    .flex.flex-column.align-items-center
      .p-chips.p-component(@click="resetSeeds")
        ul.p-chips-multiple-container
          li.p-chips-token
            span.p-chips-token-label
              span Seed: 
              span {{ input.seeds }}
            span.p-chips-token-icon.pi.pi-times-circle
  .p-inputgroup.shadow-3
    InputText(type="text", v-model="input.prompt_input.value", @keyup.enter="generate")
    Button(@click="generate", :disabled="(output.loading || backend.show_license) ? 'disabled' : null")
      span.hide-sm Generate image
      span.show-sm
        font-awesome-icon(icon="fa-solid fa-angles-right")
</template>

<style scoped>
ul.p-chips-multiple-container {
  padding-bottom: 2px;
  font-size: 11px;
  list-style: none;
  cursor: pointer;
}

span.p-chips-token-icon {
  vertical-align: middle;
}

.p-inputgroup input:first-child {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}

.p-inputgroup button:last-child {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}
</style>
