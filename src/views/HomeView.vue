<script setup>
import PromptInput from "@/components/PromptInput.vue";
import ResultImage from "@/components/ResultImage.vue";
import BackendSelector from "@/components/BackendSelector.vue";
</script>

<template lang="pug">
main
  BackendSelector
  PromptInput
  ResultImage
</template>
