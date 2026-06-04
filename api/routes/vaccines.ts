import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取所有疫苗记录
 * GET /api/vaccines
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('vaccines')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      res.status(500).json({ success: false, error: '获取疫苗记录失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 新增疫苗记录
 * POST /api/vaccines
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('vaccines')
      .insert(req.body)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '新增疫苗记录失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新疫苗记录
 * PUT /api/vaccines/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('vaccines')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '更新疫苗记录失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 删除疫苗记录
 * DELETE /api/vaccines/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('vaccines')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除疫苗记录失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
