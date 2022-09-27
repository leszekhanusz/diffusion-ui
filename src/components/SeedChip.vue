<script setup>
import { useBackendStore } from "@/stores/backend";
import { useInputStore } from "@/stores/input";

const backend = useBackendStore();
const input = useInputStore();

function resetSeeds() {
  const without_toast = false;

  if (backend.hasInput("seeds")) {
    backend.setInput("seeds", "", without_toast);
  }

  if (backend.hasInput("seed")) {
    backend.setInput("seed", -1, without_toast);
  }
}
</script>

<template lang="pug">
.flex.flex-column.align-items-center(v-if="input.seed_is_set")
  .p-chips.p-component(@click="resetSeeds")
    ul.p-chips-multiple-container
      li.p-chips-token
        span.p-chips-token-label
          span Seed: 
          span {{ input.seed }}
        span.p-chips-token-icon.pi.pi-times-circle
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
</style>
