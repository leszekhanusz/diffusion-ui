<script setup>
import Message from "primevue/message";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
</script>

<template lang="pug">
Message(severity="error")
  div(v-if="output.error_message.message.startsWith('<')")
    div(v-html="output.error_message.message")
  div(v-else)
    span {{ output.error_message.message }}
</template>
