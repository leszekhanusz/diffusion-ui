<script setup>
import ProgressSpinner from "primevue/progressspinner";
import ProgressBar from "primevue/progressbar";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
</script>

<template lang="pug">
template(v-if="output.loading_progress")
  .flex.flex-column.w-full.align-items-center
    ProgressBar(:value="output.loading_progress" :showValue="false" style="width: 100%")
    template(v-if="output.loading_message")
      div(v-html="output.loading_message")
template(v-else)
  ProgressSpinner(style="width: 50px; height: 50px", strokeWidth="3", fill="var(--surface-ground)" animeDuration=".5s")
</template>

<style scoped></style>
