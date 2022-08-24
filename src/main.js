import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import PrimeVue from "primevue/config";
import router from "./router";

import "./assets/main.css";

import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);

app.mount("#app");
