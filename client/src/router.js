import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import RoomView from './views/RoomView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/room/:id',
    name: 'room',
    component: RoomView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
