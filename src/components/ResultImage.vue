<script setup>
import Image from "primevue/image";
import SpeedDial from "primevue/speeddial";

import { editResultImage } from "@/actions/editor";

const props = defineProps({
  src: String,
  index: Number,
});

const buttons = [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: () => {
      editResultImage(props.index);
    },
  },
];
</script>

<template lang="pug">
.result-image
  Image(:src="props.src")
  SpeedDial(:model="buttons", direction="down", showIcon="pi pi-bars", hideIcon="pi pi-times")
</template>

<style>
.result-image {
  position: relative;
}
.result-image > .p-speeddial {
  visibility: hidden;
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0.8;
}
.result-image > .p-speeddial-list {
  visibility: hidden;
}
.result-image:hover .p-speeddial {
  visibility: initial;
}
.result-image:hover .p-speeddial-list {
  visibility: initial;
}
</style>
