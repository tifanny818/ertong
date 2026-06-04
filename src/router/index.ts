import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import GrowthPage from '@/pages/GrowthPage.vue'
import AlbumPage from '@/pages/AlbumPage.vue'
import AlbumDetailPage from '@/pages/AlbumDetailPage.vue'
import DiaryPage from '@/pages/DiaryPage.vue'
import DiaryDetailPage from '@/pages/DiaryDetailPage.vue'
import AdminLoginPage from '@/pages/AdminLoginPage.vue'
import AdminDashboardPage from '@/pages/AdminDashboardPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/growth',
    name: 'growth',
    component: GrowthPage,
  },
  {
    path: '/album',
    name: 'album',
    component: AlbumPage,
  },
  {
    path: '/album/:id',
    name: 'albumDetail',
    component: AlbumDetailPage,
  },
  {
    path: '/diary',
    name: 'diary',
    component: DiaryPage,
  },
  {
    path: '/diary/:id',
    name: 'diaryDetail',
    component: DiaryDetailPage,
  },
  {
    path: '/admin',
    name: 'adminLogin',
    component: AdminLoginPage,
  },
  {
    path: '/admin/dashboard',
    name: 'adminDashboard',
    component: AdminDashboardPage,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
