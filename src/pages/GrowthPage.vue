<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { growthApi, milestoneApi, vaccineApi, type GrowthRecord, type Milestone, type Vaccine } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import GrowthChart from '@/components/GrowthChart.vue'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Plus, Edit2, Trash2 } from 'lucide-vue-next'

const { isLoggedIn } = useAuth()

// 当前标签页
const activeTab = ref<'growth' | 'milestone' | 'vaccine'>('growth')

// 数据状态
const records = ref<GrowthRecord[]>([])
const milestones = ref<Milestone[]>([])
const vaccines = ref<Vaccine[]>([])
const loading = ref(true)

// 里程碑分类筛选
const milestoneFilter = ref('全部')
const milestoneCategories = ['全部', '运动', '语言', '认知', '社交']

// 筛选后的里程碑
const filteredMilestones = ref<Milestone[]>([])

// 模态框状态
const showGrowthModal = ref(false)
const showMilestoneModal = ref(false)
const showVaccineModal = ref(false)
const editingItem = ref<GrowthRecord | Milestone | Vaccine | null>(null)

// 表单数据
const growthForm = ref({ date: '', height: 0, weight: 0, note: '' })
const milestoneForm = ref({ title: '', category: '运动', date: '', description: '', achieved: true })
const vaccineForm = ref({ name: '', date: '', status: '计划中' as '已接种' | '计划中', note: '' })

// 加载数据
onMounted(async () => {
  try {
    const [recordsData, milestonesData, vaccinesData] = await Promise.all([
      growthApi.getRecords().catch(() => []),
      milestoneApi.getMilestones().catch(() => []),
      vaccineApi.getVaccines().catch(() => []),
    ])
    records.value = recordsData
    milestones.value = milestonesData
    filteredMilestones.value = milestonesData
    vaccines.value = vaccinesData
  } finally {
    loading.value = false
  }
})

// 筛选里程碑
function filterMilestones(category: string) {
  milestoneFilter.value = category
  filteredMilestones.value = category === '全部'
    ? milestones.value
    : milestones.value.filter(m => m.category === category)
}

// 获取里程碑分类颜色
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    运动: 'bg-baby-pink text-pink-700',
    语言: 'bg-baby-blue text-blue-700',
    认知: 'bg-baby-lavender text-purple-700',
    社交: 'bg-baby-mint text-green-700',
  }
  return colors[category] || 'bg-baby-pink text-pink-700'
}

// 打开新增成长记录模态框
function openGrowthModal(item?: GrowthRecord) {
  if (item) {
    editingItem.value = item
    growthForm.value = { date: item.date, height: item.height, weight: item.weight, note: item.note || '' }
  } else {
    editingItem.value = null
    growthForm.value = { date: new Date().toISOString().split('T')[0], height: 0, weight: 0, note: '' }
  }
  showGrowthModal.value = true
}

// 保存成长记录
async function saveGrowth() {
  try {
    if (editingItem.value) {
      const result = await growthApi.updateRecord((editingItem.value as GrowthRecord).id, growthForm.value)
      const index = records.value.findIndex(r => r.id === result.id)
      if (index !== -1) records.value[index] = result
    } else {
      const result = await growthApi.createRecord(growthForm.value)
      records.value.push(result)
    }
    showGrowthModal.value = false
  } catch (error) {
    console.error('保存成长记录失败:', error)
  }
}

// 删除成长记录
async function deleteGrowth(id: number) {
  try {
    await growthApi.deleteRecord(id)
    records.value = records.value.filter(r => r.id !== id)
  } catch (error) {
    console.error('删除成长记录失败:', error)
  }
}

// 打开新增里程碑模态框
function openMilestoneModal(item?: Milestone) {
  if (item) {
    editingItem.value = item
    milestoneForm.value = { title: item.title, category: item.category, date: item.date, description: item.description || '', achieved: item.achieved }
  } else {
    editingItem.value = null
    milestoneForm.value = { title: '', category: '运动', date: new Date().toISOString().split('T')[0], description: '', achieved: true }
  }
  showMilestoneModal.value = true
}

// 保存里程碑
async function saveMilestone() {
  try {
    if (editingItem.value) {
      const result = await milestoneApi.updateMilestone((editingItem.value as Milestone).id, milestoneForm.value)
      const index = milestones.value.findIndex(m => m.id === result.id)
      if (index !== -1) {
        milestones.value[index] = result
        filterMilestones(milestoneFilter.value)
      }
    } else {
      const result = await milestoneApi.createMilestone(milestoneForm.value)
      milestones.value.push(result)
      filterMilestones(milestoneFilter.value)
    }
    showMilestoneModal.value = false
  } catch (error) {
    console.error('保存里程碑失败:', error)
  }
}

