<script setup>
import { nextTick } from "vue";
import { useInputStore } from "@/stores/input";
import FileUpload from "primevue/fileupload";
import { fabric } from "fabric";

const input = useInputStore();

async function fileUploaded(event) {
  console.log("file uploaded!");
  console.log(event);

  const files = event.files;

  const file = files[0];

  const fileUrl = file.objectURL;

  console.log(fileUrl);
  input.uploaded_image_b64 = fileUrl;

  fabric.Image.fromURL(fileUrl, async function (obj) {
    while (input.canvas === null) {
      console.log(".");
      await nextTick();
    }
    obj.scaleToHeight(input.canvas.height);
    obj.set("strokeWidth", 0);
    obj.clipTo = function (ctx) {
      ctx.rect(0, 0, 512, 512);
    };
    input.canvas.add(obj);
    input.canvas.renderAll();
  });
}
</script>

<template lang="pug">
FileUpload(name="image_upload", url="false", mode="basic", :customUpload="true", @uploader="fileUploaded", accept="image/*", :auto="true", chooseLabel="Upload image", showUploadButton=false, class="p-button-secondary p-button-outlined p-button-sm p-button-text")
</template>

<style scoped>
.p-fileupload {
  text-align: center;
}
:deep() .p-fileupload-choose:not(.p-disabled):hover {
  background-color: transparent !important;
  color: #64748b !important;
  border-color: transparent !important;
  text-decoration: underline !important;
}

:deep() .p-fileupload-choose:not(.p-disabled):focus {
  box-shadow: none;
}
</style>
