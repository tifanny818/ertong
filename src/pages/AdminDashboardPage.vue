<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  babyApi, growthApi, milestoneApi, vaccineApi, albumApi, diaryApi, timelineApi,
  type Baby as BabyType, type GrowthRecord, type Milestone, type Vaccine,
  type Album, type Diary, type TimelineEvent, type Photo,
} from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import {
  Baby, TrendingUp, Star, Syringe, Image, BookOpen, Clock,
  Plus, Edit2, Trash2, Upload, LogOut,
} from 'lucide-vue-next'

const router = useRouter()
const { isLoggedIn, logout: authLogout } = useAuth()

// 当前选中的管理区域
const activeSection = ref('baby')

// 管理区域配置
const sections = [
  { key: 'baby', label: '宝宝信息', icon: Baby },
  { key: 'growth', label: '成长记录', icon: TrendingUp },
  { key: 'milestone', label: '里程碑', icon: Star },
  { key: 'vaccine', label: '疫苗', icon: Syringe },
  { key: 'album', label: '相册', icon: Image },
  { key: 'diary', label: '日记', icon: BookOpen },
  { key: 'timeline', label: '时光轴', icon: Clock },
]

// 数据状态
const baby = ref<BabyType | null>(null)
const records = ref<GrowthRecord[]>([])
const milestones = ref<Milestone[]>([])
const vaccines = ref<Vaccine[]>([])
const albums = ref<Album[]>([])
const diaries = ref<Diary[]>([])
const events = ref<TimelineEvent[]>([])
const loading = ref(true)

// 模态框状态
const showModal = ref(false)
const modalTitle = ref('')
const editingId = ref<string | number | null>(null)

// 表单数据
const babyForm = ref({ name: '', birth_date: '', bio: '', gender: '' })
const growthForm = ref({ date: '', height: 0, weight: 0, note: '' })
const milestoneForm = ref({ title: '', category: '运动', date: '', description: '', achieved: true })
const vaccineForm = ref({ name: '', date: '', status: '计划中' as '已接种' | '计划中', note: '' })
const albumForm = ref({ name: '', description: '' })
const diaryForm = ref({ title: '', content: '', date: '' })
const timelineForm = ref({ title: '', description: '', date: '', type: '成长', icon: '' })

// 拖拽上传状态
const isDragging = ref(false)
const uploadAlbumId = ref<string | null>(null)
const uploadPhotos = ref<Photo[]>([])

// 检查认证状态
onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/admin')
    return
  }
  loadAllData()
})

// 加载所有数据
async function loadAllData() {
  loading.value = true
  try {
    const [babyData, recordsData, milestonesData, vaccinesData, albumsData, diariesData, eventsData] = await Promise.all([
      babyApi.getBaby().catch(() => null),
      growthApi.getRecords().catch(() => []),
      milestoneApi.getMilestones().catch(() => []),
      vaccineApi.getVaccines().catch(() => []),
      albumApi.getAlbums().catch(() => []),
      diaryApi.getDiaries().catch(() => []),
      timelineApi.getEvents().catch(() => []),
    ])
    baby.value = babyData
    records.value = recordsData
    milestones.value = milestonesData
    vaccines.value = vaccinesData
    albums.value = albumsData
    diaries.value = diariesData
    events.value = eventsData
  } finally {
    loading.value = false
  }
}

// 登出
function handleLogout() {
  authLogout()
  router.push('/admin')
}