// 删除里程碑
async function deleteMilestone(id: number) {
  try {
    await milestoneApi.deleteMilestone(id)
    milestones.value = milestones.value.filter(m => m.id !== id)
    filterMilestones(milestoneFilter.value)
  } catch (error) {
    console.error('删除里程碑失败:', error)
  }
}

// 打开新增疫苗模态框
function openVaccineModal(item?: Vaccine) {
  if (item) {
    editingItem.value = item
    vaccineForm.value = { name: item.name, date: item.date, status: item.status, note: item.note || '' }
  } else {
    editingItem.value = null
    vaccineForm.value = { name: '', date: new Date().toISOString().split('T')[0], status: '计划中', note: '' }
  }
  showVaccineModal.value = true
}

// 保存疫苗记录
async function saveVaccine() {
  try {
    if (editingItem.value) {
      const result = await vaccineApi.updateVaccine((editingItem.value as Vaccine).id, vaccineForm.value)
      const index = vaccines.value.findIndex(v => v.id === result.id)
      if (index !== -1) vaccines.value[index] = result
    } else {
      const result = await vaccineApi.createVaccine(vaccineForm.value)
      vaccines.value.push(result)
    }
    showVaccineModal.value = false
  } catch (error) {
    console.error('保存疫苗记录失败:', error)
  }
}

