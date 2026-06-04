import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取所有时光轴事件
 * GET /api/timeline
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      res.status(500).json({ success: false, error: '获取时光轴事件失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 新增时光轴事件
 * POST /api/timeline
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating timeline event:', req.body)

    // 自动获取 baby_id
    const { data: babyData, error: babyError } = await supabase
      .from('baby')
      .select('id')
      .limit(1)
      .single()

    if (babyError) {
      console.error('Failed to get baby:', babyError)
      res.status(500).json({ success: false, error: '新增时光轴事件失败: 无法获取宝宝信息' })
      return
    }

    const { data, error } = await supabase
      .from('timeline_events')
      .insert({ baby_id: babyData.id, ...req.body })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      res.status(500).json({ success: false, error: `新增时光轴事件失败: ${error.message}` })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新时光轴事件
 * PUT /api/timeline/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('timeline_events')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '更新时光轴事件失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 删除时光轴事件
 * DELETE /api/timeline/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除时光轴事件失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
