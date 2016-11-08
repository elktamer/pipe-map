import Vue from 'vue'
import Home from 'views/home.vue'

import VueRouter from 'vue-router'

Vue.use(VueRouter)
window.eventBus = new Vue()

const routes = [
  {path: '/', component: Home}
]

const router = new VueRouter({
  routes
})

const app = new Vue({
  router,
}).$mount('#app')
