<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const { login } = useAuth()

// 表单数据
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

// 登录
async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const result = await login(email.value, password.value)
    if (result.success) {
      router.push('/admin/dashboard')
    } else {
      error.value = result.message || '登录失败'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <!-- 登录卡片 -->
    <div class="card w-full max-w-md relative overflow-hidden">
      <!-- 云朵装饰 -->
      <div class="absolute top-4 left-4 opacity-20 pointer-events-none">
        <div class="cloud-shape w-16 h-5 bg-baby-blue/50" style="width:64px; height:20px;">
          <div style="position:absolute; width:26px; height:26px; background:rgba(168,216,234,0.5); border-radius:50%; top:-13px; left:8px;"></div>
          <div style="position:absolute; width:36px; height:36px; background:rgba(168,216,234,0.5); border-radius:50%; top:-22px; left:22px;"></div>
        </div>
      </div>

      <!-- 星星装饰 -->
      <div class="absolute top-6 right-8 text-baby-yellow text-xl star-twinkle">★</div>
      <div class="absolute bottom-8 left-6 text-baby-pink text-sm star-twinkle" style="animation-delay: 0.5s;">★</div>
      <div class="absolute bottom-12 right-10 text-baby-lavender text-sm star-twinkle" style="animation-delay: 1s;">★</div>

      <!-- 标题 -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3 animate-float">👶</div>
        <h1 class="font-cute text-2xl text-baby-dark">管理员登录</h1>
        <p class="text-baby-medium text-sm mt-1">登录后可以管理宝贝的成长记录</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- 邮箱 -->
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            required
            class="w-full px-4 py-2.5 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none bg-white/50"
          />
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">密码</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none bg-white/50 pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-baby-medium hover:text-baby-pink transition-colors"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 错误消息 -->
        <p v-if="error" class="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2">
          {{ error }}
        </p>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-xl gradient-pink text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
