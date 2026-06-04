import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取宝宝信息
 * GET /api/baby
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('baby')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '获取宝宝信息失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新宝宝信息
 * PUT /api/baby
 */
router.put('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, ...updates } = req.body
    if (!id) {
      res.status(400).json({ success: false, error: '缺少宝宝ID' })
      return
    }

    console.log('Updating baby:', { id, updates })

    const { data, error } = await supabase
      .from('baby')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      res.status(500).json({ success: false, error: `更新宝宝信息失败: ${error.message}` })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
