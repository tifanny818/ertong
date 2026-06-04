/**
 * 用户认证路由
 * 使用简单的固定密码模式，不依赖 Supabase Auth
 */
import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()

// 从环境变量读取管理员密码，默认 admin123
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = process.env.JWT_SECRET || 'baby-growth-secret-key-' + Date.now()

// 简单的 token 生成
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// 存储有效的 token（简单内存存储，重启后失效）
const validTokens = new Set<string>()

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ success: false, error: '请输入邮箱和密码' })
      return
    }

    // 简单验证：任何邮箱 + 正确密码即可登录
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ success: false, error: '密码错误' })
      return
    }

    const token = generateToken()
    validTokens.add(token)

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: 1,
          email: email || 'admin@baby.local',
        },
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      validTokens.delete(token)
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.json({ success: true, data: null })
  }
})

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }
    const token = authHeader.split(' ')[1]
    if (!validTokens.has(token)) {
      res.status(401).json({ success: false, error: '登录已过期' })
      return
    }

    res.json({
      success: true,
      data: {
        id: 1,
        email: 'admin@baby.local',
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

// 导出验证 token 的函数供中间件使用
export function verifyToken(token: string): boolean {
  return validTokens.has(token)
}

export default router
