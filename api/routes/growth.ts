import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取所有成长记录
 * GET /api/growth
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('growth_records')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      res.status(500).json({ success: false, error: '获取成长记录失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 新增成长记录
 * POST /api/growth
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('growth_records')
      .insert(req.body)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '新增成长记录失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新成长记录
 * PUT /api/growth/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('growth_records')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '更新成长记录失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 删除成长记录
 * DELETE /api/growth/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('growth_records')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除成长记录失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
