import { onKeyUp } from "@/actions/events";
import { setupWatchers } from "@/actions/watch";

function onHomeMounted() {
  document.addEventListener("keyup", onKeyUp);
  setupWatchers();
}

export { onHomeMounted };
