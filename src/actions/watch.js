import { toRef, watch } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";

function setupWatchers() {
  const backend = useBackendStore();
  const output = useOutputStore();

  watch(toRef(output.image_index, "current"), function () {
    output.imageIndexUpdated();
  });

  watch(toRef(backend, "backend_id"), function () {
    backend.selectedBackendUpdated();
  });
}

export { setupWatchers };
