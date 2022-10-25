import { onKeyUp } from "@/actions/events";
import { setupWatchers } from "@/actions/watch";
import { getUserInfoStableHorde } from "@/actions/generate_stable_horde";
import { useBackendStore } from "@/stores/backend";

function onHomeMounted() {
  const backend = useBackendStore();

  document.addEventListener("keyup", onKeyUp);
  setupWatchers();
  if (backend.current.id === "stable_horde") {
    getUserInfoStableHorde();
  }
}

export { onHomeMounted };
