<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { diaryApi, type Diary } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Plus } from 'lucide-vue-next'

const router = useRouter()
const { isLoggedIn } = useAuth()

// 日记数据
const diaries = ref<Diary[]>([])
const loading = ref(true)

// 按月份分组的日记
const groupedDiaries = computed(() => {
  const groups: Record<string, Diary[]> = {}
  diaries.value.forEach(diary => {
    const date = new Date(diary.date)
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`
    if (!groups[key]) groups[key] = []
    groups[key].push(diary)
  })
  // 按日期降序排列
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })
  return groups
})

// 加载日记
onMounted(async () => {
  try {
    diaries.value = await diaryApi.getDiaries()
  } catch {
    diaries.value = []
  } finally {
    loading.value = false
  }
})

// 跳转到日记详情
function goToDiary(id: number) {
  router.push(`/diary/${id}`)
}

// 截取内容预览
function preview(content: string, length = 80): string {
  // 去除 HTML 标签
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > length ? text.slice(0, length) + '...' : text
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-cute text-2xl md:text-3xl text-baby-dark flex items-center gap-2">
        📖 成长日记
        <span class="text-baby-lavender text-sm star-twinkle">★</span>
      </h1>
      <button
        v-if="isLoggedIn"
        class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-lavender text-white font-medium hover:bg-baby-lavender/80 transition-all shadow-md"
        @click="router.push('/admin/dashboard')"
      >
        <Plus class="w-4 h-4" /> 写日记
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else>
      <!-- 按月份分组的日记列表 -->
      <div v-for="(group, month) in groupedDiaries" :key="month" class="mb-8">
        <h2 class="font-cute text-xl text-baby-dark mb-4 flex items-center gap-2">
          📅 {{ month }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="diary in group"
            :key="diary.id"
            @click="goToDiary(diary.id)"
            class="card cursor-pointer group"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-baby-medium text-xs mb-1">{{ diary.date }}</p>
                <h3 class="font-cute text-lg text-baby-dark group-hover:text-baby-pink transition-colors">
                  {{ diary.title }}
                </h3>
                <p class="text-baby-medium text-sm mt-1">{{ preview(diary.content) }}</p>
              </div>
              <span class="text-baby-pink/40 text-2xl ml-4">📖</span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-if="diaries.length === 0" message="还没有日记" />
    </template>
  </div>
</template>
