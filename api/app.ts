/**
 * 儿童成长追踪器 - API 服务器入口
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import babyRoutes from './routes/baby.js'
import growthRoutes from './routes/growth.js'
import milestoneRoutes from './routes/milestones.js'
import vaccineRoutes from './routes/vaccines.js'
import albumRoutes from './routes/albums.js'
import diaryRoutes from './routes/diaries.js'
import timelineRoutes from './routes/timeline.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

/**
 * API 路由
 */
app.use('/api/auth', authRoutes)
app.use('/api/baby', babyRoutes)
app.use('/api/growth', growthRoutes)
app.use('/api/milestones', milestoneRoutes)
app.use('/api/vaccines', vaccineRoutes)
app.use('/api/albums', albumRoutes)
app.use('/api/diaries', diaryRoutes)
app.use('/api/timeline', timelineRoutes)

/**
 * 健康检查
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * 错误处理中间件
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

/**
 * 404 处理
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
  })
})

export default app
