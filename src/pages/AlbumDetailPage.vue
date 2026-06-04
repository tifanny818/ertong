<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { albumApi, type Album, type Photo } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import Lightbox from '@/components/Lightbox.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Upload, Trash2, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

// 相册和照片数据
const album = ref<Album | null>(null)
const photos = ref<Photo[]>([])
const loading = ref(true)

// 灯箱状态
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

// 获取相册ID
const albumId = route.params.id as string

// 加载数据
onMounted(async () => {
  try {
    const [albumData, photosData] = await Promise.all([
      albumApi.getAlbums().then(albums => albums.find(a => String(a.id) === albumId) || null),
      albumApi.getPhotos(albumId).catch(() => []),
    ])
    album.value = albumData
    photos.value = photosData
  } finally {
    loading.value = false
  }
})

// 打开灯箱
function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

// 灯箱上一张
function lightboxPrev() {
  lightboxIndex.value = lightboxIndex.value > 0 ? lightboxIndex.value - 1 : photos.value.length - 1
}

// 灯箱下一张
function lightboxNext() {
  lightboxIndex.value = lightboxIndex.value < photos.value.length - 1 ? lightboxIndex.value + 1 : 0
}

// 上传照片
async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  try {
    const newPhotos = await albumApi.uploadPhotos(albumId, Array.from(input.files))
    photos.value.push(...newPhotos)
  } catch (error) {
    console.error('上传照片失败:', error)
  }
}

// 删除照片
async function deletePhoto(photoId: string) {
  try {
    await albumApi.deletePhoto(albumId, photoId)
    photos.value = photos.value.filter(p => p.id !== photoId)
  } catch (error) {
    console.error('删除照片失败:', error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8">
    <!-- 返回按钮 -->
    <button @click="router.push('/album')" class="flex items-center gap-1 text-baby-medium hover:text-baby-pink transition-colors mb-4">
      <ArrowLeft class="w-4 h-4" /> 返回相册
    </button>

    <LoadingSpinner v-if="loading" />

    <template v-else>
      <!-- 相册头部 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-cute text-2xl md:text-3xl text-baby-dark">{{ album?.name || '相册' }}</h1>
          <p v-if="album?.description" class="text-baby-medium text-sm mt-1">{{ album.description }}</p>
        </div>

        <!-- 管理员上传按钮 -->
        <label
          v-if="isLoggedIn"
          class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-pink text-white font-medium hover:bg-baby-pink/80 transition-all shadow-md cursor-pointer"
        >
          <Upload class="w-4 h-4" /> 上传照片
          <input type="file" multiple accept="image/*" class="hidden" @change="handleUpload" />
        </label>
      </div>

      <!-- 照片网格 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="photo-grid-item aspect-square relative group"
          @click="openLightbox(index)"
        >
          <img :src="photo.url" :alt="photo.caption || ''" class="w-full h-full object-cover" />

          <!-- 悬停遮罩 -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <p v-if="photo.caption" class="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
              {{ photo.caption }}
            </p>
          </div>

          <!-- 管理员删除按钮 -->
          <button
            v-if="isLoggedIn"
            @click.stop="deletePhoto(photo.id)"
            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <EmptyState v-if="photos.length === 0" message="还没有照片" />
    </template>

    <!-- 灯箱 -->
    <Lightbox
      v-if="lightboxOpen"
      :photos="photos.map(p => ({ url: p.url, caption: p.caption }))"
      :current-index="lightboxIndex"
      @close="lightboxOpen = false"
      @prev="lightboxPrev"
      @next="lightboxNext"
    />
  </div>
</template>
