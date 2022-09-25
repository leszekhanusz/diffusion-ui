<script setup>
import LayoutComponent from "@/components/LayoutComponent.vue";
import Card from "primevue/card";

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "props" }]*/
const props = defineProps({
  label: String,
  id: String,
  components: Array,
});
</script>

<template lang="pug">
Card(style="margin-bottom: 2em")
  template(#title)
    | {{ label }}
  template(#content)
    template(v-for="component in components" :key="component.id")
      LayoutComponent(:component="component")
</template>

<style>
.p-card .p-card-title {
  font-size: 1.1rem !important;
}
.p-card .p-card-content {
  padding: 1.25rem 0 0 !important;
}
</style>
