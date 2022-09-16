<script setup>
import Divider from "primevue/divider";
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
        span.text-align-center
          font-awesome-icon(icon="fa-solid fa-link")
          span  API URL 
        span.api-url-value.cursor-pointer(@click="ui.showEditURL") {{ backend.api_url }}
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
}

.p-card.p-component {
  margin-bottom: 10px;
  background-color: #eff3f8 !important;
}
</style>