// 打开新增/编辑模态框
function openModal(section: string, item?: Record<string, unknown>) {
  editingId.value = item?.id as string | number | null ?? null
  modalTitle.value = item ? '编辑' : '新增'

  switch (section) {
    case 'baby':
      if (item) babyForm.value = { name: (item as unknown as BabyType).name, birth_date: (item as unknown as BabyType).birth_date, bio: (item as unknown as BabyType).bio || '', gender: (item as unknown as BabyType).gender || '' }
      else babyForm.value = { name: '', birth_date: '', bio: '', gender: '' }
      break
    case 'growth':
      if (item) growthForm.value = { date: (item as unknown as GrowthRecord).date, height: (item as unknown as GrowthRecord).height, weight: (item as unknown as GrowthRecord).weight, note: (item as unknown as GrowthRecord).note || '' }
      else growthForm.value = { date: new Date().toISOString().split('T')[0], height: 0, weight: 0, note: '' }
      break
    case 'milestone':
      if (item) milestoneForm.value = { title: (item as unknown as Milestone).title, category: (item as unknown as Milestone).category, date: (item as unknown as Milestone).date, description: (item as unknown as Milestone).description || '', achieved: (item as unknown as Milestone).achieved }
      else milestoneForm.value = { title: '', category: '运动', date: new Date().toISOString().split('T')[0], description: '', achieved: true }
      break
    case 'vaccine':
      if (item) vaccineForm.value = { name: (item as unknown as Vaccine).name, date: (item as unknown as Vaccine).date, status: (item as unknown as Vaccine).status, note: (item as unknown as Vaccine).note || '' }
      else vaccineForm.value = { name: '', date: new Date().toISOString().split('T')[0], status: '计划中', note: '' }
      break
    case 'album':
      if (item) albumForm.value = { name: (item as unknown as Album).name, description: (item as unknown as Album).description || '' }
      else albumForm.value = { name: '', description: '' }
      break
    case 'diary':
      if (item) diaryForm.value = { title: (item as unknown as Diary).title, content: (item as unknown as Diary).content, date: (item as unknown as Diary).date }
      else diaryForm.value = { title: '', content: '', date: new Date().toISOString().split('T')[0] }
      break
    case 'timeline':
      if (item) timelineForm.value = { title: (item as unknown as TimelineEvent).title, description: (item as unknown as TimelineEvent).description || '', date: (item as unknown as TimelineEvent).date, type: (item as unknown as TimelineEvent).type, icon: (item as unknown as TimelineEvent).icon || '' }
      else timelineForm.value = { title: '', description: '', date: new Date().toISOString().split('T')[0], type: '成长', icon: '' }
      break
  }

  showModal.value = true
}

