import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import PrimeVue from "primevue/config";
import router from "./router";

import "./assets/main.css";

import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import ConfirmationService from "primevue/confirmationservice";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import Vue3TouchEvents from "vue3-touch-events";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import {
  faAngleLeft,
  faAngleRight,
  faAnglesRight,
  faArrowsRotate,
  faBook,
  faCircle,
  faCircleInfo,
  faEraser,
  faGears,
  faImage,
  faImages,
  faLeftLong,
  faLink,
  faPaintbrush,
  faPencil,
  faRotateLeft,
  faRotateRight,
  faSliders,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(
  faAngleLeft,
  faAngleRight,
  faAnglesRight,
  faArrowsRotate,
  faBook,
  faCircle,
  faCircleInfo,
  faEraser,
  faGears,
  faImage,
  faImages,
  faLeftLong,
  faLink,
  faPaintbrush,
  faPencil,
  faRotateLeft,
  faRotateRight,
  faSliders,
  faXmark
);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(ToastService);
app.use(Vue3TouchEvents);

function confirmDialogPiniaPlugin() {
  return {
    $confirm: useConfirm(),
    $toast: useToast(),
  };
}
pinia.use(confirmDialogPiniaPlugin);

app.component("font-awesome-icon", FontAwesomeIcon);

app.directive("tooltip", Tooltip);

app.mount("#app");
