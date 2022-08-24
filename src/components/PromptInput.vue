<script setup>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { onMounted } from "vue";
import { usePromptStore } from "@/stores/prompt";

const store = usePromptStore();

onMounted(() => {
  console.log(`The initial prompt is '${store.prompt}'.`);
});
</script>

<template lang="pug">
.p-inputgroup
  InputText(type="text", v-model="store.prompt", placeholder='Keyword')
  Button(label='Run', @click="store.run")
</template>
