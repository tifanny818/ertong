import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取所有里程碑
 * GET /api/milestones
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      res.status(500).json({ success: false, error: '获取里程碑失败' })
      return
    }
    // 映射数据库字段到前端字段
    const mappedData = data.map((item: any) => ({
      ...item,
      description: item.note,
    }))
    res.json({ success: true, data: mappedData })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 新增里程碑
 * POST /api/milestones
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating milestone:', req.body)

    // 映射前端字段到数据库字段
    const insertData: any = {
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      note: req.body.description || req.body.note || '',
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      res.status(500).json({ success: false, error: `新增里程碑失败: ${error.message}` })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新里程碑
 * PUT /api/milestones/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 映射前端字段到数据库字段
    const updateData: any = {}
    if (req.body.title !== undefined) updateData.title = req.body.title
    if (req.body.date !== undefined) updateData.date = req.body.date
    if (req.body.category !== undefined) updateData.category = req.body.category
    if (req.body.description !== undefined) updateData.note = req.body.description
    if (req.body.note !== undefined) updateData.note = req.body.note

    const { data, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      res.status(500).json({ success: false, error: `更新里程碑失败: ${error.message}` })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 删除里程碑
 * DELETE /api/milestones/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除里程碑失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
