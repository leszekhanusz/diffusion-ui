<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ModelParameter from "@/components/ModelParameter.vue";
import { useUIStore } from "@/stores/ui";
import { useStableHordeStore } from "@/stores/stablehorde";

const sh_store = useStableHordeStore();
const ui = useUIStore();

function resetApiKey() {
  sh_store.api_key_input.value = sh_store.anon_key;
}
</script>

<template lang="pug">
Dialog(:modal="true" :visible="ui.show_kudos_dialog", :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}", :closable="false")

  template(v-if="sh_store.anonymous")
    p
      | You are not logged in to the Stable Horde and you have the lowest priority for the generation of images.
    p
      | Go to&nbsp;
      a(href="https://stablehorde.net/register" target="_blank") https://stablehorde.net/register
      | &nbsp;to get an API key and add it below to get a better priority.
  template(v-else)
    template(v-if="sh_store.valid_api_key")
      p You are logged in as "{{ sh_store.username }}"
    template(v-else)
      p Invalid API key
  br
  ModelParameter(:input="sh_store.api_key_input")

  template(#header)
    h3
     | REGISTER

  template(#footer)
    Button.p-button-text.p-button-warning(label="Reset API key to anonymous", @click="resetApiKey" v-if="!sh_store.anonymous")
    Button(label='OK', @click="ui.hideKudosDialog" :class="{disabled: !sh_store.valid_api_key}")
</template>

<style scoped>
:deep() h4 {
  padding-top: 10px;
  font-weight: bold;
}
</style>
