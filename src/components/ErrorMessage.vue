<script setup>
import Message from "primevue/message";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
</script>

<template lang="pug">
Message(severity="error")
  | {{ output.error_message.message }}
</template>
