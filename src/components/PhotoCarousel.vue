<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

// 照片属性
const props = defineProps<{
  photos: { url: string; caption?: string }[]
}>()

// 当前索引
const currentIndex = ref(0)

// 自动播放定时器
let autoPlayTimer: ReturnType<typeof setInterval> | null = null

// 上一张
function prev() {
  currentIndex.value = currentIndex.value > 0
    ? currentIndex.value - 1
    : props.photos.length - 1
  resetAutoPlay()
}

// 下一张
function next() {
  currentIndex.value = currentIndex.value < props.photos.length - 1
    ? currentIndex.value + 1
    : 0
  resetAutoPlay()
}

// 跳转到指定索引
function goTo(index: number) {
  currentIndex.value = index
  resetAutoPlay()
}

// 重置自动播放
function resetAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
  startAutoPlay()
}

// 开始自动播放
function startAutoPlay() {
  if (props.photos.length <= 1) return
  autoPlayTimer = setInterval(next, 4000)
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
})
</script>

<template>
  <div class="card relative overflow-hidden" v-if="photos.length > 0">
    <!-- 照片容器 -->
    <div class="relative aspect-[16/9] rounded-xl overflow-hidden">
      <!-- 照片列表 -->
      <transition-group name="fade">
        <img
          v-for="(photo, index) in photos"
          :key="photo.url"
          v-show="index === currentIndex"
          :src="photo.url"
          :alt="photo.caption || ''"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </transition-group>

      <!-- 左右切换按钮 -->
      <button
        v-if="photos.length > 1"
        @click="prev"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-baby-dark hover:bg-white transition-all shadow-md"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      <button
        v-if="photos.length > 1"
        @click="next"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-baby-dark hover:bg-white transition-all shadow-md"
      >
        <ChevronRight class="w-4 h-4" />
      </button>

      <!-- 标题 -->
      <div
        v-if="photos[currentIndex]?.caption"
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4"
      >
        <p class="text-white text-sm">{{ photos[currentIndex].caption }}</p>
      </div>
    </div>

    <!-- 指示点 -->
    <div v-if="photos.length > 1" class="flex justify-center gap-1.5 mt-3">
      <button
        v-for="(_, index) in photos"
        :key="index"
        @click="goTo(index)"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="index === currentIndex ? 'bg-baby-pink w-6' : 'bg-baby-pink/40'"
      />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