// 保存数据
async function saveItem() {
  try {
    switch (activeSection.value) {
      case 'baby':
        if (editingId.value && baby.value) {
          baby.value = await babyApi.updateBaby({ id: baby.value.id, ...babyForm.value })
        } else if (baby.value) {
          baby.value = await babyApi.updateBaby({ id: baby.value.id, ...babyForm.value })
        } else {
          // 如果没有 baby 数据，先创建
          baby.value = await babyApi.updateBaby({ ...babyForm.value, id: 1 } as unknown as Partial<BabyType>)
        }
        break
      case 'growth':
        if (editingId.value) {
          const r = await growthApi.updateRecord(Number(editingId.value), growthForm.value)
          const idx = records.value.findIndex(x => x.id === r.id)
          if (idx !== -1) records.value[idx] = r
        } else {
          records.value.push(await growthApi.createRecord(growthForm.value))
        }
        break
      case 'milestone':
        if (editingId.value) {
          const r = await milestoneApi.updateMilestone(Number(editingId.value), milestoneForm.value)
          const idx = milestones.value.findIndex(x => x.id === r.id)
          if (idx !== -1) milestones.value[idx] = r
        } else {
          milestones.value.push(await milestoneApi.createMilestone(milestoneForm.value))
        }
        break
      case 'vaccine':
        if (editingId.value) {
          const r = await vaccineApi.updateVaccine(Number(editingId.value), vaccineForm.value)
          const idx = vaccines.value.findIndex(x => x.id === r.id)
          if (idx !== -1) vaccines.value[idx] = r
        } else {
          vaccines.value.push(await vaccineApi.createVaccine(vaccineForm.value))
        }
        break
      case 'album':
        if (editingId.value) {
          const r = await albumApi.updateAlbum(String(editingId.value), albumForm.value)
          const idx = albums.value.findIndex(x => x.id === r.id)
          if (idx !== -1) albums.value[idx] = r
        } else {
          albums.value.push(await albumApi.createAlbum(albumForm.value))
        }
        break
      case 'diary':
        if (editingId.value) {
          const r = await diaryApi.updateDiary(Number(editingId.value), diaryForm.value)
          const idx = diaries.value.findIndex(x => x.id === r.id)
          if (idx !== -1) diaries.value[idx] = r
        } else {
          diaries.value.push(await diaryApi.createDiary(diaryForm.value))
        }
        break
      case 'timeline':
        if (editingId.value) {
          const r = await timelineApi.updateEvent(Number(editingId.value), timelineForm.value)
          const idx = events.value.findIndex(x => x.id === r.id)
          if (idx !== -1) events.value[idx] = r
        } else {
          events.value.push(await timelineApi.createEvent(timelineForm.value))
        }
        break
    }
    showModal.value = false
    alert('保存成功！')
    // 刷新对应模块的数据
    if (activeSection.value === 'baby') {
      baby.value = await babyApi.getBaby().catch(() => null)
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    alert('保存失败: ' + (error?.message || '未知错误'))
  }
}

// 删除数据
async function deleteItem(section: string, id: string | number) {
  if (!confirm('确定要删除吗？')) return
  try {
    switch (section) {
      case 'growth':
        await growthApi.deleteRecord(Number(id))
        records.value = records.value.filter(r => r.id !== id)
        break
      case 'milestone':
        await milestoneApi.deleteMilestone(Number(id))
        milestones.value = milestones.value.filter(m => m.id !== id)
        break
      case 'vaccine':
        await vaccineApi.deleteVaccine(Number(id))
        vaccines.value = vaccines.value.filter(v => v.id !== id)
        break
      case 'album':
        await albumApi.deleteAlbum(String(id))
        albums.value = albums.value.filter(a => a.id !== id)
        break
      case 'diary':
        await diaryApi.deleteDiary(Number(id))
        diaries.value = diaries.value.filter(d => d.id !== id)
        break
      case 'timeline':
        await timelineApi.deleteEvent(Number(id))
        events.value = events.value.filter(e => e.id !== id)
        break
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 拖拽上传相关
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

async function handleDrop(e: DragEvent, albumId: string) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  await uploadFiles(albumId, Array.from(files))
}

async function uploadFiles(albumId: string, files: File[]) {
  try {
    const newPhotos = await albumApi.uploadPhotos(albumId, files)
    uploadPhotos.value = newPhotos
    // 刷新相册列表
    albums.value = await albumApi.getAlbums()
    alert('上传成功！')
  } catch (error: any) {
    console.error('上传照片失败:', error)
    alert('上传失败: ' + (error?.message || '未知错误'))
  }
}

function handleFileInput(e: Event, albumId: string) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  uploadFiles(albumId, Array.from(input.files))
  // 重置 input 以便下次能重新选择相同文件
  input.value = ''
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- 侧边导航 -->
    <aside class="hidden md:block w-56 bg-white border-r border-baby-pink/20 p-4 sticky top-0 h-screen">
      <!-- Logo -->
      <div class="flex items-center gap-2 mb-6 px-2">
        <span class="text-2xl">👶</span>
        <h1 class="font-cute text-lg text-baby-dark">管理后台</h1>
      </div>

      <!-- 导航列表 -->
      <nav class="space-y-1">
        <button
          v-for="section in sections"
          :key="section.key"
          @click="activeSection = section.key"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          :class="activeSection === section.key
            ? 'bg-baby-pink text-white shadow-md'
            : 'text-baby-medium hover:bg-baby-pink/10 hover:text-baby-dark'"
        >
          <component :is="section.icon" class="w-4 h-4" />
          {{ section.label }}
        </button>
      </nav>

      <!-- 登出按钮 -->
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-baby-medium hover:bg-red-50 hover:text-red-500 transition-all mt-8"
      >
        <LogOut class="w-4 h-4" /> 退出登录
      </button>
    </aside>

    <!-- 移动端标签栏 -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-baby-pink/20 z-50">
      <div class="flex overflow-x-auto py-2 px-2 gap-1">
        <button
          v-for="section in sections"
          :key="section.key"
          @click="activeSection = section.key"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
          :class="activeSection === section.key
            ? 'bg-baby-pink text-white'
            : 'text-baby-medium'"
        >
          <component :is="section.icon" class="w-3 h-3" />
          {{ section.label }}
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <main class="flex-1 p-4 md:p-8 pb-24 md:pb-8">
      <LoadingSpinner v-if="loading" />

      <template v-else>
        <!-- 宝宝信息管理 -->
        <section v-if="activeSection === 'baby'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">👶 宝宝信息</h2>
            <button @click="openModal('baby', baby || undefined)" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-pink text-white font-medium hover:bg-baby-pink/80 transition-all shadow-md">
              <Edit2 class="w-4 h-4" /> 编辑
            </button>
          </div>
          <div v-if="baby" class="card">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-baby-pink/20 flex items-center justify-center text-3xl">
                👶
              </div>
              <div>
                <h3 class="font-cute text-xl text-baby-dark">{{ baby.name }}</h3>
                <p class="text-baby-medium text-sm">🎂 {{ baby.birth_date }}</p>
                <p v-if="baby.bio" class="text-baby-medium text-sm">{{ baby.bio }}</p>
              </div>
            </div>
          </div>
          <EmptyState v-else message="还没有宝宝信息" />
        </section>

        <!-- 成长记录管理 -->
        <section v-if="activeSection === 'growth'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">📏 成长记录</h2>
            <button @click="openModal('growth')" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-pink text-white font-medium hover:bg-baby-pink/80 transition-all shadow-md">
              <Plus class="w-4 h-4" /> 添加记录
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="record in records" :key="record.id" class="card flex items-center justify-between">
              <div>
                <p class="text-baby-medium text-sm">{{ record.date }}</p>
                <p class="font-cute text-baby-dark">身高: {{ record.height }}cm / 体重: {{ record.weight }}kg</p>
              </div>
              <div class="flex gap-2">
                <button @click="openModal('growth', record as unknown as Record<string, unknown>)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium"><Edit2 class="w-4 h-4" /></button>
                <button @click="deleteItem('growth', record.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <EmptyState v-if="records.length === 0" message="还没有成长记录" />
        </section>

        <!-- 里程碑管理 -->
        <section v-if="activeSection === 'milestone'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">⭐ 里程碑</h2>
            <button @click="openModal('milestone')" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-mint text-white font-medium hover:bg-baby-mint/80 transition-all shadow-md">
              <Plus class="w-4 h-4" /> 添加里程碑
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="milestone in milestones" :key="milestone.id" class="card">
              <div class="flex items-start justify-between">
                <div>
                  <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1" :class="milestone.category === '运动' ? 'bg-baby-pink text-pink-700' : milestone.category === '语言' ? 'bg-baby-blue text-blue-700' : milestone.category === '认知' ? 'bg-baby-lavender text-purple-700' : 'bg-baby-mint text-green-700'">
                    {{ milestone.category }}
                  </span>
                  <h4 class="font-cute text-baby-dark">{{ milestone.title }}</h4>
                  <p class="text-baby-medium text-sm">{{ milestone.date }}</p>
                </div>
                <div class="flex gap-1">
                  <button @click="openModal('milestone', milestone as unknown as Record<string, unknown>)" class="p-1.5 rounded-full hover:bg-baby-pink/20 text-baby-medium"><Edit2 class="w-3.5 h-3.5" /></button>
                  <button @click="deleteItem('milestone', milestone.id)" class="p-1.5 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500"><Trash2 class="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
          <EmptyState v-if="milestones.length === 0" message="还没有里程碑" />
        </section>

        <!-- 疫苗管理 -->
        <section v-if="activeSection === 'vaccine'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">💉 疫苗记录</h2>
            <button @click="openModal('vaccine')" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-yellow text-yellow-800 font-medium hover:bg-baby-yellow/80 transition-all shadow-md">
              <Plus class="w-4 h-4" /> 添加疫苗
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="vaccine in vaccines" :key="vaccine.id" class="card flex items-center justify-between">
              <div>
                <h4 class="font-cute text-baby-dark">{{ vaccine.name }}</h4>
                <p class="text-baby-medium text-sm">{{ vaccine.date }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span :class="vaccine.status === '已接种' ? 'badge-green' : 'badge-yellow'">{{ vaccine.status }}</span>
                <button @click="openModal('vaccine', vaccine as unknown as Record<string, unknown>)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium"><Edit2 class="w-4 h-4" /></button>
                <button @click="deleteItem('vaccine', vaccine.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <EmptyState v-if="vaccines.length === 0" message="还没有疫苗记录" />
        </section>

        <!-- 相册管理 -->
        <section v-if="activeSection === 'album'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">📸 相册管理</h2>
            <button @click="openModal('album')" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-blue text-blue-800 font-medium hover:bg-baby-blue/80 transition-all shadow-md">
              <Plus class="w-4 h-4" /> 新建相册
            </button>
          </div>
          <div class="space-y-4">
            <div v-for="album in albums" :key="album.id" class="card">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h4 class="font-cute text-lg text-baby-dark">{{ album.name }}</h4>
                  <p class="text-baby-medium text-sm">{{ album.photo_count }} 张照片</p>
                </div>
                <div class="flex gap-2">
                  <button @click="openModal('album', album as unknown as Record<string, unknown>)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium"><Edit2 class="w-4 h-4" /></button>
                  <button @click="deleteItem('album', album.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
                </div>
              </div>

              <!-- 拖拽上传区域 -->
              <div
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop($event, album.id)"
                class="border-2 border-dashed rounded-xl p-6 text-center transition-all"
                :class="isDragging ? 'border-baby-pink bg-baby-pink/10' : 'border-baby-pink/30 hover:border-baby-pink/50'"
              >
                <Upload class="w-8 h-8 mx-auto text-baby-medium mb-2" />
                <p class="text-baby-medium text-sm">拖拽照片到此处上传</p>
                <p class="text-baby-medium text-xs mt-1">支持批量选择多张照片</p>
                <label class="inline-block mt-2 px-4 py-1.5 rounded-full bg-baby-pink/20 text-baby-pink text-sm font-medium cursor-pointer hover:bg-baby-pink/30 transition-all">
                  选择多张照片
                  <input type="file" multiple accept="image/*" class="hidden" @change="handleFileInput($event, album.id)" />
                </label>
              </div>
            </div>
          </div>
          <EmptyState v-if="albums.length === 0" message="还没有相册" />
        </section>

        <!-- 日记管理 -->
        <section v-if="activeSection === 'diary'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">📖 日记管理</h2>
            <button @click="openModal('diary')" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-lavender text-white font-medium hover:bg-baby-lavender/80 transition-all shadow-md">
              <Plus class="w-4 h-4" /> 写日记
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="diary in diaries" :key="diary.id" class="card flex items-center justify-between">
              <div class="flex-1">
                <p class="text-baby-medium text-xs">{{ diary.date }}</p>
                <h4 class="font-cute text-baby-dark">{{ diary.title }}</h4>
              </div>
              <div class="flex gap-2">
                <button @click="openModal('diary', diary as unknown as Record<string, unknown>)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium"><Edit2 class="w-4 h-4" /></button>
                <button @click="deleteItem('diary', diary.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <EmptyState v-if="diaries.length === 0" message="还没有日记" />
        </section>

        <!-- 时光轴管理 -->
        <section v-if="activeSection === 'timeline'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cute text-2xl text-baby-dark">🎈 时光轴管理</h2>
            <button @click="openModal('timeline')" class="flex items-center gap-1 px-4 py-2 rounded-full gradient-pink text-white font-medium hover:opacity-90 transition-all shadow-md">
              <Plus class="w-4 h-4" /> 添加事件
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="event in events" :key="event.id" class="card flex items-center justify-between">
              <div>
                <p class="text-baby-medium text-xs">{{ event.date }} · {{ event.type }}</p>
                <h4 class="font-cute text-baby-dark">{{ event.title }}</h4>
              </div>
              <div class="flex gap-2">
                <button @click="openModal('timeline', event as unknown as Record<string, unknown>)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium"><Edit2 class="w-4 h-4" /></button>
                <button @click="deleteItem('timeline', event.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <EmptyState v-if="events.length === 0" message="还没有时光轴事件" />
        </section>
      </template>

      <!-- 通用模态框 -->
      <Modal :show="showModal" :title="modalTitle" @close="showModal = false">
        <!-- 宝宝信息表单 -->
        <form v-if="activeSection === 'baby'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">名字</label>
            <input v-model="babyForm.name" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">出生日期</label>
            <input v-model="babyForm.birth_date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">性别</label>
            <select v-model="babyForm.gender" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none">
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">简介</label>
            <textarea v-model="babyForm.bio" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-pink text-white font-medium hover:opacity-90 transition-all">保存</button>
        </form>

        <!-- 成长记录表单 -->
        <form v-if="activeSection === 'growth'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
            <input v-model="growthForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">身高 (cm)</label>
              <input v-model.number="growthForm.height" type="number" step="0.1" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">体重 (kg)</label>
              <input v-model.number="growthForm.weight" type="number" step="0.1" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">备注</label>
            <textarea v-model="growthForm.note" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-pink text-white font-medium hover:opacity-90 transition-all">保存</button>
        </form>

        <!-- 里程碑表单 -->
        <form v-if="activeSection === 'milestone'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">标题</label>
            <input v-model="milestoneForm.title" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">分类</label>
              <select v-model="milestoneForm.category" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none">
                <option value="运动">运动</option>
                <option value="语言">语言</option>
                <option value="认知">认知</option>
                <option value="社交">社交</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
              <input v-model="milestoneForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">描述</label>
            <textarea v-model="milestoneForm.description" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="milestoneForm.achieved" type="checkbox" class="w-4 h-4 rounded accent-baby-pink" />
            <label class="text-sm font-medium text-baby-dark">已达成</label>
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-mint text-white font-medium hover:opacity-90 transition-all">保存</button>
        </form>

        <!-- 疫苗表单 -->
        <form v-if="activeSection === 'vaccine'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">疫苗名称</label>
            <input v-model="vaccineForm.name" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
              <input v-model="vaccineForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">状态</label>
              <select v-model="vaccineForm.status" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none">
                <option value="计划中">计划中</option>
                <option value="已接种">已接种</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">备注</label>
            <textarea v-model="vaccineForm.note" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-warm text-baby-dark font-medium hover:opacity-90 transition-all">保存</button>
        </form>

        <!-- 相册表单 -->
        <form v-if="activeSection === 'album'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">相册名称</label>
            <input v-model="albumForm.name" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">描述</label>
            <textarea v-model="albumForm.description" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-blue text-blue-800 font-medium hover:opacity-90 transition-all">保存</button>
        </form>

        <!-- 日记表单 -->
        <form v-if="activeSection === 'diary'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">标题</label>
            <input v-model="diaryForm.title" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
            <input v-model="diaryForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">内容</label>
            <textarea v-model="diaryForm.content" rows="6" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-lavender text-white font-medium hover:opacity-90 transition-all">保存</button>
        </form>

        <!-- 时光轴表单 -->
        <form v-if="activeSection === 'timeline'" @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">标题</label>
            <input v-model="timelineForm.title" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
              <input v-model="timelineForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">类型</label>
              <select v-model="timelineForm.type" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none">
                <option value="成长">成长</option>
                <option value="里程碑">里程碑</option>
                <option value="疫苗">疫苗</option>
                <option value="日记">日记</option>
                <option value="照片">照片</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">描述</label>
            <textarea v-model="timelineForm.description" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink outline-none resize-none" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl gradient-pink text-white font-medium hover:opacity-90 transition-all">保存</button>
        </form>
      </Modal>
    </main>
  </div>
</template>
