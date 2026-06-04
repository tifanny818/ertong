import { ref, onMounted } from 'vue'
import { authApi } from '@/lib/api'

// 认证状态
const isLoggedIn = ref(false)
const user = ref<{ id: number; email: string } | null>(null)
const token = ref<string | null>(null)

// 认证组合式函数
export function useAuth() {
  // 检查本地存储中的认证状态
  const checkAuth = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      isLoggedIn.value = true
      // 尝试获取用户信息
      authApi.getMe().then(userData => {
        user.value = userData
      }).catch(() => {
        // 令牌无效，清除认证状态
        logout()
      })
    }
  }

  // 登录
  const login = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password)
      token.value = result.token
      user.value = result.user
      isLoggedIn.value = true
      localStorage.setItem('token', result.token)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登录失败'
      return { success: false, message }
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  // 组件挂载时检查认证状态
  onMounted(() => {
    checkAuth()
  })

  return {
    isLoggedIn,
    user,
    token,
    login,
    logout,
    checkAuth,
  }
}
