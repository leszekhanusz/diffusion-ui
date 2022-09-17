<script setup>
import Button from "primevue/button";
import Divider from "primevue/divider";
import Password from "primevue/password";
import { useBackendStore } from "@/stores/backend";
import { useUIStore } from "@/stores/ui";

const backend = useBackendStore();
const ui = useUIStore();
</script>

<template lang="pug">
div
  .sidebar-section
    h3.sidebar-section-title Model
    p.model-description(v-if="backend.description")
      | {{backend.description}}
    p(v-if="backend.doc_url")
      a(:href="backend.doc_url" target="_blank")
        font-awesome-icon(icon="fa-solid fa-book")
        |  Documentation
    p(v-if="backend.license")
      strong License: 
      a.cursor-pointer(@click="backend.showLicense") {{ backend.license }}
    Divider(type="dashed")
    .flex.flex-column.align-items-center
      .api-url(v-if="backend.api_url" title="the URL used to generate the images")
        .field.grid
          label.col-fixed(for="api-url" style="margin:auto")
            font-awesome-icon(icon="fa-solid fa-link")
            span  API url
          .col
            #api-url.api-url-value.cursor-pointer(@click="ui.showEditURL") {{ backend.api_url }}
      template(v-if="backend.has_access_code")
        .field.grid(:title="backend.access_code_input.description")
          label.col-fixed(style="min-width: 150px; margin:auto")
            span Access code
          .col
            Password.min-w-full(v-model="backend.access_code_input.value" :feedback="false" inputStyle="margin: auto;")
      Button.p-button-outlined.p-button-danger(@click="backend.resetCurrentBackendToDefaults")
        span Reset to default values

</template>

<style scoped>
.model-description {
  font-size: 14px;
}

.api-url {
  font-size: large;
  padding-top: 20px;
  padding-bottom: 20px;
}

.api-url-value {
  border-radius: 5px;
  background-color: grey;
  color: white;
  padding: 5px;
  font-size: small;
  max-width: 300px;
  overflow: none;
}

.p-card.p-component {
  margin-bottom: 10px;
  background-color: #eff3f8 !important;
}
</style>
