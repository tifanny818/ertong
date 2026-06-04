<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { babyApi, timelineApi, albumApi, milestoneApi, vaccineApi, growthApi, type Baby, type TimelineEvent } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()

// 数据状态
const baby = ref<Baby | null>(null)
const events = ref<TimelineEvent[]>([])
const milestones = ref<any[]>([])
const vaccines = ref<any[]>([])
const growthRecords = ref<any[]>([])
const featuredPhotos = ref<{ url: string; caption?: string }[]>([])
const albums = ref<any[]>([])
const loading = ref(true)

// 功能卡片
const featureCards = [
  { icon: '📖', label: '今日记录', color: 'bg-baby-yellow/20', link: '/diary' },
  { icon: '🏆', label: '里程碑', color: 'bg-baby-pink/20', link: '/milestones' },
  { icon: '💉', label: '健康档案', color: 'bg-baby-mint/20', link: '/vaccines' },
]

// 加载数据
onMounted(async () => {
  try {
    const [babyData, eventsData, albumsData, milestonesData, vaccinesData, growthData] = await Promise.all([
      babyApi.getBaby().catch(() => null),
      timelineApi.getEvents().catch(() => []),
      albumApi.getAlbums().catch(() => []),
      milestoneApi.getMilestones().catch(() => []),
      vaccineApi.getVaccines().catch(() => []),
      growthApi.getRecords().catch(() => []),
    ])

    baby.value = babyData
    events.value = eventsData
    milestones.value = milestonesData
    vaccines.value = vaccinesData
    growthRecords.value = growthData
    albums.value = albumsData

    // 获取特色照片（取第一个相册的照片，最多4张）
    if (albumsData.length > 0) {
      try {
        const photos = await albumApi.getPhotos(albumsData[0].id)
        featuredPhotos.value = photos.slice(0, 4).map(p => ({ url: p.url, caption: p.caption }))
      } catch {
        featuredPhotos.value = []
      }
    }
  } finally {
    loading.value = false
  }
})

