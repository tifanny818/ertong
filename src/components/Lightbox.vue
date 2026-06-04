<script setup lang="ts">
import { watch } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'

// 属性
const props = defineProps<{
  photos: { url: string; caption?: string }[]
  currentIndex: number
}>()

// 事件
const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

// 监听键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') emit('prev')
  if (e.key === 'ArrowRight') emit('next')
}

watch(() => props.currentIndex, () => {
  document.addEventListener('keydown', handleKeydown)
}, { immediate: true })
</script>

<template>
  <teleport to="body">
    <transition name="lightbox">
      <div
        v-if="currentIndex >= 0 && photos.length > 0"
        class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        @click.self="emit('close')"
      >
        <!-- 关闭按钮 -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- 上一张 -->
        <button
          v-if="photos.length > 1"
          @click="emit('prev')"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>

        <!-- 当前照片 -->
        <div class="max-w-[90vw] max-h-[85vh] flex flex-col items-center">
          <img
            :src="photos[currentIndex]?.url"
            :alt="photos[currentIndex]?.caption || ''"
            class="max-w-full max-h-[75vh] object-contain rounded-lg"
          />
          <p
            v-if="photos[currentIndex]?.caption"
            class="text-white/80 text-sm mt-3"
          >
            {{ photos[currentIndex].caption }}
          </p>
          <p class="text-white/50 text-xs mt-1">
            {{ currentIndex + 1 }} / {{ photos.length }}
          </p>
        </div>

        <!-- 下一张 -->
        <button
          v-if="photos.length > 1"
          @click="emit('next')"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
