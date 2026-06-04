import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取所有日记
 * GET /api/diaries
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      res.status(500).json({ success: false, error: '获取日记列表失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 获取单篇日记
 * GET /api/diaries/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      res.status(404).json({ success: false, error: '日记不存在' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 创建日记
 * POST /api/diaries
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('diaries')
      .insert(req.body)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '创建日记失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新日记
 * PUT /api/diaries/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('diaries')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '更新日记失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 删除日记
 * DELETE /api/diaries/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('diaries')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除日记失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
