import { toRef, watch } from "vue";
import { useOutputStore } from "@/stores/output";

function setupWatchers() {
  const output = useOutputStore();
  watch(toRef(output.image_index, "current"), function () {
    output.imageIndexUpdated();
  });
}

export { setupWatchers };
