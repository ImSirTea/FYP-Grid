import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import { Scroll } from "vuetify/lib/directives";

Vue.use(Vuetify, {
  directives: {
    Scroll,
  },
  theme: {
    primary: "#FB8C00",
    secondary: "#424242",
    accent: "#FF5252",
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
});

export default new Vuetify({});
