import { useUIStore } from "@/stores/ui";
import { useOutputStore } from "@/stores/output";
import { onKeyUp as onEditorKeyUp } from "@/actions/editor";

function onKeyUp(e) {
  const ui = useUIStore();

  if (ui.show_results) {
    const output = useOutputStore();
    output.onKeyUp(e);
  } else {
    onEditorKeyUp(e);
  }
}

export { onKeyUp };
