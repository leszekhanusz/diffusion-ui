<script setup>
import FileUpload from "primevue/fileupload";
import { editNewImage } from "@/actions/editor";

function fileUploaded(event) {
  console.log("file uploaded!");

  const files = event.files;

  const file = files[0];

  const fileUrl = file.objectURL;

  console.log(fileUrl);

  editNewImage(fileUrl);
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
