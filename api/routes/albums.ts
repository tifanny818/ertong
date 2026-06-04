import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 配置 multer 使用内存存储
const upload = multer({ storage: multer.memoryStorage() })

/**
 * 获取所有相册（含照片数量）
 * GET /api/albums
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // 检查 storage bucket 是否存在
    const { data: buckets } = await supabase.storage.listBuckets()
    const photosBucket = buckets?.find(b => b.name === 'photos')
    if (!photosBucket) {
      console.error('Photos bucket not found, creating...')
      await supabase.storage.createBucket('photos', { public: true })
    }

    const { data, error } = await supabase
      .from('albums')
      .select('*, photos(count)')
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ success: false, error: '获取相册列表失败' })
      return
    }

    // 将照片计数提取到顶层字段
    const albums = data.map((album: any) => ({
      ...album,
      photo_count: album.photos?.[0]?.count ?? 0,
      photos: undefined,
    }))

    res.json({ success: true, data: albums })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 创建相册
 * POST /api/albums
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('albums')
      .insert(req.body)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '创建相册失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 更新相册
 * PUT /api/albums/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('albums')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: '更新相册失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 删除相册
 * DELETE /api/albums/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除相册失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 获取相册中的照片
 * GET /api/albums/:albumId/photos
 */
router.get('/:albumId/photos', async (req: Request, res: Response): Promise<void> => {
  try {
    const { albumId } = req.params
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ success: false, error: '获取照片列表失败' })
      return
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

/**
 * 上传照片到相册
 * POST /api/albums/:albumId/photos
 */
router.post(
  '/:albumId/photos',
  authMiddleware,
  upload.array('photos', 20),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { albumId } = req.params
      const files = req.files as Express.Multer.File[]
      const caption = req.body.caption || ''

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: '请选择要上传的照片' })
        return
      }

      const uploadedPhotos: any[] = []

      for (const file of files) {
        // 生成唯一文件名
        const fileName = `${Date.now()}_${file.originalname}`
        const filePath = `${albumId}/${fileName}`

        // 上传到 Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('photos')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          })

        if (storageError) {
          console.error('Storage upload error:', storageError)
          res.status(500).json({ success: false, error: '照片上传失败: ' + storageError.message })
          return
        }

        // 获取公开访问 URL
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)

        // 在数据库中创建照片记录
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .insert({
            album_id: albumId,
            url: urlData.publicUrl,
            caption,
          })
          .select()
          .single()

        if (photoError) {
          console.error('Database insert error:', photoError)
          res.status(500).json({ success: false, error: '保存照片记录失败: ' + photoError.message })
          return
        }

        uploadedPhotos.push(photoData)
      }

      res.json({ success: true, data: uploadedPhotos })
    } catch (err: any) {
      console.error('Upload error:', err)
      res.status(500).json({ success: false, error: '服务器内部错误: ' + (err?.message || '') })
    }
  },
)

/**
 * 删除照片
 * DELETE /api/albums/photos/:id
 */
router.delete('/photos/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 先获取照片信息以便从存储中删除
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('url')
      .eq('id', id)
      .single()

    if (fetchError || !photo) {
      res.status(404).json({ success: false, error: '照片不存在' })
      return
    }

    // 从 URL 中提取存储路径
    const url = new URL(photo.url)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/photos\/(.+)/)
    if (pathMatch) {
      const storagePath = decodeURIComponent(pathMatch[1])
      await supabase.storage.from('photos').remove([storagePath])
    }

    // 从数据库中删除照片记录
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ success: false, error: '删除照片失败' })
      return
    }
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

export default router
