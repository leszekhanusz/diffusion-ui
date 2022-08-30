<script setup>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { onMounted } from "vue";
import { useInputStore } from "@/stores/input";
import { useOutputStore } from "@/stores/output";
import { generate } from "@/actions/generate";

const input = useInputStore();
const output = useOutputStore();

onMounted(() => {
  console.log(`The initial prompt is '${input.prompt}'.`);
});
</script>

<template lang="pug">
.p-inputgroup
  InputText(type="text", v-model="input.prompt", @keyup.enter="generate")
  Button(label='Generate image', @click="generate", :disabled="output.loading ? 'disabled': null")
</template>
