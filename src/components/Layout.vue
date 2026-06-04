<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, TrendingUp, Image, BookOpen, Settings, LogOut } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, logout } = useAuth()

// 当前活跃的导航项
const activeNav = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path === '/growth') return 'growth'
  if (route.path.startsWith('/album')) return 'album'
  if (route.path.startsWith('/diary')) return 'diary'
  return ''
})

// 导航项配置
const navItems = [
  { name: '首页', path: '/', icon: Home, key: 'home' },
  { name: '成长档案', path: '/growth', icon: TrendingUp, key: 'growth' },
  { name: '相册', path: '/album', icon: Image, key: 'album' },
  { name: '成长日记', path: '/diary', icon: BookOpen, key: 'diary' },
]

// 移动端菜单状态
const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-baby-warm font-body">
    <!-- 桌面端顶部导航栏 -->
    <header class="top-nav sticky top-0 hidden md:block">
      <div class="container mx-auto px-6 py-3 flex items-center justify-between">
        <!-- Logo 区域 -->
        <router-link to="/" class="flex items-center gap-2 group">
          <span class="text-3xl animate-wiggle">👶</span>
          <h1 class="font-cute text-2xl text-baby-dark group-hover:text-baby-pink transition-colors">
            宝贝成长记
          </h1>
        </router-link>

        <!-- 导航链接 -->
        <nav class="flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
            :class="activeNav === item.key
              ? 'bg-baby-pink text-white shadow-md'
              : 'text-baby-medium hover:bg-baby-pink/20 hover:text-baby-dark'"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.name }}
          </router-link>

          <!-- 登录/管理入口 -->
          <router-link
            v-if="!isLoggedIn"
            to="/admin"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-baby-medium hover:bg-baby-blue/20 hover:text-baby-dark transition-all duration-300"
          >
            <Settings class="w-4 h-4" />
            管理
          </router-link>
          <div v-else class="flex items-center gap-2">
            <router-link
              to="/admin/dashboard"
              class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-baby-medium hover:bg-baby-blue/20 hover:text-baby-dark transition-all duration-300"
            >
              <Settings class="w-4 h-4" />
              后台
            </router-link>
            <button
              @click="logout(); router.push('/')"
              class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-baby-medium hover:bg-baby-pink/20 hover:text-baby-dark transition-all duration-300"
            >
              <LogOut class="w-4 h-4" />
              退出
            </button>
          </div>
        </nav>

        <!-- 装饰性云朵 -->
        <div class="absolute top-2 right-20 opacity-30 pointer-events-none">
          <div class="cloud-shape w-16 h-5 bg-white/50" style="width:60px; height:20px;">
            <div style="position:absolute; width:25px; height:25px; background:rgba(255,255,255,0.5); border-radius:50%; top:-12px; left:8px;"></div>
            <div style="position:absolute; width:35px; height:35px; background:rgba(255,255,255,0.5); border-radius:50%; top:-20px; left:20px;"></div>
          </div>
        </div>
      </div>
    </header>

    <!-- 页面内容区域 -->
    <main class="pb-20 md:pb-0">
      <router-view />
    </main>

    <!-- 移动端底部导航栏 -->
    <nav class="bottom-nav md:hidden">
      <div class="flex items-center justify-around py-2">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300"
          :class="activeNav === item.key
            ? 'text-baby-pink'
            : 'text-baby-medium'"
        >
          <component
            :is="item.icon"
            class="w-5 h-5 transition-transform duration-300"
            :class="activeNav === item.key ? 'scale-110' : ''"
          />
          <span class="text-xs font-medium">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>

    <!-- 装饰性星星 - 左上角 -->
    <div class="fixed top-20 left-4 text-baby-yellow opacity-40 pointer-events-none star-twinkle text-2xl hidden md:block">
      ★
    </div>
    <!-- 装饰性星星 - 右侧 -->
    <div class="fixed top-40 right-8 text-baby-pink opacity-30 pointer-events-none star-twinkle text-xl hidden md:block" style="animation-delay: 0.5s;">
      ★
    </div>
    <!-- 装饰性星星 - 左下 -->
    <div class="fixed bottom-32 left-8 text-baby-lavender opacity-30 pointer-events-none star-twinkle text-lg hidden md:block" style="animation-delay: 1s;">
      ★
    </div>
  </div>
</template>