// 删除疫苗记录
async function deleteVaccine(id: number) {
  try {
    await vaccineApi.deleteVaccine(id)
    vaccines.value = vaccines.value.filter(v => v.id !== id)
  } catch (error) {
    console.error('删除疫苗记录失败:', error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8">
    <!-- 标签导航 -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        v-for="tab in [
          { key: 'growth', label: '身高体重' },
          { key: 'milestone', label: '发育里程碑' },
          { key: 'vaccine', label: '疫苗记录' },
        ]"
        :key="tab.key"
        @click="activeTab = tab.key as 'growth' | 'milestone' | 'vaccine'"
        class="filter-chip whitespace-nowrap"
        :class="activeTab === tab.key ? 'filter-chip-active' : 'filter-chip-inactive'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" />

    <!-- 身高体重标签 -->
    <template v-else-if="activeTab === 'growth'">
      <!-- 管理员新增按钮 -->
      <div v-if="isLoggedIn" class="mb-4">
        <button @click="openGrowthModal()" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-pink text-white font-medium hover:bg-baby-pink/80 transition-all shadow-md">
          <Plus class="w-4 h-4" /> 添加记录
        </button>
      </div>

      <!-- 成长曲线图表 -->
      <GrowthChart :records="records" />

      <!-- 记录列表 -->
      <div class="mt-6 space-y-3">
        <div v-for="record in records" :key="record.id" class="card flex items-center justify-between">
          <div>
            <p class="text-baby-medium text-sm">{{ record.date }}</p>
            <p class="font-cute text-baby-dark">
              身高: {{ record.height }}cm / 体重: {{ record.weight }}kg
            </p>
            <p v-if="record.note" class="text-baby-medium text-xs mt-1">{{ record.note }}</p>
          </div>
          <div v-if="isLoggedIn" class="flex gap-2">
            <button @click="openGrowthModal(record)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium hover:text-baby-pink transition-all">
              <Edit2 class="w-4 h-4" />
            </button>
            <button @click="deleteGrowth(record.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500 transition-all">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <EmptyState v-if="records.length === 0" message="还没有成长记录" />
      </div>
    </template>

    <!-- 里程碑标签 -->
    <template v-else-if="activeTab === 'milestone'">
      <!-- 分类筛选 -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          v-for="cat in milestoneCategories"
          :key="cat"
          @click="filterMilestones(cat)"
          class="filter-chip"
          :class="milestoneFilter === cat ? 'filter-chip-active' : 'filter-chip-inactive'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- 管理员新增按钮 -->
      <div v-if="isLoggedIn" class="mb-4">
        <button @click="openMilestoneModal()" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-mint text-white font-medium hover:bg-baby-mint/80 transition-all shadow-md">
          <Plus class="w-4 h-4" /> 添加里程碑
        </button>
      </div>

      <!-- 里程碑网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="milestone in filteredMilestones" :key="milestone.id" class="card relative">
          <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2" :class="getCategoryColor(milestone.category)">
            {{ milestone.category }}
          </span>
          <h4 class="font-cute text-lg text-baby-dark">{{ milestone.title }}</h4>
          <p class="text-baby-medium text-sm mt-1">{{ milestone.date }}</p>
          <p v-if="milestone.description" class="text-baby-medium text-xs mt-2">{{ milestone.description }}</p>
          <span :class="milestone.achieved ? 'badge-green' : 'badge-yellow'" class="mt-2">
            {{ milestone.achieved ? '已达成 ✓' : '进行中...' }}
          </span>
          <div v-if="isLoggedIn" class="absolute top-4 right-4 flex gap-1">
            <button @click="openMilestoneModal(milestone)" class="p-1.5 rounded-full hover:bg-baby-pink/20 text-baby-medium hover:text-baby-pink transition-all">
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button @click="deleteMilestone(milestone.id)" class="p-1.5 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500 transition-all">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      <EmptyState v-if="filteredMilestones.length === 0" message="还没有里程碑记录" />
    </template>

    <!-- 疫苗标签 -->
    <template v-else-if="activeTab === 'vaccine'">
      <!-- 管理员新增按钮 -->
      <div v-if="isLoggedIn" class="mb-4">
        <button @click="openVaccineModal()" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-yellow text-yellow-800 font-medium hover:bg-baby-yellow/80 transition-all shadow-md">
          <Plus class="w-4 h-4" /> 添加疫苗记录
        </button>
      </div>

      <!-- 疫苗列表 -->
      <div class="space-y-3">
        <div v-for="vaccine in vaccines" :key="vaccine.id" class="card flex items-center justify-between">
          <div>
            <h4 class="font-cute text-lg text-baby-dark">{{ vaccine.name }}</h4>
            <p class="text-baby-medium text-sm">{{ vaccine.date }}</p>
            <p v-if="vaccine.note" class="text-baby-medium text-xs mt-1">{{ vaccine.note }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span :class="vaccine.status === '已接种' ? 'badge-green' : 'badge-yellow'">
              {{ vaccine.status }}
            </span>
            <div v-if="isLoggedIn" class="flex gap-1">
              <button @click="openVaccineModal(vaccine)" class="p-2 rounded-full hover:bg-baby-pink/20 text-baby-medium hover:text-baby-pink transition-all">
                <Edit2 class="w-4 h-4" />
              </button>
              <button @click="deleteVaccine(vaccine.id)" class="p-2 rounded-full hover:bg-red-100 text-baby-medium hover:text-red-500 transition-all">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <EmptyState v-if="vaccines.length === 0" message="还没有疫苗记录" />
      </div>
    </template>

    <!-- 成长记录模态框 -->
    <Modal :show="showGrowthModal" title="成长记录" @close="showGrowthModal = false">
      <form @submit.prevent="saveGrowth" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
          <input v-model="growthForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">身高 (cm)</label>
            <input v-model.number="growthForm.height" type="number" step="0.1" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">体重 (kg)</label>
            <input v-model.number="growthForm.weight" type="number" step="0.1" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">备注</label>
          <textarea v-model="growthForm.note" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none resize-none" />
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl gradient-pink text-white font-medium hover:opacity-90 transition-all">
          保存
        </button>
      </form>
    </Modal>

    <!-- 里程碑模态框 -->
    <Modal :show="showMilestoneModal" title="里程碑" @close="showMilestoneModal = false">
      <form @submit.prevent="saveMilestone" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">标题</label>
          <input v-model="milestoneForm.title" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">分类</label>
            <select v-model="milestoneForm.category" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none">
              <option value="运动">运动</option>
              <option value="语言">语言</option>
              <option value="认知">认知</option>
              <option value="社交">社交</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
            <input v-model="milestoneForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">描述</label>
          <textarea v-model="milestoneForm.description" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none resize-none" />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="milestoneForm.achieved" type="checkbox" class="w-4 h-4 rounded accent-baby-pink" />
          <label class="text-sm font-medium text-baby-dark">已达成</label>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl gradient-mint text-white font-medium hover:opacity-90 transition-all">
          保存
        </button>
      </form>
    </Modal>

    <!-- 疫苗模态框 -->
    <Modal :show="showVaccineModal" title="疫苗记录" @close="showVaccineModal = false">
      <form @submit.prevent="saveVaccine" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">疫苗名称</label>
          <input v-model="vaccineForm.name" type="text" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
            <input v-model="vaccineForm.date" type="date" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-baby-dark mb-1">状态</label>
            <select v-model="vaccineForm.status" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none">
              <option value="计划中">计划中</option>
              <option value="已接种">已接种</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-baby-dark mb-1">备注</label>
          <textarea v-model="vaccineForm.note" rows="2" class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none resize-none" />
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl gradient-warm text-baby-dark font-medium hover:opacity-90 transition-all">
          保存
        </button>
      </form>
    </Modal>
  </div>
</template>
