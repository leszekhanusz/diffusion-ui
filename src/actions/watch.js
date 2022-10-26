import { toRef, watch } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useOutputStore } from "@/stores/output";
import { useStableHordeStore } from "@/stores/stablehorde";
import { getUserInfoStableHorde } from "@/actions/generate_stable_horde";

function setupWatchers() {
  const backend = useBackendStore();
  const output = useOutputStore();
  const sh_store = useStableHordeStore();

  watch(toRef(output.image_index, "current"), function () {
    output.imageIndexUpdated();
  });

  watch(toRef(backend, "backend_id"), function () {
    backend.selectedBackendUpdated();
  });

  watch(toRef(sh_store, "api_key"), function () {
    if (backend.backend_id === "stable_horde") {
      getUserInfoStableHorde();
    }
  });

  watch(toRef(sh_store, "models"), function () {
    if (backend.backend_id === "stable_horde") {
      sh_store.models_input.validation.options = sh_store.models.map(function (
        model
      ) {
        return {
          name: model.name,
          label: `${model.name} (${model.count})`,
        };
      });
    }
  });
}

export { setupWatchers };
