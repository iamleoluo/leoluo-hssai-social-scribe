import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import V2View from '../views/V2View.vue'
import V3View from '../views/V3View.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      alias: '/home',
      component: V3View
    }
    // {
    //   path: '/v3',
    //   name: 'v3',
    //   component: V3View
    // }
  ]
})

export default router
