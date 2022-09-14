<script setup>
import Image from "primevue/image";
import SpeedDial from "primevue/speeddial";
import { useUIStore } from "@/stores/ui";
import { editResultImage, generateAgainResultImage } from "@/actions/editor";

const ui = useUIStore();

const props = defineProps({
  src: String,
  index: Number,
});

function editImage() {
  editResultImage(props.index);
  ui.show_results = false;
}
function generateAgain() {
  generateAgainResultImage(props.index);
  ui.show_results = false;
}
const buttons = [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: editImage,
  },
  {
    label: "Generate again",
    icon: "pi pi-undo",
    command: generateAgain,
    tootipOptions: "{value: 'Enter your username}'}",
  },
];
</script>

<template lang="pug">
.result-image
  Image(:src="props.src")
  SpeedDial(:model="buttons", direction="down", showIcon="pi pi-bars", hideIcon="pi pi-times", :tooltipOptions="{position: 'left'}")
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
