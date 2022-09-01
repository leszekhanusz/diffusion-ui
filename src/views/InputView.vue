<script setup>
import PromptInput from "@/components/PromptInput.vue";
import FileUploadButton from "@/components/FileUploadButton.vue";
import InputCanvas from "@/components/InputCanvas.vue";

import { useBackendStore } from "@/stores/backend";
import { useInputStore } from "@/stores/input";
const backend = useBackendStore();
const input = useInputStore();
</script>

<template lang="pug">
div
  PromptInput
  template(v-if="backend.has_image_input")
    FileUploadButton
    template(v-if="input.uploaded_image_b64")
      InputCanvas
</template>
