<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { diaryApi, type Diary } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ArrowLeft, Edit2, Trash2, Bold, Italic, List } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

// 日记数据
const diary = ref<Diary | null>(null)
const loading = ref(true)
const isEditing = ref(false)

// 编辑表单
const editForm = ref({ title: '', content: '', date: '' })

// 获取日记ID
const diaryId = Number(route.params.id)

// 加载日记
onMounted(async () => {
  try {
    diary.value = await diaryApi.getDiary(diaryId)
  } catch {
    diary.value = null
  } finally {
    loading.value = false
  }
})

// 开始编辑
function startEdit() {
  if (!diary.value) return
  editForm.value = {
    title: diary.value.title,
    content: diary.value.content,
    date: diary.value.date,
  }
  isEditing.value = true
}

// 保存编辑
async function saveEdit() {
  try {
    const result = await diaryApi.updateDiary(diaryId, editForm.value)
    diary.value = result
    isEditing.value = false
  } catch (error) {
    console.error('保存日记失败:', error)
  }
}

// 删除日记
async function deleteDiary() {
  if (!confirm('确定要删除这篇日记吗？')) return
  try {
    await diaryApi.deleteDiary(diaryId)
    router.push('/diary')
  } catch (error) {
    console.error('删除日记失败:', error)
  }
}

// 插入格式
function insertFormat(type: 'bold' | 'italic' | 'list') {
  const contentEl = document.querySelector('[contenteditable="true"]')
  if (!contentEl) return

  let html = ''
  switch (type) {
    case 'bold':
      html = '<b>粗体文字</b>'
      break
    case 'italic':
      html = '<i>斜体文字</i>'
      break
    case 'list':
      html = '<ul><li>列表项</li></ul>'
      break
  }
  document.execCommand('insertHTML', false, html)
}

// 更新 contenteditable 内容
function updateContent(event: Event) {
  const el = event.target as HTMLElement
  editForm.value.content = el.innerHTML
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
    <!-- 返回按钮 -->
    <button @click="router.push('/diary')" class="flex items-center gap-1 text-baby-medium hover:text-baby-pink transition-colors mb-4">
      <ArrowLeft class="w-4 h-4" /> 返回日记列表
    </button>

    <LoadingSpinner v-if="loading" />

    <EmptyState v-else-if="!diary" message="日记不存在" />

    <template v-else>
      <!-- 编辑模式 -->
      <template v-if="isEditing">
        <div class="card">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">标题</label>
              <input
                v-model="editForm.title"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">日期</label>
              <input
                v-model="editForm.date"
                type="date"
                class="w-full px-4 py-2 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-baby-dark mb-1">内容</label>
              <!-- 格式工具栏 -->
              <div class="flex gap-1 mb-2">
                <button @click="insertFormat('bold')" class="p-2 rounded-lg hover:bg-baby-pink/20 text-baby-medium" title="粗体">
                  <Bold class="w-4 h-4" />
                </button>
                <button @click="insertFormat('italic')" class="p-2 rounded-lg hover:bg-baby-pink/20 text-baby-medium" title="斜体">
                  <Italic class="w-4 h-4" />
                </button>
                <button @click="insertFormat('list')" class="p-2 rounded-lg hover:bg-baby-pink/20 text-baby-medium" title="列表">
                  <List class="w-4 h-4" />
                </button>
              </div>
              <div
                contenteditable="true"
                v-html="editForm.content"
                @input="updateContent"
                class="w-full min-h-[200px] px-4 py-3 rounded-xl border border-baby-pink/30 focus:border-baby-pink focus:ring-1 focus:ring-baby-pink outline-none prose prose-sm max-w-none"
              ></div>
            </div>
            <div class="flex gap-3">
              <button @click="saveEdit" class="flex-1 py-2.5 rounded-xl gradient-pink text-white font-medium hover:opacity-90 transition-all">
                保存
              </button>
              <button @click="isEditing = false" class="flex-1 py-2.5 rounded-xl bg-gray-100 text-baby-medium font-medium hover:bg-gray-200 transition-all">
                取消
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 查看模式 -->
      <template v-else>
        <article class="card">
          <!-- 日期和标题 -->
          <p class="text-baby-medium text-sm mb-2">{{ diary.date }}</p>
          <h1 class="font-cute text-2xl md:text-3xl text-baby-dark mb-6">{{ diary.title }}</h1>

          <!-- 日记内容 -->
          <div class="prose prose-sm max-w-none text-baby-dark" v-html="diary.content"></div>

          <!-- 管理员操作按钮 -->
          <div v-if="isLoggedIn" class="flex gap-3 mt-8 pt-4 border-t border-baby-pink/20">
            <button @click="startEdit" class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-pink/20 text-baby-pink font-medium hover:bg-baby-pink/30 transition-all">
              <Edit2 class="w-4 h-4" /> 编辑
            </button>
            <button @click="deleteDiary" class="flex items-center gap-1 px-4 py-2 rounded-full bg-red-100 text-red-500 font-medium hover:bg-red-200 transition-all">
              <Trash2 class="w-4 h-4" /> 删除
            </button>
          </div>
        </article>
      </template>
    </template>
  </div>
</template>
