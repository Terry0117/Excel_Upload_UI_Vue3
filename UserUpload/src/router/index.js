import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      redirect:{
        name:'create'
      }
    },
    {
      path:'/createTable',
      name:'create',
      component: () => import('../views/CreateTable.vue'),
    },
    {
      path:'/uploadExcel',
      name:'upload',
      component: () => import('../views/UploadExcel.vue')
    },
    {
      path:'/search',
      name:'search',
      component: () => import('../views/SearchTable.vue')
    }
  ]
})

export default router
