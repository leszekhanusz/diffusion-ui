import FileSaver from "file-saver";
import { useOutputStore } from "@/stores/output";

function saveResultImage(image_index) {
  const output = useOutputStore();

  const image_data = output.images.content[image_index];
  const fileextension = image_data.startsWith("data:image/webp;")
    ? ".webp"
    : ".png";
  const filename = output.images.metadata.input.prompt + fileextension;

  FileSaver.saveAs(image_data, filename);
}

export { saveResultImage };
