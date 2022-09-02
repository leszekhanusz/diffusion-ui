import { fabric } from "fabric";
import { nextTick } from "vue";
import { useOutputStore } from "@/stores/output";
import { useInputStore } from "@/stores/input";

function resetMask() {
  const input = useInputStore();

  input.canvas_history.forEach(function (history_event) {
    if (history_event.type === "erase") {
      const path = history_event.path;
      input.canvas.remove(path);
      input.canvas_mask.remove(path);
    }
  });

  // Clear the history
  input.canvas_history.length = 0;
  input.mask_image_b64 = null;
}

function editNewImage(image_b64) {
  const input = useInputStore();

  resetMask();

  input.uploaded_image_b64 = image_b64;

  fabric.Image.fromURL(image_b64, async function (image) {
    // Waiting that the canvas has been created asynchronously by Vue
    while (input.canvas === null) {
      console.log(".");
      await nextTick();
    }

    image.scaleToHeight(input.canvas.height);
    image.set("strokeWidth", 0);
    image.clipTo = function (ctx) {
      ctx.rect(0, 0, 512, 512);
    };
    input.canvas.add(image);
    input.canvas.renderAll();
  });
}

function editResultImage(image_index) {
  const output = useOutputStore();
  editNewImage(output.images[image_index]);
}

export { editNewImage, editResultImage };
