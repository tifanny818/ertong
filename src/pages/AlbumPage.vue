<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { albumApi, type Album } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Plus, Image } from 'lucide-vue-next'

const router = useRouter()
const { isLoggedIn } = useAuth()

// 相册数据
const albums = ref<Album[]>([])
const loading = ref(true)

// 加载相册
onMounted(async () => {
  try {
    albums.value = await albumApi.getAlbums()
  } catch {
    albums.value = []
  } finally {
    loading.value = false
  }
})

// 跳转到相册详情
function goToAlbum(id: string) {
  router.push(`/album/${id}`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-cute text-2xl md:text-3xl text-baby-dark flex items-center gap-2">
        📸 相册
        <span class="text-baby-yellow text-sm star-twinkle">★</span>
      </h1>
      <button
        v-if="isLoggedIn"
        class="flex items-center gap-1 px-4 py-2 rounded-full bg-baby-pink text-white font-medium hover:bg-baby-pink/80 transition-all shadow-md"
        @click="router.push('/admin/dashboard')"
      >
        <Plus class="w-4 h-4" /> 新建相册
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <!-- 相册网格 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <div
        v-for="album in albums"
        :key="album.id"
        @click="goToAlbum(album.id)"
        class="card cursor-pointer group"
      >
        <!-- 封面图 -->
        <div class="aspect-square rounded-xl overflow-hidden mb-3 bg-baby-blue/20">
          <img
            v-if="album.cover_url"
            :src="album.cover_url"
            :alt="album.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Image class="w-12 h-12 text-baby-blue/50" />
          </div>
        </div>

        <!-- 相册信息 -->
        <h3 class="font-cute text-lg text-baby-dark group-hover:text-baby-pink transition-colors">
          {{ album.name }}
        </h3>
        <p class="text-baby-medium text-sm">{{ album.photo_count }} 张照片</p>
      </div>
    </div>

    <EmptyState v-if="!loading && albums.length === 0" message="还没有相册" />
  </div>
</template>
