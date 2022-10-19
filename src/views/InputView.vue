<script setup>
import { toRef, watch } from "vue";
import KudosIndicator from "@/components/KudosIndicator.vue";
import PromptInput from "@/components/PromptInput.vue";
import FileUploadButton from "@/components/FileUploadButton.vue";
import ImageEditor from "@/components/editor/ImageEditor.vue";
import LoadConfigButton from "@/components/LoadConfigButton.vue";
import Button from "primevue/button";
import Slider from "primevue/slider";
import {
  newDrawing,
  renderCanvas,
  updateDrawLayerOpacity,
} from "@/actions/editor";

import { useBackendStore } from "@/stores/backend";
import { useEditorStore } from "@/stores/editor";
import { useInputStore } from "@/stores/input";
import { useUIStore } from "@/stores/ui";
const backend = useBackendStore();
const editor = useEditorStore();
const input = useInputStore();
const ui = useUIStore();

watch(toRef(backend, "strength"), function () {
  // Modify the opacity of the draw layer depending on strength
  updateDrawLayerOpacity();

  // Rerender Canvas
  renderCanvas();
});

watch(toRef(editor, "mode"), function (mode) {
  console.log(`editor mode changed to ${mode}`);

  const possible_modes = backend.getAllowedModes(mode);
  backend.changeFunctionForModes(possible_modes);
});
</script>

<template lang="pug">
.flex.flex-column.gap-3
  KudosIndicator(v-if="backend.current.type === 'stable_horde'")
  template(v-if="backend.needs_gradio_config")
    LoadConfigButton
  template(v-else)
    template(v-if="!editor.has_image && !input.seed_is_set && backend.hasInput('prompt')")
      .flex.flex-column.align-items-center
        .enter-a-prompt
          | Enter a prompt:
    PromptInput
    div(v-show="backend.has_img2img_mode")
      div(v-show="editor.has_image")
        ImageEditor
        .main-slider(v-if="backend.hasInput('strength')", :class="{visible: ui.show_strength_slider}")
          .flex.flex-row.justify-content-center
            .slider-label.align-items-left(title="At low strengths, the initial image is not modified much")
              | Low variations
            Slider.align-items-center(v-model="backend.strength_input.value" :min="0" :max="1" :step="0.02" v-tooltip.bottom="{ value: 'Strength:' + backend.strength}")
            .slider-label.align-items-left(title="At a strength of 1, what was previously in the zone is ignored")
              | Ignore previous
      template(v-if="!editor.has_image")
        .flex.flex-column.align-items-center
          .or(v-if="backend.hasInput('prompt')") OR
          FileUploadButton.main-slider
        .flex.flex-column.align-items-center
          .or OR
          Button.p-button-secondary.p-button-outlined.p-button-sm.p-button-text(@click="newDrawing")
            font-awesome-icon(icon="fa-solid fa-paintbrush")
            | draw something
</template>

<style scoped>
.enter-a-prompt {
  font-weight: 700;
  color: #64748b;
}

:deep() .p-button-secondary:not(.p-disabled):hover {
  background-color: transparent !important;
  color: #64748b !important;
  border-color: transparent !important;
  text-decoration: underline !important;
}

:deep() .p-button-secondary:not(.p-disabled):focus {
  box-shadow: none;
}

:deep() .p-button-secondary {
  font-weight: 700;
}

.fa-paintbrush {
  margin-right: 3px;
}

.or {
  font-size: 12px;
  font-weight: lighter;
}

.main-slider {
  padding-top: 10px;
  margin-top: auto 20px;
  visibility: hidden;
}

.main-slider.visible {
  visibility: initial;
}

.slider-label {
  font-weight: bold;
  text-align: center;
}

:deep() .p-slider-horizontal {
  margin: 10px 20px 10px 20px;
  color: black;
  height: 0.15rem !important;
  width: 80%;
  max-width: 300px;
}

:deep() .p-slider-range {
  background: black !important;
}

:deep() .p-slider-handle {
  border: 4px solid #273767 !important;
}
</style>
