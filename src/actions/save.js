import FileSaver from "file-saver";
import { useOutputStore } from "@/stores/output";

function saveResultImage(image_index) {
  const output = useOutputStore();

  const image_data = output.images.content[image_index];
  const filename = output.images.metadata.input.prompt + ".png";

  FileSaver.saveAs(image_data, filename);
}

export { saveResultImage };
