import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import FaceEmotionDemo from "@/views/FaceEmotionDemo.vue";
import MqttGraphDemo from "@/views/MqttGraph.vue";
Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/face-emotion",
      name: "face-emotion",
      component: FaceEmotionDemo
    },
    {
      path: "/mqtt-graph",
      name: "mqtt-graph",
      component: MqttGraphDemo
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
