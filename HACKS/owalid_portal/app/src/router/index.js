import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Future from '../views/Future.vue'
import Maps from '../views/Maps.vue'
import Industries from '../views/Industries.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/future',
    name: 'future',
    component: Future
  },
  {
    path: '/maps',
    name: 'maps',
    component: Maps
  },
  {
    path: '/industries',
    name: 'industries',
    component: Industries
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
