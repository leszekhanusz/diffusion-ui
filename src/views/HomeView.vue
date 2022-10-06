<script setup>
import MainView from "@/views/MainView.vue";
import Message from "primevue/message";
import LeftPanelView from "@/views/LeftPanelView.vue";
import RightPanelView from "@/views/RightPanelView.vue";
import { useBackendStore } from "@/stores/backend";
import { useRoute } from "vue-router";
import { onMounted } from "vue";
import { onHomeMounted } from "@/actions/init";

const backend = useBackendStore();
const route = useRoute();

const backend_id = route.params.backend_id;

let valid_backend_id = true;

if (backend_id) {
  if (backend.backend_ids.includes(backend_id)) {
    console.log(`Switching to the "${backend_id}" backend.`);
    backend.backend_id = backend_id;

    if (route.query.host) {
      let host = route.query.host;
      if (!host.startsWith("http")) {
        host = "https://" + host;
      }
      console.log("host", host);
      backend.current.base_url = host;
    }
  } else {
    valid_backend_id = false;
  }
}

onMounted(() => {
  onHomeMounted();
});
</script>

<template lang="pug">
template(v-if="valid_backend_id")
  MainView
  LeftPanelView
  RightPanelView
template(v-else)
  Message(severity="error" :closable="false")
    | Invalid backend: {{ backend_id }}
</template>
