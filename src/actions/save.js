import FileSaver from "file-saver";
import { useOutputStore } from "@/stores/output";

async function saveResultImage(image_index) {
  const output = useOutputStore();

  let image_data = output.images.content[image_index];
  const fileextension = image_data.startsWith("data:image/webp;")
    ? ".webp"
    : ".png";
  const filename = output.images.metadata.input.prompt + fileextension;

  // If the image_data is a URL instead of a blob, we first need to download it
  if (image_data.startsWith("http")) {
    const result = await fetch(image_data);
    image_data = await result.blob();
  }

  FileSaver.saveAs(image_data, filename);
}

export { saveResultImage };
