<script setup>
import ModelParameter from "@/components/ModelParameter.vue";
import LayoutContainer from "@/components/LayoutContainer.vue";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "props" }]*/
const props = defineProps({
  component: Object,
});
</script>

<template lang="pug">
template(v-if="component.type==='input'")
  ModelParameter(:input="backend.findInput(component.id)")
template(v-if="component.type==='container'")
  LayoutContainer(:label="component.label" :id="component.id" :components="component.components")
</template>
