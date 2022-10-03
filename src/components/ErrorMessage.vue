<script setup>
import Message from "primevue/message";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";

const backend = useBackendStore();
const output = useOutputStore();
</script>

<template lang="pug">
Message(severity="error" :closable="false")
  div(v-if="output.error_message.startsWith('<')")
    div(v-html="output.error_message.message")
  div(v-else)
    span {{ output.error_message }}
    p(v-if="backend.doc_url")
      | Please check the 
      a(:href="backend.doc_url" target="_blank")
        font-awesome-icon(icon="fa-solid fa-book")
        |  Documentation
</template>
