<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useBackendStore } from "@/stores/backend";

const backend = useBackendStore();
</script>

<template lang="pug">
Dialog(:visible="backend.show_license", :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}", :closable="false")
  div(v-html="backend.license")

  template(#header)
    h3
     | LICENSE

  template(#footer)
    Button(label='Accept', @click="backend.acceptLicense")
</template>

<style scoped>
>>> h4 {
  padding-top: 10px;
  font-weight: bold;
}
</style>
