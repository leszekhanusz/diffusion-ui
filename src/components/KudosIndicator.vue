<script setup>
import { useStableHordeStore } from "@/stores/stablehorde";
import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";

const output = useOutputStore();
const sh_store = useStableHordeStore();
const ui = useUIStore();
</script>

<template lang="pug">
Transition(name="slide-fade")
  .kudos-indicator-container(v-if="!output.loading_user_info")
    .kudos-indicator.cursor-pointer(@click="ui.showKudosDialog")
      template(v-if="sh_store.valid_api_key")
        span.username {{ sh_store.username }}
        img(src="/kudos_100.webp", width="20", height="20")
        span {{ sh_store.kudos }}
      template(v-else)
        span.username Invalid API Key
</template>

<style scoped>
.kudos-indicator-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

span.username {
  font-size: 12px;
  vertical-align: middle;
  top: -1px;
}

.kudos-indicator {
  height: 30px;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  background-color: #e5b7ab;
  border: solid 3px;
  border-color: #cd6155;
  border-top: none;
  border-radius: 0 0 10px 10px;
  padding: 0 10px;
  color: #4a180b;
  font-weight: bold;
  font-size: 20px;
  line-height: 27px;
  text-align: center;
  box-shadow: 2px 5px 14px -10px #4a180b;
}

.kudos-indicator img {
  top: 2px;
}
</style>
