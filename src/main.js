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
import Tooltip from "primevue/tooltip";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import {
  faAngleLeft,
  faAngleRight,
  faAnglesRight,
  faCircle,
  faEraser,
  faGears,
  faImage,
  faImages,
  faLeftLong,
  faPaintbrush,
  faPencil,
  faRotateLeft,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(
  faAngleLeft,
  faAngleRight,
  faAnglesRight,
  faCircle,
  faEraser,
  faGears,
  faImage,
  faImages,
  faLeftLong,
  faPaintbrush,
  faPencil,
  faRotateLeft,
  faRotateRight,
  faXmark
);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);

app.component("font-awesome-icon", FontAwesomeIcon);

app.directive("tooltip", Tooltip);

app.mount("#app");
