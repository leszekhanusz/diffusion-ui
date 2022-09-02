<script setup>
import PromptInput from "@/components/PromptInput.vue";
import FileUploadButton from "@/components/FileUploadButton.vue";
import ImageEditor from "@/components/editor/ImageEditor.vue";

import { useBackendStore } from "@/stores/backend";
import { useInputStore } from "@/stores/input";
const backend = useBackendStore();
const input = useInputStore();
</script>

<template lang="pug">
div
  .flex.flex-column.gap-3
    PromptInput
    div(v-show="backend.has_image_input")
      template(v-if="input.uploaded_image_b64")
        ImageEditor
      template(v-if="!input.uploaded_image_b64")
        FileUploadButton
</template>
