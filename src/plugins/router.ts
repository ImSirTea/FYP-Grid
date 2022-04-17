import VueRouter, { RouteConfig } from "vue-router";
import App from "@/App.vue";

const routes: RouteConfig[] = [{ path: "/", component: App }];

export default new VueRouter({ mode: "history", routes });
