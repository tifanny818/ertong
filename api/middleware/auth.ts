import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../routes/auth.js'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录' })
    return
  }
  const token = authHeader.split(' ')[1]
  if (!verifyToken(token)) {
    res.status(401).json({ success: false, error: '登录已过期' })
    return
  }
  ;(req as any).user = { id: 1, email: 'admin@baby.local' }
  next()
}
