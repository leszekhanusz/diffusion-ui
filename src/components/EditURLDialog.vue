<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { useBackendStore } from "@/stores/backend";
import { useUIStore } from "@/stores/ui";

const backend = useBackendStore();
const ui = useUIStore();

function modifyURL() {
  backend.current.api_url = ui.edit_url_new_url;
  ui.hideEditURL();
}
</script>

<template lang="pug">
Dialog(:modal="true" :visible="ui.edit_url_visible", :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}", :closable="false")
  InputText.w-full(type="text", v-model="ui.edit_url_new_url")

  template(#header)
    h3
     | Edit API URL

  template(#footer)
    Button.p-button-text(label="Cancel", @click="ui.hideEditURL")
    Button.p-button-primary(label="Modify API URL", @click="modifyURL")
</template>

<style scoped></style>