// 导航
function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="px-4 md:px-8 py-6 space-y-6">
    <!-- 加载状态 -->
    <div v-if="loading">
      <LoadingSpinner />
    </div>

    <template v-else>
      <!-- 顶部区域：Banner + 功能卡片 -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 中间：Banner 横幅 -->
        <div class="flex-1 card relative overflow-hidden" style="background: linear-gradient(135deg, #FFF8E7 0%, #FFE8D6 100%);">
          <!-- 底部蓝色波浪装饰 -->
          <svg class="absolute bottom-0 left-0 w-full h-16 opacity-25" viewBox="0 0 600 60" preserveAspectRatio="none">
            <path d="M0,30 C100,5 200,55 300,30 C400,5 500,55 600,30 L600,60 L0,60 Z" fill="#87CEEB"/>
            <path d="M0,40 C150,15 250,50 300,40 C350,30 450,45 600,40 L600,60 L0,60 Z" fill="#B0E0E6"/>
          </svg>

          <!-- 云朵 -->
          <svg class="absolute top-3 left-8 w-16 h-8 opacity-50" viewBox="0 0 80 40">
            <ellipse cx="25" cy="22" rx="18" ry="12" fill="white"/>
            <ellipse cx="45" cy="18" rx="14" ry="13" fill="white"/>
            <ellipse cx="58" cy="24" rx="12" ry="9" fill="white"/>
          </svg>
          <svg class="absolute top-1 right-16 w-12 h-6 opacity-35" viewBox="0 0 60 30">
            <ellipse cx="20" cy="17" rx="15" ry="10" fill="white"/>
            <ellipse cx="35" cy="14" rx="12" ry="11" fill="white"/>
            <ellipse cx="48" cy="18" rx="10" ry="8" fill="white"/>
          </svg>

          <!-- 彩虹 -->
          <svg class="absolute top-3 right-8 w-20 h-10 opacity-60" viewBox="0 0 80 40">
            <path d="M5,35 A35,35 0 0,1 75,35" stroke="#FF6B6B" stroke-width="3" fill="none"/>
            <path d="M10,35 A30,30 0 0,1 70,35" stroke="#FFB347" stroke-width="2.5" fill="none"/>
            <path d="M15,35 A25,25 0 0,1 65,35" stroke="#FFD700" stroke-width="2.5" fill="none"/>
            <path d="M20,35 A20,20 0 0,1 60,35" stroke="#87CEEB" stroke-width="2.5" fill="none"/>
          </svg>

          <!-- 星星 -->
          <svg class="absolute top-14 left-14 w-5 h-5 opacity-70 star-twinkle" viewBox="0 0 20 20">
            <path d="M10 1L12 8L20 8L14 13L16 20L10 16L4 20L6 13L0 8L8 8Z" fill="#FFD700"/>
          </svg>
          <svg class="absolute top-8 right-28 w-3 h-3 opacity-55 star-twinkle" style="animation-delay: 0.7s;" viewBox="0 0 20 20">
            <path d="M10 1L12 8L20 8L14 13L16 20L10 16L4 20L6 13L0 8L8 8Z" fill="#FFD700"/>
          </svg>
          <svg class="absolute top-22 left-1/3 w-4 h-4 opacity-50 star-twinkle" style="animation-delay: 1.2s;" viewBox="0 0 20 20">
            <path d="M10 1L12 8L20 8L14 13L16 20L10 16L4 20L6 13L0 8L8 8Z" fill="#FFD700"/>
          </svg>
          <svg class="absolute top-6 left-1/2 w-3 h-3 opacity-40 star-twinkle" style="animation-delay: 0.3s;" viewBox="0 0 20 20">
            <path d="M10 1L12 8L20 8L14 13L16 20L10 16L4 20L6 13L0 8L8 8Z" fill="#FFD700"/>
          </svg>

          <!-- 小花 -->
          <svg class="absolute bottom-14 left-10 w-8 h-8 opacity-60" viewBox="0 0 32 32">
            <circle cx="16" cy="10" r="5" fill="#FF9AA2"/>
            <circle cx="10" cy="15" r="5" fill="#FF9AA2"/>
            <circle cx="22" cy="15" r="5" fill="#FF9AA2"/>
            <circle cx="16" cy="20" r="5" fill="#FF9AA2"/>
            <circle cx="16" cy="15" r="3" fill="#FFD700"/>
            <line x1="16" y1="25" x2="16" y2="32" stroke="#8BC34A" stroke-width="2"/>
          </svg>
          <svg class="absolute bottom-10 right-20 w-6 h-6 opacity-50" viewBox="0 0 26 26">
            <circle cx="13" cy="8" r="4" fill="#87CEEB"/>
            <circle cx="8" cy="12" r="4" fill="#87CEEB"/>
            <circle cx="18" cy="12" r="4" fill="#87CEEB"/>
            <circle cx="13" cy="16" r="4" fill="#87CEEB"/>
            <circle cx="13" cy="12" r="2.5" fill="#FFD700"/>
            <line x1="13" y1="20" x2="13" y2="26" stroke="#8BC34A" stroke-width="1.5"/>
          </svg>

          <div class="flex flex-col items-center justify-center py-8 px-6 relative z-10">
            <!-- 标题 -->
            <h1 class="font-cute text-xl md:text-2xl mb-4 text-center" style="color: #E86C3F;">
              <span style="color: #FF6B8A;">{{ baby?.name || '小宝贝' }}</span>的成长时光
            </h1>

            <!-- 一家四口手牵手插画 -->
            <svg viewBox="0 0 400 160" class="w-full max-w-lg h-auto mb-3" fill="none">
              <!-- 爸爸 -->
              <g transform="translate(70, 15)">
                <path d="M18 22 Q22 10 32 14 Q42 10 46 22" fill="#5B4A6A"/>
                <circle cx="32" cy="28" r="16" fill="#FFD6E0"/>
                <circle cx="26" cy="26" r="2" fill="#5B4A6A"/>
                <circle cx="38" cy="26" r="2" fill="#5B4A6A"/>
                <circle cx="21" cy="31" r="2.5" fill="#FFB6C1" opacity="0.5"/>
                <circle cx="43" cy="31" r="2.5" fill="#FFB6C1" opacity="0.5"/>
                <path d="M28 33 Q32 37 36 33" stroke="#5B4A6A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <rect x="22" y="45" width="20" height="26" rx="10" fill="#F5A623"/>
                <circle cx="42" cy="55" r="3.5" fill="#FFD6E0"/>
                <circle cx="22" cy="55" r="3.5" fill="#FFD6E0"/>
                <path d="M42 55 Q50 60 54 64" stroke="#FFD6E0" stroke-width="5" stroke-linecap="round" fill="none"/>
                <rect x="22" y="71" width="7" height="20" rx="3.5" fill="#8B6F47"/>
                <rect x="35" y="71" width="7" height="20" rx="3.5" fill="#8B6F47"/>
                <circle cx="25.5" cy="94" r="4" fill="#5B4A6A"/>
                <circle cx="38.5" cy="94" r="4" fill="#5B4A6A"/>
              </g>

              <!-- 儿子 -->
              <g transform="translate(145, 48)">
                <path d="M10 16 Q13 7 17 11 Q21 7 24 16" fill="#8B6F47"/>
                <circle cx="17" cy="20" r="12" fill="#FFD6E0"/>
                <circle cx="12" cy="18" r="1.5" fill="#5B4A6A"/>
                <circle cx="22" cy="18" r="1.5" fill="#5B4A6A"/>
                <circle cx="8" cy="22" r="2" fill="#FFB6C1" opacity="0.5"/>
                <circle cx="26" cy="22" r="2" fill="#FFB6C1" opacity="0.5"/>
                <path d="M13 24 Q17 28 21 24" stroke="#5B4A6A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                <rect x="11" y="33" width="12" height="15" rx="6" fill="#7EB8DA"/>
                <rect x="9" y="36" width="16" height="12" rx="4" fill="#5B9BD5" opacity="0.6"/>
                <circle cx="23" cy="40" r="2.5" fill="#FFD6E0"/>
                <circle cx="11" cy="40" r="2.5" fill="#FFD6E0"/>
                <path d="M23 40 Q26 43 28 45" stroke="#FFD6E0" stroke-width="4" stroke-linecap="round" fill="none"/>
                <rect x="11" y="48" width="4" height="11" rx="2" fill="#E8A87C"/>
                <rect x="19" y="48" width="4" height="11" rx="2" fill="#E8A87C"/>
                <circle cx="13" cy="61" r="2.5" fill="#7EB8DA"/>
                <circle cx="21" cy="61" r="2.5" fill="#7EB8DA"/>
              </g>

              <!-- 女儿 -->
              <g transform="translate(200, 48)">
                <path d="M10 16 Q13 7 17 11 Q21 7 24 16" fill="#8B6F47"/>
                <circle cx="17" cy="10" r="3.5" fill="#5B4A6A"/>
                <circle cx="17" cy="10" r="2.5" fill="#8B6F47"/>
                <circle cx="17" cy="20" r="12" fill="#FFD6E0"/>
                <circle cx="12" cy="18" r="1.5" fill="#5B4A6A"/>
                <circle cx="22" cy="18" r="1.5" fill="#5B4A6A"/>
                <circle cx="8" cy="22" r="2" fill="#FFB6C1" opacity="0.5"/>
                <circle cx="26" cy="22" r="2" fill="#FFB6C1" opacity="0.5"/>
                <path d="M13 24 Q17 28 21 24" stroke="#5B4A6A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                <rect x="11" y="33" width="12" height="15" rx="6" fill="#FFB347"/>
                <path d="M9 38 Q17 41 25 38 L27 48 Q17 50 7 48 Z" fill="#FFB347"/>
                <circle cx="25" cy="40" r="2.5" fill="#FFD6E0"/>
                <circle cx="11" cy="40" r="2.5" fill="#FFD6E0"/>
                <path d="M11 40 Q7 43 5 45" stroke="#FFD6E0" stroke-width="4" stroke-linecap="round" fill="none"/>
                <rect x="12" y="48" width="3.5" height="9" rx="1.7" fill="#E8A87C"/>
                <rect x="18.5" y="48" width="3.5" height="9" rx="1.7" fill="#E8A87C"/>
                <circle cx="13.7" cy="59" r="2.5" fill="#FFB347"/>
                <circle cx="20.2" cy="59" r="2.5" fill="#FFB347"/>
              </g>

              <!-- 妈妈 -->
              <g transform="translate(265, 15)">
                <path d="M13 20 Q16 8 32 13 Q48 8 51 20 Q54 28 51 32 Q48 26 46 24" fill="#5B4A6A"/>
                <circle cx="32" cy="28" r="16" fill="#FFD6E0"/>
                <circle cx="26" cy="26" r="2" fill="#5B4A6A"/>
                <circle cx="38" cy="26" r="2" fill="#5B4A6A"/>
                <circle cx="21" cy="31" r="2.5" fill="#FFB6C1" opacity="0.5"/>
                <circle cx="43" cy="31" r="2.5" fill="#FFB6C1" opacity="0.5"/>
                <path d="M28 33 Q32 37 36 33" stroke="#5B4A6A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <rect x="22" y="45" width="20" height="26" rx="10" fill="#FF9A8B"/>
                <path d="M19 58 Q32 61 45 58 L48 72 Q32 74 16 72 Z" fill="#FF9A8B"/>
                <circle cx="42" cy="55" r="3.5" fill="#FFD6E0"/>
                <circle cx="22" cy="55" r="3.5" fill="#FFD6E0"/>
                <path d="M22 55 Q15 60 9 64" stroke="#FFD6E0" stroke-width="5" stroke-linecap="round" fill="none"/>
                <rect x="25" y="72" width="5" height="17" rx="2.5" fill="#E8A87C"/>
                <rect x="34" y="72" width="5" height="17" rx="2.5" fill="#E8A87C"/>
                <circle cx="27.5" cy="92" r="3.5" fill="#FF9A8B"/>
                <circle cx="36.5" cy="92" r="3.5" fill="#FF9A8B"/>
              </g>
            </svg>

            <!-- 小花装饰 -->
            <div class="flex justify-center gap-10 text-base opacity-60">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- 右侧：功能卡片区 -->
        <div class="lg:w-72 card" style="background: linear-gradient(180deg, #FFF8E7 0%, #FFF5EE 100%);">
          <h3 class="font-cute text-lg text-baby-dark mb-4 text-center">功能卡片区</h3>
          <div class="space-y-3">
            <div
              v-for="card in featureCards"
              :key="card.label"
              @click="goTo(card.link)"
              class="flex items-center gap-3 p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all shadow-sm"
              style="background: rgba(255, 255, 255, 0.7);"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="card.color">
                {{ card.icon }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-baby-dark">{{ card.label }}</div>
              </div>
              <div class="text-baby-medium">›</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部区域：相册预览 + 成长时间轴 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左侧：相册预览区 -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-cute text-lg text-baby-dark">相册预览区</h3>
            <span class="text-sm text-baby-medium cursor-pointer hover:text-baby-pink transition-colors">最近上传 ›</span>
          </div>
          <div v-if="featuredPhotos.length > 0" class="grid grid-cols-4 gap-3">
            <div
              v-for="(photo, i) in featuredPhotos"
              :key="i"
              class="rounded-xl overflow-hidden aspect-square bg-baby-pink/5 cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                v-if="photo.url"
                :src="photo.url"
                :alt="photo.caption || ''"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-baby-medium text-sm">
                📷
              </div>
            </div>
          </div>
          <div v-else class="grid grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="rounded-xl aspect-square bg-baby-pink/5 flex items-center justify-center">
              <span class="text-baby-medium text-sm">📷</span>
            </div>
          </div>
        </div>

        <!-- 右侧：成长时间轴 -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-cute text-lg text-baby-dark">成长时间轴</h3>
            <span class="text-baby-medium cursor-pointer hover:text-baby-pink transition-colors">›</span>
          </div>
          
          <div class="flex items-center justify-between px-2">
            <!-- 出生 -->
            <div class="flex flex-col items-center relative">
              <div class="w-12 h-12 rounded-full bg-baby-pink/20 flex items-center justify-center text-xl mb-2 relative z-10">
                
              </div>
              <div class="w-6 h-6 rounded-full bg-baby-yellow/30 flex items-center justify-center text-xs mb-1 relative z-10">
                
              </div>
              <div class="text-xs text-baby-dark font-medium">出生</div>
            </div>

            <!-- 连接线 1 -->
            <div class="flex-1 mx-1 h-0.5 bg-baby-pink/20 relative -mt-8">
              <div class="w-3 h-3 rounded-full bg-baby-pink absolute -top-1 left-0"></div>
            </div>

            <!-- 学步 -->
            <div class="flex flex-col items-center relative">
              <div class="w-12 h-12 rounded-full bg-baby-yellow/20 flex items-center justify-center text-xl mb-2 relative z-10">
                👣
              </div>
              <div class="w-6 h-6 rounded-full bg-baby-yellow/30 flex items-center justify-center text-xs mb-1 relative z-10">
                🍞
              </div>
              <div class="text-xs text-baby-dark font-medium">学步</div>
            </div>

            <!-- 连接线 2 -->
            <div class="flex-1 mx-1 h-0.5 bg-baby-mint/20 relative -mt-8">
              <div class="w-3 h-3 rounded-full bg-baby-yellow absolute -top-1 right-0"></div>
            </div>

            <!-- 入园 -->
            <div class="flex flex-col items-center relative">
              <div class="w-12 h-12 rounded-full bg-baby-mint/20 flex items-center justify-center text-xl mb-2 relative z-10">
                🏫
              </div>
              <div class="w-6 h-6 rounded-full bg-baby-mint/30 flex items-center justify-center text-xs mb-1 relative z-10">
                🎨
              </div>
              <div class="text-xs text-baby-dark font-medium">入园</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近动态 -->
      <section v-if="events.length > 0">
        <h2 class="font-cute text-lg text-baby-dark mb-3">✨ 最近动态</h2>
        <div class="card flex gap-4 overflow-x-auto pb-2">
          <div
            v-for="event in events.slice(0, 6)"
            :key="event.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-baby-pink/5 min-w-[200px] flex-shrink-0"
          >
            <div class="w-10 h-10 rounded-full bg-baby-pink/15 flex items-center justify-center text-lg flex-shrink-0">
              🌟
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-baby-dark truncate">{{ event.title }}</p>
              <p class="text-xs text-baby-medium">{{ event.date }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
