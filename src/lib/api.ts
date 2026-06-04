// API 基础地址
const BASE_URL = '/api'

// 获取存储的认证令牌
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// 通用请求方法
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  // 如果是 FormData，不要设置 Content-Type，让浏览器自动设置
  const isFormData = options?.body instanceof FormData
  const defaultHeaders = getAuthHeaders()
  if (isFormData) {
    delete defaultHeaders['Content-Type']
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '请求失败' }))
    // 兼容后端返回的 error 字段和 message 字段
    const errorMessage = errorData.error || errorData.message || `请求失败: ${response.status}`
    throw new Error(errorMessage)
  }
  const result = await response.json() as ApiResponse<T>
  if (!result.success && result.data === undefined) {
    // 后端返回了 success: false，但没有 data
    throw new Error(result.message || '请求失败')
  }
  return result.data
}

// 宝宝信息接口
export interface Baby {
  id: number
  name: string
  birth_date: string
  avatar_url?: string
  bio?: string
  gender?: string
  created_at: string
  updated_at: string
}

// 成长记录接口
export interface GrowthRecord {
  id: number
  baby_id: number
  date: string
  height: number
  weight: number
  note?: string
  created_at: string
  updated_at: string
}

// 里程碑接口
export interface Milestone {
  id: number
  baby_id: number
  title: string
  category: string
  date: string
  description?: string
  achieved: boolean
  created_at: string
  updated_at: string
}

// 疫苗接口
export interface Vaccine {
  id: number
  baby_id: number
  name: string
  date: string
  status: '已接种' | '计划中'
  note?: string
  created_at: string
  updated_at: string
}

// 相册接口
export interface Album {
  id: string
  baby_id: number
  name: string
  description?: string
  cover_url?: string
  photo_count: number
  created_at: string
  updated_at: string
}

// 照片接口
export interface Photo {
  id: string
  album_id: string
  url: string
  caption?: string
  created_at: string
}

// 日记接口
export interface Diary {
  id: number
  baby_id: number
  title: string
  content: string
  date: string
  created_at: string
  updated_at: string
}

// 时光轴事件接口
export interface TimelineEvent {
  id: number
  baby_id: number
  title: string
  description?: string
  date: string
  type: string
  icon?: string
  created_at: string
  updated_at: string
}

// 通用 API 响应接口
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 宝宝信息 API
export const babyApi = {
  getBaby: () => request<Baby>('/baby'),

  updateBaby: (data: Partial<Baby>) =>
    request<Baby>('/baby', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// 成长记录 API
export const growthApi = {
  getRecords: () => request<GrowthRecord[]>('/growth'),

  createRecord: (data: Omit<GrowthRecord, 'id' | 'baby_id' | 'created_at' | 'updated_at'>) =>
    request<GrowthRecord>('/growth', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRecord: (id: number, data: Partial<GrowthRecord>) =>
    request<GrowthRecord>(`/growth/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRecord: (id: number) =>
    request<void>(`/growth/${id}`, {
      method: 'DELETE',
    }),
}

// 里程碑 API
export const milestoneApi = {
  getMilestones: () => request<Milestone[]>('/milestones'),

  createMilestone: (data: Omit<Milestone, 'id' | 'baby_id' | 'created_at' | 'updated_at'>) =>
    request<Milestone>('/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMilestone: (id: number, data: Partial<Milestone>) =>
    request<Milestone>(`/milestones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMilestone: (id: number) =>
    request<void>(`/milestones/${id}`, {
      method: 'DELETE',
    }),
}

// 疫苗 API
export const vaccineApi = {
  getVaccines: () => request<Vaccine[]>('/vaccines'),

  createVaccine: (data: Omit<Vaccine, 'id' | 'baby_id' | 'created_at' | 'updated_at'>) =>
    request<Vaccine>('/vaccines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVaccine: (id: number, data: Partial<Vaccine>) =>
    request<Vaccine>(`/vaccines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteVaccine: (id: number) =>
    request<void>(`/vaccines/${id}`, {
      method: 'DELETE',
    }),
}

// 相册 API
export const albumApi = {
  getAlbums: () => request<Album[]>('/albums'),

  createAlbum: (data: Omit<Album, 'id' | 'baby_id' | 'photo_count' | 'created_at' | 'updated_at'>) =>
    request<Album>('/albums', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAlbum: (id: string, data: Partial<Album>) =>
    request<Album>(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAlbum: (id: string) =>
    request<void>(`/albums/${id}`, {
      method: 'DELETE',
    }),

  getPhotos: (albumId: string) => request<Photo[]>(`/albums/${albumId}/photos`),

  uploadPhotos: (albumId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('photos', file))
    return request<Photo[]>(`/albums/${albumId}/photos`, {
      method: 'POST',
      body: formData,
    })
  },

  deletePhoto: (albumId: string, photoId: string) =>
    request<void>(`/albums/${albumId}/photos/${photoId}`, {
      method: 'DELETE',
    }),
}

// 日记 API
export const diaryApi = {
  getDiaries: () => request<Diary[]>('/diaries'),

  getDiary: (id: number) => request<Diary>(`/diaries/${id}`),

  createDiary: (data: Omit<Diary, 'id' | 'baby_id' | 'created_at' | 'updated_at'>) =>
    request<Diary>('/diaries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDiary: (id: number, data: Partial<Diary>) =>
    request<Diary>(`/diaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDiary: (id: number) =>
    request<void>(`/diaries/${id}`, {
      method: 'DELETE',
    }),
}

// 时光轴 API
export const timelineApi = {
  getEvents: () => request<TimelineEvent[]>('/timeline'),

  createEvent: (data: Omit<TimelineEvent, 'id' | 'baby_id' | 'created_at' | 'updated_at'>) =>
    request<TimelineEvent>('/timeline', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEvent: (id: number, data: Partial<TimelineEvent>) =>
    request<TimelineEvent>(`/timeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEvent: (id: number) =>
    request<void>(`/timeline/${id}`, {
      method: 'DELETE',
    }),
}

// 认证 API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<void>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request<{ id: number; email: string }>('/auth/me'),
}
