<script setup>
import ModelParameter from "@/components/ModelParameter.vue";
import LayoutComponent from "@/components/LayoutComponent.vue";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
template(v-if="backend.current")
  template(v-if="backend.current.layout")
    template(v-for="component in backend.current.layout" :key="component.id")
      LayoutComponent(:component="component")
  template(v-else)
    template(v-for="input in backend.current.inputs" :key="input.id")
      ModelParameter(:input="input")
</template>

<style scoped>
:deep() .p-inputtext {
  padding: 0.35rem 0.75rem;
}
:deep() .p-dropdown-label {
  padding: 0.15rem 0.75rem;
}
:deep() .p-inputnumber-input {
  padding: 0.15rem 0.75rem;
}
</style>
