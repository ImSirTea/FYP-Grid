import Vue from "vue";
import App from "@/App.vue";
import vuetify from "@/plugins/vuetify";
import VueCompositionAPI from "@vue/composition-api";
import VueRouter from "vue-router";
import router from "@/plugins/router";

Vue.config.productionTip = false;

Vue.use(VueCompositionAPI);
Vue.use(VueRouter);

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
